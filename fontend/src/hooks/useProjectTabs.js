import { useState, useEffect } from 'react';
import axios from 'axios';

// Mock API calls - Bạn cần thay thế bằng API thật
export const useProjectTabs = (projectId, initialTabs = []) => {
    // customTabs chứa: { id, name, type: 'grid', reqIds: [] }
    const [customTabs, setCustomTabs] = useState(initialTabs);

    // Load tabs từ DB khi mount (Nếu API get project chưa trả về customTabs thì gọi riêng)
    useEffect(() => {
        setCustomTabs([]);
        if(initialTabs.length > 0) setCustomTabs(initialTabs);
    }, [initialTabs]);

    const addTabLocal = (newTabInfo) => {
        console.log("👉 useProjectTabs nhận được:", newTabInfo);

        // Kiểm tra xem có bị undefined không
        if (!newTabInfo || !newTabInfo.id || !newTabInfo.name) {
            console.error("❌ Dữ liệu tab mới bị thiếu!", newTabInfo);
            return;
        }

        const newTab = {
            id: newTabInfo.id,     // <--- Khớp với object từ TabTestCases gửi sang
            name: newTabInfo.name, // <--- Khớp với object từ TabTestCases gửi sang
            type: 'grid', 
            reqIds: [] // Mảng rỗng, vì data nằm bên custom table rồi
        };

        setCustomTabs(prev => [...prev, newTab]);
    };

    // --- 1. HÀM ĐỔI TÊN (GỌI API RIÊNG BIỆT ĐỂ LƯU CHẮC CHẮN) ---
    const updateTabName = async (tabId, newName) => {
        // 1. Lưu lại dữ liệu cũ để phục hồi nếu lỗi
        const previousTabs = [...customTabs];

        // 2. Optimistic Update (Cập nhật UI trước)
        setCustomTabs(prev => prev.map(t => t.id === tabId ? { ...t, name: newName } : t));
        
        try {
            // 3. Gọi API
            const res = await axios.post('http://localhost:3001/api/testcase_tabs/rename', {
                projectId,
                tabId,
                newName
            });

            // Nếu server có re-index và trả về danh sách mới, cập nhật lại
            if (res.data.success && res.data.newTabs) {
                setCustomTabs(res.data.newTabs);
            }

        } catch (error) {
            console.error("Lỗi đổi tên:", error);
            
            // 4. NẾU LỖI: PHỤC HỒI LẠI TÊN CŨ (REVERT)
            setCustomTabs(previousTabs);

            // 5. NÉM LỖI RA NGOÀI ĐỂ COMPONENT HIỂN THỊ SNACKBAR
            // Lấy message từ server (VD: "Tên bảng đã tồn tại")
            const msg = error.response?.data?.msg || "Không thể đổi tên tab";
            throw new Error(msg);
        }
    };

    // --- 2. HÀM XÓA TAB (CẬP NHẬT LẠI DANH SÁCH TỪ SERVER) ---
    const deleteTab = async (tabId) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa bảng này?")) return;
        
        const previousTabs = [...customTabs];
        // Tạm ẩn trên UI
        setCustomTabs(prev => prev.filter(t => t.id !== tabId));

        try {
            const res = await axios.post('http://localhost:3001/api/testcase_tabs/delete', { 
                projectId, 
                tabId 
            });

            // Nếu server trả về danh sách mới (đã re-index), cập nhật ngay
            if (res.data.success && res.data.newTabs) {
                console.log("🔄 Cập nhật danh sách tab sau khi re-index");
                setCustomTabs(res.data.newTabs);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi xóa tab");
            setCustomTabs(previousTabs); // Hoàn tác
        }
    };

    return {
        customTabs,
        addTabLocal,
        updateTabName,
        deleteTab
    };
};