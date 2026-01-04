const express = require('express');
const router = express.Router();
const testcaseTabController = require('../controllers/testcaseTabController');

// Định nghĩa các route và trỏ đến hàm controller tương ứng

// POST /api/testcase_tabs/create
router.post('/create', testcaseTabController.createTestcaseTab);

// POST /api/testcase_tabs/save
router.post('/save', testcaseTabController.saveTestcaseTab);

// POST /api/testcase_tabs/rename
router.post('/rename', testcaseTabController.renameTestcaseTab);

// POST /api/testcase_tabs/delete
router.post('/delete', testcaseTabController.deleteTestcaseTab);

// GET /api/testcase_tabs/summary/:projectId
router.get('/summary/:projectId', testcaseTabController.getProjectSummary);

// GET /api/testcase_tabs/:projectId/:tabId
router.get('/:projectId/:tabId', testcaseTabController.getTestcaseTabData);



module.exports = router;