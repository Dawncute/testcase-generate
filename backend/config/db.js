const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Đã kết nối MongoDB Atlas");
    } catch (err) {
        console.error("Lỗi kết nối DB:", err);
        process.exit(1);
    }
};

module.exports = connectDB;