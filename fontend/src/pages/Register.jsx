// src/pages/Register.jsx
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

function Register() {
    // Gọi hook để lấy logic ra dùng
    const { formData, errors, isLoading, handleChange, handleSubmit } = useRegister();

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng Ký</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Username</label>
                        <input 
                            type="text" name="username" placeholder="Nhập username" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 ring-red-200' : 'focus:ring-green-500'}`}
                            value={formData.username}
                            onChange={handleChange} 
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1 italic">{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Email</label>
                        <input 
                            type="email" name="email" placeholder="Nhập email" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-200' : 'focus:ring-green-500'}`}
                            value={formData.email}
                            onChange={handleChange} 
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Password</label>
                        <input 
                            type="password" name="password" placeholder="Nhập mật khẩu" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-200' : 'focus:ring-green-500'}`}
                            value={formData.password}
                            onChange={handleChange} 
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 italic">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block mb-1 font-medium">Confirm Password</label>
                        <input 
                            type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 ring-red-200' : 'focus:ring-green-500'}`}
                            value={formData.confirmPassword}
                            onChange={handleChange} 
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 italic">{errors.confirmPassword}</p>}
                    </div>

                    {/* Lỗi chung */}
                    {errors.form && <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm rounded text-center">{errors.form}</div>}

                    <button 
                        disabled={isLoading}
                        className={`w-full text-white p-2 rounded transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng Ký"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm">
                    Đã có tài khoản? <Link to="/" className="text-blue-500 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;