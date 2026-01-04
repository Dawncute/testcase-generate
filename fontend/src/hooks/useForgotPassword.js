// src/hooks/useForgotPassword.js
import { useState } from 'react';
import axios from 'axios';

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State để hiển thị thông báo ngay trên giao diện thay vì alert
    const [message, setMessage] = useState(''); // Thành công
    const [error, setError] = useState('');     // Thất bại

    const handleChange = (e) => {
        setEmail(e.target.value);
        // Xóa thông báo cũ khi người dùng nhập lại
        if (message) setMessage('');
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError("Vui lòng nhập email");
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await axios.post('http://localhost:3001/forgot-password', { email });
            // Giả sử server trả về text: "Đã gửi email..."
            setMessage(res.data || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
        } catch (err) {
            setError(err.response?.data || "Lỗi gửi yêu cầu, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email,
        isLoading,
        message,
        error,
        handleChange,
        handleSubmit
    };
};