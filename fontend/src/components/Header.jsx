// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';

// Nhận các props từ Home truyền xuống
const Header = ({ user, toggleSidebar, isSidebarOpen, onLogout, navigate }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Xử lý click ra ngoài để đóng dropdown menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow h-16 flex items-center justify-between px-6 z-10 shrink-0 border-b border-gray-200">
            {/* Phần bên trái: Nút Toggle Menu & Tiêu đề */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100 transition text-gray-600">
                    {/* Icon Menu Hamburger */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Testcase Manager</h1>
            </div>

            {/* Phần bên phải: Avatar & User Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition border border-transparent hover:border-gray-200"
                >
                    <span className="font-medium text-gray-700 hidden sm:block">{user?.username}</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex justify-center items-center">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-500 text-xs font-bold">USER</span>
                        )}
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in-down">
                        <button 
                            onClick={() => { 
                                navigate('/home/profile'); 
                                setIsDropdownOpen(false); 
                            }} 
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Hồ sơ cá nhân
                        </button>
                        
                        <div className="border-t border-gray-100"></div>
                        
                        <button 
                            onClick={onLogout} 
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;