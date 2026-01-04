// src/pages/Login.jsx
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

function Login() {
    // Gọi hook
    const { formData, errors, isLoading, handleChange, handleSubmit } = useLogin();

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Email</label>
                        <input 
                            type="email" 
                            name="email" // Quan trọng để handleChange hoạt động
                            placeholder="Nhập email" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
                            value={formData.email}
                            onChange={handleChange} 
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Password</label>
                        <input 
                            type="password" 
                            name="password" // Quan trọng
                            placeholder="Nhập mật khẩu" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1 italic">{errors.password}</p>}
                    </div>
                    
                    {/* Lỗi chung (nếu có) */}
                    {errors.general && <div className="mb-4 text-center text-red-500 text-sm bg-red-100 p-2 rounded">{errors.general}</div>}

                    <div className="flex justify-end mb-4">
                        <Link to="/forgot-password" class="text-sm text-blue-500 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button 
                        disabled={isLoading}
                        className={`w-full text-white p-2 rounded transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm">
                    Chưa có tài khoản? <Link to="/register" className="text-blue-500 hover:underline">Đăng ký</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;