// src/pages/ChangePassword.jsx
import { useChangePassword } from '../hooks/useChangePassword';

function ChangePassword() {
    // Gọi Hook
    const { 
        passwords, 
        errors, 
        isLoading, 
        handleChange, 
        handleSubmit, 
        goBack 
    } = useChangePassword();

    return (
        <div className="bg-white p-6 rounded shadow-md min-h-[400px]">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b text-gray-800">
                Đổi Mật Khẩu
            </h2>
            
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    
                    {/* --- 1. MẬT KHẨU HIỆN TẠI --- */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-gray-700">Mật khẩu hiện tại</label>
                        <input 
                            type="password" 
                            name="current" // Quan trọng
                            placeholder="Nhập mật khẩu cũ để xác minh"
                            className={`w-full p-3 border rounded outline-none focus:ring-2 ${errors.current ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
                            value={passwords.current}
                            onChange={handleChange}
                        />
                        {errors.current && <p className="text-red-500 text-sm mt-1 italic">{errors.current}</p>}
                    </div>

                    <hr className="my-6 border-gray-200"/>

                    {/* --- 2. MẬT KHẨU MỚI --- */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-gray-700">Mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="new" // Quan trọng
                            placeholder="Nhập mật khẩu mới"
                            className={`w-full p-3 border rounded outline-none focus:ring-2 ${errors.new ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
                            value={passwords.new}
                            onChange={handleChange}
                        />
                        {errors.new && <p className="text-red-500 text-sm mt-1 italic">{errors.new}</p>}
                    </div>

                    {/* --- 3. XÁC NHẬN MẬT KHẨU MỚI --- */}
                    <div className="mb-8">
                        <label className="block mb-2 font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="confirm" // Quan trọng
                            placeholder="Nhập lại mật khẩu mới"
                            className={`w-full p-3 border rounded outline-none focus:ring-2 ${errors.confirm ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
                            value={passwords.confirm}
                            onChange={handleChange}
                        />
                        {errors.confirm && <p className="text-red-500 text-sm mt-1 italic">{errors.confirm}</p>}
                    </div>

                    <div className="flex gap-4">
                        <button 
                            disabled={isLoading}
                            className={`text-white px-6 py-2 rounded shadow transition font-medium ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isLoading ? "Đang xử lý..." : "Lưu Mật Khẩu"}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={goBack}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                        >
                            Quay lại Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;