// Parse replicas from environment variables (if any)
const replicas = process.env.DB_REPLICAS ? process.env.DB_REPLICAS.split(',') : [];

// Create a pool for the primary (write) database
const primaryPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

// Function to get a connection to a replica (or primary if none)
const getReplicaPool = () => {
    if (replicas.length === 0) return primaryPool; // Fallback to primary
    const replicaHost = replicas[Math.floor(Math.random() * replicas.length)].trim(); // Pick one randomly
    return new Pool({
        user: process.env.DB_USER,
        host: replicaHost,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10),
    });
};

// Unified query function for reads and writes
// This function determines whether to use the primary DB or a replica based on the type of operation (write or read)
// - If it's a write operation, the primary DB pool is used
// - If it's a read operation and there are replicas defined, a replica is randomly selected
// - If a read from replica fails, it retries the query on the primary pool to ensure high availability
async function query(sql, params, isWrite = false) {
    const pool = isWrite ? primaryPool : getReplicaPool();
    try {
        return await pool.query(sql, params); // Execute the query
    } catch (err) {
        console.error(`Database error (${isWrite ? 'write' : 'read'}):`, err);
        if (!isWrite) {
            // Retry on primary if replica fails
            return primaryPool.query(sql, params);
        }
        throw err;
    }
}

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        instanceId: process.env.INSTANCE_ID || 'standalone',
        timestamp: new Date().toISOString(),
        dbReplicas: replicas
    });
});

// Test connection to primary DB on startup
primaryPool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to primary database:', err);
    } else {
        console.log('Primary database connected successfully:', res.rows[0].now);
    }
});

// Connect to RabbitMQ
connectRabbitMQ();

// GET all profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const result = await query('SELECT * FROM profiles', [], false); // Read query
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET a single profile by ID
app.get('/api/profiles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('SELECT * FROM profiles WHERE id = $1', [id], false);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST: Add a new section to a profile
app.post('/api/profiles/:id/sections', async (req, res) => {
    const { id } = req.params;
    const { type, title, description } = req.body;
    try {
        const result = await query(
            'INSERT INTO sections (profile_id, type, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, type, title, description],
            true // Write query
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST: Update profile photo
app.post('/api/profiles/:id/photo', async (req, res) => {
    const { id } = req.params;
    const { photo_url } = req.body;
    try {
        const result = await query(
            'UPDATE profiles SET photo_url = $1 WHERE id = $2 RETURNING *',
            [photo_url, id],
            true // Write query
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST: Queue a background task
app.post('/api/tasks', async (req, res) => {
    const { userId, action } = req.body;
    const task = {
        userId,
        action,
        timestamp: new Date().toISOString(),
    };

    try {
        await sendToQueue(task); // Send task to RabbitMQ
        res.status(202).json({ 
            message: 'Task queued successfully', 
            task,
            instanceId: process.env.INSTANCE_ID || 'standalone'
        });
    } catch (err) {
        console.error('Failed to queue task:', err);
        res.status(500).json({ error: 'Failed to queue task' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server instance ${process.env.INSTANCE_ID || 'standalone'} running on http://localhost:${port}`);
});
