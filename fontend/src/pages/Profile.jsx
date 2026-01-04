// src/pages/Profile.jsx
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // Gọi Hook
    const { 
        formData, 
        imagePreview, 
        isLoading, 
        handleInputChange, 
        handleFileChange, 
        handleSubmit 
    } = useProfile();

    return (
        <div className="bg-white p-6 rounded shadow-md min-h-[500px]">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b text-gray-800">Hồ Sơ Cá Nhân</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* --- CỘT TRÁI: AVATAR --- */}
                    <div className="w-full md:w-1/3 flex flex-col items-center pt-4">
                        <div 
                            className="w-48 h-48 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-200 mb-4 shadow-sm cursor-pointer hover:border-blue-500 transition-all"
                            onClick={() => fileInputRef.current.click()}
                            title="Bấm vào để chọn ảnh mới"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">No Image</div>
                            )}
                        </div>
                        
                        {/* Input file ẩn */}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition shadow-sm font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                            Tải ảnh lên
                        </button>
                        <p className="text-xs text-gray-400 mt-3">Dung lượng tối đa 2MB</p>
                    </div>

                    {/* --- CỘT PHẢI: INFO --- */}
                    <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Username</label>
                                <input 
                                    type="text" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email} 
                                    readOnly disabled 
                                    className="w-full p-3 border rounded bg-gray-100 text-gray-500 cursor-not-allowed" 
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-4">
                                <button 
                                    disabled={isLoading} 
                                    className={`bg-blue-600 text-white px-6 py-2 rounded shadow transition font-medium flex items-center justify-center min-w-[140px] ${isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-blue-700'}`}
                                >
                                    {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/home/change-password')} 
                                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 transition"
                                >
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Profile;