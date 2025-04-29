const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const { connectRabbitMQ, sendToQueue } = require('./rabbitmq/producer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database connection pools
const replicas = process.env.DB_REPLICAS ? process.env.DB_REPLICAS.split(',') : [];

// Primary pool for writes
const primaryPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

// Replica pool selector
const getReplicaPool = () => {
    if (replicas.length === 0) return primaryPool;
    const replicaHost = replicas[Math.floor(Math.random() * replicas.length)].trim();
    return new Pool({
        user: process.env.DB_USER,
        host: replicaHost,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10),
    });
};

// Unified query function with read/write separation
async function query(sql, params, isWrite = false) {
    const pool = isWrite ? primaryPool : getReplicaPool();
    try {
        return await pool.query(sql, params);
    } catch (err) {
        console.error(`Database error (${isWrite ? 'write' : 'read'}):`, err);
        if (!isWrite) {
            // Fallback to primary if replica fails
            return primaryPool.query(sql, params);
        }
        throw err;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        instanceId: process.env.INSTANCE_ID || 'standalone',
        timestamp: new Date().toISOString(),
        dbReplicas: replicas
    });
});

// Check DB connection
primaryPool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to primary database:', err);
    } else {
        console.log('Primary database connected successfully:', res.rows[0].now);
    }
});

// Connect to RabbitMQ
connectRabbitMQ();

// ROUTES

app.get('/api/profiles', async (req, res) => {
    try {
        const result = await query('SELECT * FROM profiles', [], false); // Read operation
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

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

app.post('/api/profiles/:id/sections', async (req, res) => {
    const { id } = req.params;
    const { type, title, description } = req.body;
    try {
        const result = await query(
            'INSERT INTO sections (profile_id, type, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, type, title, description],
            true // Write operation
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/api/profiles/:id/photo', async (req, res) => {
    const { id } = req.params;
    const { photo_url } = req.body;
    try {
        const result = await query(
            'UPDATE profiles SET photo_url = $1 WHERE id = $2 RETURNING *',
            [photo_url, id],
            true // Write operation
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/api/tasks', async (req, res) => {
    const { userId, action } = req.body;
    const task = {
        userId,
        action,
        timestamp: new Date().toISOString(),
    };

    try {
        await sendToQueue(task);
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

// Start server
app.listen(port, () => {
    console.log(`Server instance ${process.env.INSTANCE_ID || 'standalone'} running on http://localhost:${port}`);
});
