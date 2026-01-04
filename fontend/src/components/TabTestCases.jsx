import React, { useState, useEffect, useRef } from 'react';
import { useRequirements } from '../hooks/useRequirements';
import axios from 'axios';

// Helper: Hiển thị Badge màu sắc cho loại Test Case
const getTypeBadge = (testType) => {
    switch(testType) {
        case 'functional': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-200">Functional</span>;
        case 'boundary': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs border border-orange-200">Boundary</span>;
        case 'negative': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs border border-red-200">Negative</span>;
        default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">Normal</span>;
    }
};

const TabTestCases = ({ projectId, onCreateTab, existingTabs = [] }) => { 
    // 1. Gọi Custom Hook logic
    const {
        requirements,
        isLoading,
        generatingId,
        inputRefs,
        handleTextChange,
        handleAddRow,
        handleDeleteRow,
        toggleExpand,
        handleGenerate
    } = useRequirements(projectId);

    // 2. State & Ref
    const [selectedReqs, setSelectedReqs] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Ref để xử lý click outside đóng menu
    const dropdownRef = useRef(null);

    // 3. Effect: Lắng nghe click ra ngoài để đóng dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Chỉ lấy những requirement ĐÃ có testcase để hiển thị trong dropdown
    const validReqs = requirements.filter(r => r.testCases && r.testCases.length > 0 && r._id);

    // Handler chọn checkbox
    const handleCheckboxChange = (reqId) => {
        setSelectedReqs(prev => {
            if (prev.includes(reqId)) return prev.filter(id => id !== reqId);
            return [...prev, reqId];
        });
    };

    // 4. Hàm sinh tên tab tự động (Tránh trùng lặp)
    const generateTabName = () => {
        const baseName = "Bảng test case";
        
        // Kiểm tra tên gốc
        const isBaseExist = existingTabs.some(t => t.name === baseName);
        if (!isBaseExist) return baseName;

        // Tìm số nhỏ nhất còn thiếu
        let index = 1;
        while (true) {
            const newName = `${baseName} ${index}`;
            const isExist = existingTabs.some(t => t.name === newName);
            if (!isExist) return newName;
            index++;
        }
    };
    
    // 5. Handler Tạo Bảng Mới
    const handleCreateClick = async () => {
        if (selectedReqs.length === 0) return alert("Vui lòng chọn ít nhất 1 requirement để tạo bảng!");
        if (!projectId) return alert("Thiếu Project ID!");

        const tabName = generateTabName(); 

        try {
            const res = await axios.post('http://localhost:3001/api/testcase_tabs/create', {
                projectId,
                tabName,
                selectedReqIds: selectedReqs
            });

            console.log("✅ API thành công:", res.data);

            if (res.data.success) {
                const newTabInfo = {
                    id: res.data.tabId, 
                    name: res.data.name || res.data.tabName
                };

                if (newTabInfo.id && newTabInfo.name) {
                    onCreateTab(newTabInfo); // Callback báo cho cha biết
                    setSelectedReqs([]);     // Reset selection
                    setIsDropdownOpen(false); // Đóng menu
                } else {
                    alert(`Lỗi: Dữ liệu trả về không hợp lệ!`);
                }
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.response?.data?.msg || err.message;
            alert("Lỗi tạo bảng: " + msg);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && requirements[index].text === '') {
            e.preventDefault();
            handleDeleteRow(index);
        }
    };

    return (
        <div className="animate-fade-in-down pb-20 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">Requirements (Project ID: {projectId?.slice(-4)})</h3>
                {isLoading && <span className="text-xs text-gray-400">Đang tải...</span>}
            </div>

            {/* --- TOP BAR: DROPDOWN & CREATE BUTTON --- */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-6 flex items-center justify-between shadow-sm">
                
                {/* 1. Dropdown chọn Requirement (Có Ref để tự đóng) */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <span>Chọn Requirements ({selectedReqs.length})</span>
                        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-12 left-0 w-80 bg-white border border-gray-200 shadow-xl rounded z-20 max-h-60 overflow-y-auto animate-fade-in-up">
                            {validReqs.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500 text-center">
                                    Chưa có requirement nào đã generate test case. <br/>
                                    Hãy bấm nút "Tạo" ở danh sách dưới trước.
                                </div>
                            ) : (
                                <div>
                                    <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                        Chọn Requirements
                                    </div>
                                    {validReqs.map(req => (
                                        <label key={req._id} className="flex items-start gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                checked={selectedReqs.includes(req._id)}
                                                onChange={() => handleCheckboxChange(req._id)}
                                            />
                                            <span className="text-sm text-gray-700 line-clamp-2 select-none">{req.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Nút tạo bảng */}
                <button 
                    onClick={handleCreateClick}
                    disabled={selectedReqs.length === 0}
                    className={`px-4 py-2 rounded shadow transition-all font-medium flex items-center gap-2
                        ${selectedReqs.length === 0 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Tạo bảng testcase
                </button>
            </div>

            {/* --- LIST REQUIREMENTS --- */}
            <div className="space-y-4"> 
                {requirements.map((item, index) => (
                    <div key={item._id ?? `temp-${index}`} className="group transition-all">
                        <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded relative">
                            
                            {/* Nút Thêm (+) */}
                            <button 
                                onClick={() => handleAddRow(index)}
                                className="absolute -left-6 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                tabIndex={-1}
                                title="Thêm dòng mới bên dưới"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </button>

                            {/* Button Generate */}
                            <button 
                                onClick={() => handleGenerate(index, item.text)}
                                disabled={generatingId === index || !item.text.trim()}
                                className={`px-3 py-1 text-white text-xs font-medium rounded shadow-sm whitespace-nowrap transition-all
                                    ${generatingId === index 
                                        ? 'bg-gray-400 cursor-wait' 
                                        : !item.text.trim() 
                                            ? 'bg-blue-300 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                tabIndex={-1}
                            >
                                {generatingId === index ? 'Đang tạo...' : 'Tạo'}
                            </button>

                            {/* Input Text */}
                            <input 
                                ref={el => inputRefs.current[index] = el}
                                type="text" 
                                value={item.text}
                                onChange={(e) => handleTextChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                placeholder="Nhập yêu cầu phần mềm..."
                                className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 outline-none px-2 py-1 text-gray-700 transition-all placeholder-gray-300 focus:bg-white"
                            />

                            {/* Icon Toggle Expand */}
                            {item.testCases && item.testCases.length > 0 && (
                                <button 
                                    onClick={() => toggleExpand(index)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-all"
                                    tabIndex={-1}
                                    title="Xem test cases đã tạo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${item.isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            )}

                            {/* Nút Xóa (x) */}
                            <button 
                                onClick={() => handleDeleteRow(index)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 ml-1"
                                tabIndex={-1}
                                title="Xóa dòng này"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* --- LIST TESTCASE PREVIEW --- */}
                        {item.isExpanded && item.testCases && item.testCases.length > 0 && (
                            <div className="ml-14 mr-8 mt-2 mb-4 animate-fade-in-down">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Cases ({item.testCases.length})</span>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {item.testCases.map((tc, i) => (
                                            <div key={i} className="p-4 hover:bg-white transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-700 text-sm">{tc.caseId}</span>
                                                        {getTypeBadge(tc.testType)}
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-mono">Auto-generated</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                                                    <div><span className="font-semibold text-gray-800">Mô tả:</span> {tc.description}</div>
                                                    <div><span className="font-semibold text-gray-800">Các bước:</span> {tc.steps}</div>
                                                    <div className="md:col-span-2"><span className="font-semibold text-gray-800">Kết quả mong đợi:</span> {tc.expectedResult}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {requirements.length === 0 && !isLoading && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-400 mb-2">Chưa có requirement nào.</p>
                        <button onClick={() => handleAddRow(-1)} className="text-blue-500 hover:text-blue-700 font-medium">+ Thêm Requirement đầu tiên</button>
                    </div>
                )}
                 {/* Nút thêm dòng ở cuối danh sách */}
                 {requirements.length > 0 && (
                    <button onClick={() => handleAddRow(requirements.length - 1)} className="text-blue-500 text-sm mt-2 hover:text-blue-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Thêm dòng mới
                    </button>
                )}
            </div>
        </div>
    );
};

export default TabTestCases;