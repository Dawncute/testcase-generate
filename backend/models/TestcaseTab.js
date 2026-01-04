const mongoose = require('mongoose');

const TestcaseSchema = new mongoose.Schema({
    originalReqId: { type: mongoose.Schema.Types.ObjectId },
    reqText: String,
    caseId: String,
    func: String,
    description: String,
    steps: String,
    expectedResult: String,
    testType: String,
    actualResult: { type: String, default: "" },
    status: { 
        type: String, 
        default: "untested",
        enum: ["passed", "failed", "blocked", "skipped", "untested"] 
    }
}, { _id: true });

const TestcaseTabSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },
    tabId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    rows: [TestcaseSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("testcase_tabs", TestcaseTabSchema);