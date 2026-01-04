const Project = require('../models/Project');
const Requirement = require('../models/Requirement');
const TestcaseTab = require('../models/TestcaseTab');

exports.createTestcaseTab = async (req, res) => {
    console.log(req.body);
    try {
        const { projectId, tabName, selectedReqIds } = req.body;

        if (!projectId) throw new Error("Thiếu projectId");
        if (!tabName) throw new Error("Thiếu tabName");
        if (!selectedReqIds || !Array.isArray(selectedReqIds)) throw new Error("selectedReqIds phải là một mảng");

        const newTabId = `tab_${Date.now()}`;
        console.log("Đang tìm Requirements với IDs:", selectedReqIds);
        const sourceReqs = await Requirement.find({ 
            _id: { $in: selectedReqIds } 
        });
        console.log(`Tìm thấy ${sourceReqs.length} requirements`);

        let clonedRows = [];
        sourceReqs.forEach(req => {
            if (req.testCases && req.testCases.length > 0) {
                req.testCases.forEach(tc => {
                    clonedRows.push({
                        originalReqId: req._id,
                        reqText: req.text || "",
                        caseId: tc.caseId || "",
                        func: tc.func || "",
                        description: tc.description || "",
                        steps: tc.steps || "",
                        expectedResult: tc.expectedResult || "",
                        testType: tc.testType || "functional"
                    });
                });
            }
        });
        console.log(`Đã clone được ${clonedRows.length} dòng testcase`);

        console.log("Đang lưu TestcaseTab...");
        const newTable = new TestcaseTab({
            projectId,
            tabId: newTabId,
            name: tabName,
            rows: clonedRows
        });

        await newTable.save().catch(err => {
            console.error("Lỗi Mongoose Validation TestcaseTab):", err.errors);
            throw new Error("Lỗi khi lưu TestcaseTab: " + err.message);
        });

        console.log("Đang update Project...");
        await Project.findByIdAndUpdate(projectId, {
            $push: { customTabs: { id: newTabId, name: tabName } }
        });

        console.log("Tạo thành công!");
        res.json({ success: true, tabId: newTabId, name: tabName });

    } catch (error) {
        console.error("LỖI NGHIÊM TRỌNG TẠI SERVER:", error);
        res.status(500).json({ 
            msg: "Lỗi Server", 
            error: error.message, 
            stack: error.stack
        });
    }
};

exports.getTestcaseTabData = async (req, res) => {
    try {
        const table = await TestcaseTab.findOne({ 
            projectId: req.params.projectId, 
            tabId: req.params.tabId 
        });
        res.json(table ? table.rows : []);
    } catch (error) {
        console.error("Lỗi lấy data:", error);
        res.status(500).json({ msg: "Lỗi lấy dữ liệu" });
    }
};

exports.saveTestcaseTab = async (req, res) => {
    try {
        const { projectId, tabId, rows } = req.body;
        
        await TestcaseTab.findOneAndUpdate(
            { projectId, tabId },
            { $set: { rows: rows } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Lỗi lưu data:", error);
        res.status(500).json({ msg: "Lỗi lưu dữ liệu" });
    }
};

exports.renameTestcaseTab = async (req, res) => {
    try {
        const { projectId, tabId, newName } = req.body;
        const trimmedName = newName.trim();

        let project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ msg: "Project not found" });

        const isDuplicate = project.customTabs.some(
            t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.id !== tabId
        );

        if (isDuplicate) {
            return res.status(400).json({ msg: "Tên bảng đã tồn tại, vui lòng chọn tên khác!" });
        }

        const targetTab = project.customTabs.find(t => t.id === tabId);
        if (targetTab) targetTab.name = trimmedName;

        await TestcaseTab.updateOne(
            { projectId, tabId },
            { $set: { name: trimmedName } }
        );

        const baseName = "Bảng test case";
        const defaultNameRegex = /^Bảng test case( \d+)?$/;

        let counter = 0; 
        let bulkOps = [];
        let isReIndexed = false;

        project.customTabs.forEach(tab => {
            
            if (defaultNameRegex.test(tab.name)) {
                
                const expectedName = (counter === 0) ? baseName : `${baseName} ${counter}`;
                if (tab.name !== expectedName) {
                    console.log(`Auto Re-index: "${tab.name}" -> "${expectedName}"`);
                    
                    tab.name = expectedName;
                    isReIndexed = true;

                    bulkOps.push({
                        updateOne: {
                            filter: { projectId, tabId: tab.id },
                            update: { $set: { name: expectedName } }
                        }
                    });
                }
                
                counter++;
            }
        });

        await project.save();

        if (bulkOps.length > 0) {
            await TestcaseTab.bulkWrite(bulkOps);
        }

        res.json({ success: true, newTabs: project.customTabs });

    } catch (error) {
        console.error("Lỗi đổi tên:", error);
        res.status(500).json({ msg: "Lỗi server khi đổi tên" });
    }
};

exports.deleteTestcaseTab = async (req, res) => {
    try {
        const { projectId, tabId } = req.body;

        await TestcaseTab.deleteOne({ projectId, tabId });

        let project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ msg: "Project not found" });

        project.customTabs = project.customTabs.filter(t => t.id !== tabId);

        const baseName = "Bảng test case";

        const defaultNameRegex = /^Bảng test case( \d+)?$/;

        let counter = 0;
        let bulkOps = [];

        project.customTabs = project.customTabs.map(tab => {
            if (defaultNameRegex.test(tab.name)) {
                const expectedName = (counter === 0) ? baseName : `${baseName} ${counter}`;
                if (tab.name !== expectedName) {
                    console.log(`Re-index: Đổi "${tab.name}" -> "${expectedName}"`);
                    tab.name = expectedName;
                    bulkOps.push({
                        updateOne: {
                            filter: { projectId, tabId: tab.id },
                            update: { $set: { name: expectedName } }
                        }
                    });
                }
                
                counter++;
            }
            return tab;
        });

        await project.save();
        if (bulkOps.length > 0) {
            await TestcaseTab.bulkWrite(bulkOps);
        }
        res.json({ success: true, newTabs: project.customTabs });

    } catch (error) {
        console.error("Lỗi xóa tab:", error);
        res.status(500).json({ msg: "Lỗi server khi xóa tab" });
    }
};

exports.getProjectSummary = async (req, res) => {
    try {
        const { projectId } = req.params;

        console.log("Getting summary for Project ID:", projectId);

        const tables = await TestcaseTab.find({ projectId });

        const summary = {
            totalCases: 0,
            statusCounts: { passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0 },
            tabsDetails: []
        };

        tables.forEach(table => {
            if (!table.rows || !Array.isArray(table.rows)) return;

            const tabStats = {
                tabId: table.tabId,
                tabName: table.name || "Unnamed Tab",
                total: table.rows.length,
                passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0
            };

            table.rows.forEach(row => {
                const status = row.status ? row.status.toLowerCase() : 'skipped';
                
                if (summary.statusCounts.hasOwnProperty(status)) {
                    tabStats[status]++;
                    summary.statusCounts[status]++;
                } else {
                    tabStats.skipped++;
                    summary.statusCounts.skipped++;
                }
            });

            summary.totalCases += tabStats.total;
            summary.tabsDetails.push(tabStats);
        });

        res.json(summary);

    } catch (error) {
        console.error("Lỗi API Summary:", error); 
        res.status(500).json({ msg: "Lỗi Server: " + error.message });
    }
};