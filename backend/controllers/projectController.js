const ProjectModel = require('../models/Project');
const RequirementModel = require('../models/Requirement');

exports.getProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json("Lỗi lấy project"); }
};

exports.addProject = async (req, res) => {
    try {
        const newProject = await ProjectModel.create(req.body);
        res.json(newProject);
    } catch (err) { res.status(500).json("Lỗi tạo project"); }
};

exports.updateProject = async (req, res) => {
    try {
        const updated = await ProjectModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json("Lỗi update"); }
};

exports.deleteProject = async (req, res) => {
    try {
        await ProjectModel.findByIdAndDelete(req.params.id);
        await RequirementModel.deleteMany({ projectId: req.params.id });
        res.json("Xóa thành công");
    } catch (err) { res.status(500).json("Lỗi xóa"); }
};

exports.updateProjectTabs = async (req, res) => {
    try {
        const { projectId, customTabs } = req.body;

        if (!projectId) {
            return res.status(400).json({ msg: "Thiếu Project ID" });
        }

        // Gọi Model để tương tác Database
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $set: { customTabs: customTabs } },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ msg: "Không tìm thấy Project" });
        }

        // Trả về View (JSON)
        res.json({ success: true, customTabs: updatedProject.customTabs });
    } catch (error) {
        console.error("Lỗi update tabs:", error);
        res.status(500).json({ msg: "Lỗi Server" });
    }
};