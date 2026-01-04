// src/pages/ForgotPassword.jsx
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useForgotPassword';

function ForgotPassword() {
    // Gọi Hook
    const { 
        email, 
        isLoading, 
        message, 
        error, 
        handleChange, 
        handleSubmit 
    } = useForgotPassword();

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Quên Mật Khẩu</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block mb-1 font-medium text-gray-700">Nhập Email của bạn</label>
                        <input 
                            type="email" 
                            placeholder="user@example.com" 
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-200' : 'focus:ring-orange-400'}`}
                            value={email}
                            onChange={handleChange} 
                            required 
                        />
                        {/* Hiển thị lỗi hoặc thông báo thành công */}
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        {message && <p className="text-green-600 text-sm mt-2 font-medium">{message}</p>}
                    </div>

                    <button 
                        disabled={isLoading}
                        className={`w-full text-white p-2 rounded transition font-medium ${isLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                    >
                        {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <Link to="/" className="text-blue-500 hover:underline text-sm">
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;