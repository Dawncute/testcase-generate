// src/hooks/useRegister.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useRegister = () => {
    const navigate = useNavigate();
    
    // 1. State quản lý dữ liệu và lỗi
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading để UX tốt hơn

    // 2. Xử lý nhập liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi ngay khi người dùng nhập lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 3. Hàm Validate (Logic kiểm tra)
    const validate = () => {
        const newErrors = {};
        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!formData.username.trim()) newErrors.username = "Vui lòng nhập username";
        if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
        
        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (!regexPassword.test(formData.password)) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ Hoa, thường và số.";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        return newErrors;
    };

    // 4. Hàm Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate Client-side
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true); // Bắt đầu loading

        try {
            // Gọi API
            const res = await axios.post('http://localhost:3001/register', { 
                username: formData.username, 
                email: formData.email, 
                password: formData.password 
            });

            // Thành công
            const userToSave = {
                username: res.data.username,
                email: res.data.email,
                avatar: "" 
            };
            localStorage.setItem("currentUser", JSON.stringify(userToSave));
            navigate('/home');

        } catch (err) {
            // Xử lý lỗi từ Server
            if (err.response && err.response.status === 400) {
                if(err.response.data === "Email tồn tại") { // Sửa lại khớp với text bên Server
                    setErrors({ email: "Email này đã được sử dụng" });
                } else {
                     setErrors({ form: err.response.data }); 
                }
            } else {
                setErrors({ form: "Lỗi kết nối server" });
            }
        } finally {
            setIsLoading(false); // Kết thúc loading dù thành công hay thất bại
        }
    };

    // Trả về những thứ Component cần dùng
    return {
        formData,
        errors,
        isLoading,
        handleChange,
        handleSubmit
    };
};