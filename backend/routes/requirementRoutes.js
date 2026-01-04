const express = require('express');
const router = express.Router();
const requirementController = require('../controllers/requirementController');

router.get('/get-requirements/:projectId', requirementController.getRequirements);
router.post('/save-requirements', requirementController.saveRequirements);
router.post('/generate-and-save', requirementController.generateAndSave);

module.exports = router;