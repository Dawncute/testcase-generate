const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },
    text: { type: String, default: "" },
    testCases: [{
        caseId: String,
        func: String,
        description: String,
        steps: String,
        expectedResult: String,
        testType: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("requirements", RequirementSchema);