const express = require('express');
const profilesController = require('../controllers/profilesController');

const router = express.Router();

router.get('/', profilesController.getProfiles);
router.get('/:id', profilesController.getProfileById);
router.post('/:id/sections', profilesController.addSection);
router.post('/:id/photo', profilesController.updateProfilePhoto);

module.exports = router;