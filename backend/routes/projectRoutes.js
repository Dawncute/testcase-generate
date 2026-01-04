const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/get-projects/:userId', projectController.getProjects);
router.post('/add-project', projectController.addProject);
router.put('/update-project/:id', projectController.updateProject);
router.delete('/delete-project/:id', projectController.deleteProject);
router.post('/update-project-tabs', projectController.updateProjectTabs);

module.exports = router;