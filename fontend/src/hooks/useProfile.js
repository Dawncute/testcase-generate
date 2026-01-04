// src/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export const useProfile = () => {
    // Lấy hàm cập nhật từ Context (Header)
    const { updateUser } = useOutletContext() || { updateUser: () => {} };

    const [formData, setFormData] = useState({ username: '', email: '', avatar: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Load dữ liệu khi vào trang
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFormData({ username: user.username, email: user.email, avatar: user.avatar || '' });
            if (user.avatar) setImagePreview(user.avatar);
        }
    }, []);

    // 2. Xử lý khi nhập text (Username)
    const handleInputChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, username: value }));
    };

    // 3. Xử lý chọn file ảnh
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert('Chỉ chọn file ảnh!');

        // Preview ngay lập tức
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Đọc file sang Base64 để gửi lên Server
        const reader = new FileReader();
        reader.onload = (ev) => setFormData(prev => ({ ...prev, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    // 4. Submit form cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await axios.put('http://localhost:3001/update-user', formData);
            const updatedUser = res.data.user;

            // Lưu vào LocalStorage
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            
            // Cập nhật Header ngay lập tức
            updateUser(updatedUser); 
            
            console.log("Đã cập nhật Header thành công");
        } catch (err) {
            alert("Lỗi cập nhật: " + (err.response?.data || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        imagePreview,
        isLoading,
        handleInputChange,
        handleFileChange,
        handleSubmit
    };
};