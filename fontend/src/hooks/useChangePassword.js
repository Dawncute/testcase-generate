// src/hooks/useChangePassword.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useChangePassword = () => {
    const navigate = useNavigate();

    // 1. State: Gom nhóm các trường password vào 1 object
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Lấy email từ LocalStorage khi component mount
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setEmail(JSON.parse(storedUser).email);
        }
    }, []);

    // 2. Xử lý nhập liệu chung
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        
        // Xóa lỗi khi người dùng bắt đầu gõ lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 3. Validate
    const validate = () => {
        const newErrors = {};
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        
        if (!passwords.current) newErrors.current = "Vui lòng nhập mật khẩu hiện tại";
        
        if (!passwords.new) {
            newErrors.new = "Vui lòng nhập mật khẩu mới";
        } else if (!regex.test(passwords.new)) {
            newErrors.new = "Mật khẩu mới phải > 8 ký tự, gồm Hoa, thường, số.";
        }

        if (passwords.new !== passwords.confirm) {
            newErrors.confirm = "Mật khẩu xác nhận không khớp";
        }

        return newErrors;
    };

    // 4. Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { 
            setErrors(validationErrors); 
            return; 
        }

        setIsLoading(true);

        try {
            await axios.put('http://localhost:3001/change-password', { 
                email, 
                oldPassword: passwords.current, 
                newPassword: passwords.new
            });

            alert("Thành công! Vui lòng đăng nhập lại với mật khẩu mới.");
            localStorage.removeItem("currentUser");
            navigate('/');

        } catch (err) {
            const message = err.response?.data;
            if (message === "Mật khẩu hiện tại không đúng" || message === "Sai mật khẩu") {
                setErrors({ current: "Mật khẩu hiện tại không đúng" });
            } else {
                alert("Lỗi: " + message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm tiện ích để nút "Quay lại" sử dụng
    const goBack = () => navigate('/home/profile');

    return {
        passwords,
        errors,
        isLoading,
        handleChange,
        handleSubmit,
        goBack
    };
};