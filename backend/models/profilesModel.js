const pool = require('../database/db');

const getProfiles = async () => {
    const result = await pool.query('SELECT * FROM profiles');
    return result.rows;
};

const getProfileById = async (id) => {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
    return result.rows[0];
};

const addSection = async (profileId, type, title, description) => {
    const result = await pool.query(
        'INSERT INTO sections (profile_id, type, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [profileId, type, title, description]
    );
    return result.rows[0];
};

const updateProfilePhoto = async (id, photo_url) => {
    const result = await pool.query(
        'UPDATE profiles SET photo_url = $1 WHERE id = $2 RETURNING *',
        [photo_url, id]
    );
    return result.rows[0];
};

module.exports = {
    getProfiles,
    getProfileById,
    addSection,
    updateProfilePhoto,
};