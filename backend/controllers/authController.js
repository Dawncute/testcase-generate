const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(400).json("Email tồn tại");
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserModel.create({ username, email, password: hashedPassword });
        res.json(newUser);
    } catch (err) { res.status(500).json("Lỗi server"); }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json("Sai tài khoản");
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json("Sai mật khẩu");
        
        res.json({
            message: "Success",
            user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar || "" }
        });
    } catch (err) { res.status(500).json("Lỗi server"); }
};

exports.updateUser = async (req, res) => {
    try {
        const updated = await UserModel.findOneAndUpdate({ email: req.body.email }, req.body, { new: true });
        res.json({ user: updated });
    } catch (err) { res.status(500).json("Lỗi update"); }
};

exports.changePassword = async (req, res) => {
    res.json("Thành công");
};