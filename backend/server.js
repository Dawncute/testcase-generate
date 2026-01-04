require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const testcaseTabRoutes = require('./routes/testcaseTab');

// Khởi tạo app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Kết nối Database
connectDB();

// Đăng ký Routes
// Bạn có thể thêm prefix '/api' để API rõ ràng hơn, ví dụ: /api/auth/login
app.use('/', authRoutes); 
app.use('/', projectRoutes);
app.use('/', requirementRoutes);
app.use('/api/testcase_tabs', testcaseTabRoutes);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});