// src/hooks/useLogin.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useLogin = () => {
    const navigate = useNavigate();

    // 1. State: Gom nhóm để dễ quản lý
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // 2. Xử lý nhập liệu chung
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Xóa lỗi của trường đang nhập (UX)
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 3. Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Reset lỗi cũ

        // Validate Client-side
        const newErrors = {};
        if (!formData.email) newErrors.email = "Vui lòng nhập email";
        if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:3001/login', formData);
            
            if (res.data.user) {
                // Lưu user và chuyển trang
                localStorage.setItem("currentUser", JSON.stringify(res.data.user));
                navigate('/home');
            }
        } catch (err) {
            const serverError = err.response?.data;
            
            // Map lỗi từ server vào state errors
            if (serverError === "Không tìm thấy tài khoản") {
                setErrors({ email: "Email này chưa được đăng ký" });
            } else if (serverError === "Sai mật khẩu") {
                setErrors({ password: "Mật khẩu không chính xác" });
            } else {
                setErrors({ general: "Lỗi đăng nhập, vui lòng thử lại" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        errors,
        isLoading,
        handleChange,
        handleSubmit
    };
};