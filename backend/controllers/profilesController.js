const profilesModel = require('../models/profilesModel');

const getProfiles = async (req, res) => {
    try {
        const profiles = await profilesModel.getProfiles();
        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const getProfileById = async (req, res) => {
    const { id } = req.params;
    try {
        const profile = await profilesModel.getProfileById(id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const addSection = async (req, res) => {
    const { id } = req.params;
    const { type, title, description } = req.body;

    try {
        const newSection = await profilesModel.addSection(id, type, title, description);
        res.status(201).json(newSection);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const updateProfilePhoto = async (req, res) => {
    const { id } = req.params;
    const { photo_url } = req.body;
    try {
        const updatedProfile = await profilesModel.updateProfilePhoto(id, photo_url);
        res.json(updatedProfile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getProfiles,
    getProfileById,
    addSection,
    updateProfilePhoto,
};