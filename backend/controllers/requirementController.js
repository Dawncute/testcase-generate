const mongoose = require('mongoose');
const axios = require('axios');
const RequirementModel = require('../models/Requirement');

function normalizeTestCases(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(tc => ({
        caseId: tc.caseId || "",
        func: tc.func || tc.function || "",
        description: tc.description || "",
        steps: tc.steps || "",
        expectedResult: tc.expectedResult || "",
        testType: (tc.testType || tc.type)?.trim() ? (tc.testType || tc.type).toLowerCase() : "functional"
    }));
}

exports.getRequirements = async (req, res) => {
    try {
        const requirements = await RequirementModel.find({ projectId: req.params.projectId });
        res.json(requirements);
    } catch (err) { res.status(500).json(err); }
};

exports.saveRequirements = async (req, res) => {
    const { projectId, requirements } = req.body;
    if (!projectId) return res.status(400).json("Thiếu ProjectId");

    const cleanReqs = requirements.map(r => ({
        ...r,
        testCases: normalizeTestCases(r.testCases),
        _id: mongoose.Types.ObjectId.isValid(r._id) ? r._id : undefined
    }));

    try {
        const existingReqs = await RequirementModel.find({ projectId });
        const existingIds = existingReqs.map(r => r._id.toString());
        const incomingIds = cleanReqs.filter(r => r._id).map(r => r._id.toString());

        const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
            await RequirementModel.deleteMany({ _id: { $in: idsToDelete } });
        }

        const bulkOps = cleanReqs.map(req => {
            if (req._id) {
                return {
                    updateOne: {
                        filter: { _id: req._id },
                        update: { $set: { projectId, text: req.text, testCases: req.testCases } },
                        upsert: true
                    }
                };
            }
            return {
                insertOne: { document: { projectId, text: req.text, testCases: req.testCases } }
            };
        });

        try { await RequirementModel.bulkWrite(bulkOps, { ordered: false }); } 
        catch (e) { console.error("BulkWrite error:", e); }

        const finalDocs = await RequirementModel.find({ projectId });
        res.json(finalDocs);
    } catch (err) {
        console.error("Lỗi lưu:", err);
        res.status(500).json("Lỗi lưu requirements");
    }
};

exports.generateAndSave = async (req, res) => {
    console.log("👉 Đang nhận request generate-and-save:", req.body);
    const { projectId, requirementId, text } = req.body;

    if (!text) return res.status(400).json({ error: "Thiếu nội dung requirement" });
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "ProjectId không hợp lệ" });
    }

    try {
        console.log("⏳ Đang gọi Python server...");
        let aiResult;
        try {
            const pythonResponse = await axios.post('http://127.0.0.1:8001/generate', { text });
            aiResult = pythonResponse.data.result;
        } catch (axiosErr) {
            if (axiosErr.code === 'ECONNREFUSED') {
                return res.status(503).json({ error: "Không kết nối được AI Server. Hãy bật Python!" });
            }
            return res.status(500).json({ error: "Lỗi AI Server: " + axiosErr.message });
        }

        if (!aiResult || !Array.isArray(aiResult)) {
            return res.status(500).json({ error: "AI trả về dữ liệu không hợp lệ" });
        }

        const newTestCases = aiResult.map((tc, index) => ({
            caseId: `TC_${Date.now()}_${index + 1}`,
            func: tc.function || tc.func || "",
            description: tc.description || "",
            steps: tc.test_step || tc.steps || "",
            expectedResult: tc.expected_result || tc.expectedResult || "",
            testType: (tc.test_type || "functional").toLowerCase()
        }));

        let updatedDoc;
        if (requirementId && mongoose.Types.ObjectId.isValid(requirementId)) {
            updatedDoc = await RequirementModel.findByIdAndUpdate(
                requirementId,
                { $set: { text: text, testCases: newTestCases } },
                { new: true }
            );
        } else {
            updatedDoc = await RequirementModel.create({
                projectId: projectId,
                text: text,
                testCases: newTestCases
            });
        }
        res.json({ message: "Success", data: updatedDoc });

    } catch (err) {
        console.error("LỖI SERVER 500:", err);
        res.status(500).json({ error: "Lỗi Server Internal: " + err.message });
    }
};