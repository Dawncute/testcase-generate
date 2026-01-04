// src/components/ProjectModals.jsx
import React, { useState, useEffect } from 'react';
import { COLORS, ICONS } from '../assets/constants';

const ProjectModals = ({ modalType, onClose, onConfirm, projectData }) => {
    // State nội bộ của modal để tránh re-render component cha
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("folder");
    const [color, setColor] = useState("blue");
    const [confirmName, setConfirmName] = useState("");
    const [error, setError] = useState("");

    // Reset form mỗi khi mở modal mới
    useEffect(() => {
        if (modalType === 'create') {
            setName(""); setIcon("folder"); setColor("blue"); setError("");
        } else if (modalType === 'edit' && projectData) {
            setName(projectData.name);
            setIcon(projectData.icon);
            setColor(projectData.color);
            setError("");
        } else if (modalType === 'delete') {
            setConfirmName("");
        }
    }, [modalType, projectData]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên");
            return;
        }

        const success = await onConfirm({ name, icon, color });
        if (!success) {
            setError("Tên dự án đã tồn tại");
        }
    };

    if (!modalType) return null;

    // --- RENDER MODAL XÓA ---
    if (modalType === 'delete') {
        return (
            <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-96 animate-fade-in-down border border-gray-200">
                    <h3 className="text-xl font-bold mb-2 text-red-600">Xóa Project?</h3>
                    <p className="text-gray-600 text-sm mb-4">Nhập chính xác tên dự án: <span className="font-bold bg-gray-100 px-1 rounded">{projectData?.name}</span></p>
                    <input type="text" className="w-full p-2 border rounded mb-4" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
                        <button onClick={() => onConfirm()} disabled={confirmName !== projectData?.name} className={`px-4 py-2 text-white rounded ${confirmName === projectData?.name ? 'bg-red-600' : 'bg-red-300'}`}>Xóa vĩnh viễn</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER MODAL TẠO / SỬA ---
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-96 animate-fade-in-down border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{modalType === 'create' ? "Tạo Project Mới" : "Cài đặt Project"}</h3>
                
                <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-1">Tên dự án:</label>
                    <input type="text" autoFocus className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-gray-500 mb-2">Màu sắc:</label>
                    <div className="flex gap-3">{COLORS.map(c => (<button key={c.id} onClick={() => setColor(c.id)} className={`w-6 h-6 rounded-full ${c.bg.replace('100', '500')} transition-all ${color === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:opacity-80'}`} />))}</div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-500 mb-2">Biểu tượng:</label>
                    <div className="flex gap-3">{Object.keys(ICONS).map(k => (<button key={k} onClick={() => setIcon(k)} className={`p-2 rounded border ${icon === k ? 'bg-blue-100 border-blue-500 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>{ICONS[k]}</button>))}</div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">{modalType === 'create' ? "Tạo mới" : "Lưu thay đổi"}</button>
                </div>
            </div>
        </div>
    );
};
export default ProjectModals;