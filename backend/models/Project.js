const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    icon: { type: String, default: "folder" },
    color: { type: String, default: "blue" },
    createdAt: { type: Date, default: Date.now },
    customTabs: [{
        id: String,
        name: String
    }],
});

module.exports = mongoose.model("projects", ProjectSchema);