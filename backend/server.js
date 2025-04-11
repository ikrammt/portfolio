const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path'); 
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully:', res.rows[0].now);
    }
});

app.get('/api/profiles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM profiles');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/profiles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
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
        const result = await pool.query(
            'INSERT INTO sections (profile_id, type, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, type, title, description]
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
        const result = await pool.query(
            'UPDATE profiles SET photo_url = $1 WHERE id = $2 RETURNING *',
            [photo_url, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});