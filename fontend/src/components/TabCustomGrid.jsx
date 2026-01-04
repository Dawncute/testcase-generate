// TabCustomGrid.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { jsPDF } from "jspdf"; 
import autoTable from 'jspdf-autotable';

// Helper: Badge màu cho Test Type
const getTypeBadgeColor = (type) => {
    switch (type?.toLowerCase()) {
        case 'functional': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'boundary': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'negative': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'untested': return 'bg-white text-gray-400 border-gray-200';
        case 'passed': return 'bg-green-100 text-green-700 border-green-200 font-bold';
        case 'failed': return 'bg-red-100 text-red-700 border-red-200 font-bold';
        case 'blocked': return 'bg-yellow-100 text-yellow-700 border-yellow-200 font-bold';
        case 'skipped': return 'bg-gray-100 text-gray-500 border-gray-200';
    }
};

const TabCustomGrid = ({ projectId, tabId }) => { // Nhận tabId thay vì filterReqIds
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState(new Set()); // Dùng Set để lưu index các dòng đang chọn
    
    // State cho Export Menu
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef(null);
    // 1. Fetch Data từ Custom Table API
    useEffect(() => {
        setIsLoading(true);
        axios.get(`http://localhost:3001/api/testcase_tabs/${projectId}/${tabId}`)
            .then(res => {
                setRows(res.data || []);
            })
            .finally(() => setIsLoading(false));
    }, [projectId, tabId]);

    useEffect(() => {
        function handleClickOutside(event) {
            // Kiểm tra: Nếu menu đang mở VÀ click không nằm trong vùng exportMenuRef
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setIsExportMenuOpen(false);
            }
        }

        // Gắn sự kiện khi component được sinh ra
        document.addEventListener("mousedown", handleClickOutside);
        
        // Dọn dẹp sự kiện khi component bị hủy (để tránh rò rỉ bộ nhớ)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 2. Auto Save Logic (Lưu vào bảng Custom)
    const autoSave = useCallback(debounce((updatedRows) => {
        axios.post('http://localhost:3001/api/custom-tables/save', {
            projectId,
            tabId,
            rows: updatedRows
        }).then(() => console.log("Auto-saved custom table"));
    }, 1000), [projectId, tabId]);

    // 3. Handle Change Inline
    const handleCellChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value; // Update trực tiếp trên mảng copy
        setRows(newRows);
        autoSave(newRows); // Gọi save
    };
    
    // Insert row phía sau dòng hiện tại
    const handleAddRowAfter = (index) => {
        const newRow = { reqText: "", caseId: "", func: "", description: "", steps: "", expectedResult: "", testType: "functional", actualResult: "", status: "untested" };
        const newRows = [...rows];
        newRows.splice(index + 1, 0, newRow); // Chèn vào vị trí index + 1
        setRows(newRows);
        autoSave(newRows);
    };

    // Xóa 1 dòng cụ thể
    const handleDeleteRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
        autoSave(newRows);
    };

    // Xóa nhiều dòng đã chọn
    const handleDeleteSelected = () => {
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIndices.size} dòng đã chọn?`)) return;
        
        const newRows = rows.filter((_, index) => !selectedIndices.has(index));
        setRows(newRows);
        setSelectedIndices(new Set());
        autoSave(newRows);
    };

    // Selection Logic
    const toggleSelectAll = (checked) => {
        if (checked) setSelectedIndices(new Set(rows.map((_, i) => i)));
        else setSelectedIndices(new Set());
    };

    const toggleSelectRow = (index) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    // 4. CHỨC NĂNG EXPORT CSV
    // ==========================================
    const exportToCSV = () => {
        const headers = ["STT", "Requirement", "Type", "Description", "Steps", "Expected Result", "Actual Result", "Status"];
        
        const csvRows = rows.map((row, index) => {
            const escape = (text) => {
                if (!text) return "";
                // Nếu có dấu phẩy hoặc xuống dòng thì bọc trong ngoặc kép
                return `"${text.toString().replace(/"/g, '""')}"`; 
            };

            return [
                index + 1,
                escape(row.reqText),
                escape(row.testType),
                escape(row.description),
                escape(row.steps),
                escape(row.expectedResult),
                escape(row.actualResult),
                escape(row.status)
            ].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        // Thêm BOM \uFEFF để Excel hiển thị đúng Tiếng Việt
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Data_Export_${tabId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportMenuOpen(false);
    };

    // ==========================================
    // ==========================================
    // 5. CHỨC NĂNG EXPORT PDF (HỖ TRỢ TIẾNG VIỆT)
    // ==========================================
    const exportToPDF = async () => {
        setIsExportMenuOpen(false); // Đóng menu ngay khi bấm
        
        // Tạo doc mới
        const doc = new jsPDF();

        try {
            // 1. Tải Font hỗ trợ tiếng Việt (Roboto) từ CDN
            // Bạn có thể tải file này về để trong thư mục public/fonts của dự án để chạy offline nhanh hơn
            const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
            const response = await fetch(fontUrl);
            const blob = await response.blob();
            
            // 2. Chuyển file font sang Base64
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                
                // 3. Add font vào VFS (Virtual File System) của jsPDF
                doc.addFileToVFS("Roboto-Regular.ttf", base64data);
                doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
                doc.setFont("Roboto"); // Set font cho các text thường (doc.text)

                // 4. Vẽ Tiêu đề
                doc.setFontSize(18);
                doc.text("Báo cáo Test Case", 14, 15);

                // Chuẩn bị dữ liệu bảng
                const tableColumn = ["STT", "Req", "Type", "Description", "Steps", "Expected", "Actual", "Status"];
                const tableRows = rows.map((row, index) => [
                    index + 1,
                    row.reqText || "",
                    row.testType || "",
                    row.description || "",
                    row.steps || "",
                    row.expectedResult || "",
                    row.actualResult || "",
                    row.status || ""
                ]);

                // 5. Vẽ Bảng (Cấu hình font cho autoTable)
                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 20,
                    styles: { 
                        font: "Roboto", // <--- QUAN TRỌNG: Phải set font Roboto ở đây
                        fontStyle: "normal",
                        fontSize: 8 
                    },
                    headStyles: { fillColor: [22, 160, 133] },
                });

                // 6. Lưu file
                doc.save(`Report_${tabId}.pdf`);
            };

        } catch (error) {
            console.error("Lỗi tải font hoặc xuất PDF:", error);
            alert("Không thể tải font tiếng Việt. Vui lòng kiểm tra kết nối mạng.");
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải bảng dữ liệu...</div>;
    const isAllSelected = rows.length > 0 && selectedIndices.size === rows.length;
    const hasSelection = selectedIndices.size > 0;
    return (
        <div className="animate-fade-in-down pb-20 relative">
            
            {/* --- TOOLBAR (NÚT EXPORT) --- */}
            <div className="flex justify-end mb-3 relative">
                <div className="relative" ref={exportMenuRef}>
                    <button 
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Data
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isExportMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded shadow-xl border border-gray-100 z-20 animate-fade-in-up overflow-hidden">
                            <button 
                                onClick={exportToCSV}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Export CSV
                            </button>
                            <button 
                                onClick={exportToPDF}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                Export PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- TABLE --- */}
            {/* --- TABLE --- */}
            <div className="w-full max-w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white custom-scrollbar">
                <table className="w-max divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    checked={isAllSelected}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase w-12">STT</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[150px]">Requirement</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[100px]">Type</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[200px]">Description</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[200px]">Steps</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[200px]">Expected</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[200px]">Actual Result</th>
                            <th className="px-3 py-3 text-left font-semibold text-gray-500 uppercase min-w-[100px]">Status</th>
                            <th className="px-3 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row, index) => {
                            const isSelected = selectedIndices.has(index);
                            return (
                                <tr 
                                    key={row._id || index} 
                                    className={`group hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                >
                                    {/* Checkbox Row (Hiện khi hover hoặc selected) */}
                                    <td className="px-3 py-2 text-center relative">
                                        <div className={`transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleSelectRow(index)}
                                            />
                                        </div>
                                    </td>

                                    {/* STT */}
                                    <td className="px-3 py-2 text-gray-400 font-mono text-xs">{index + 1}</td>

                                    {/* Requirement */}
                                    <td className="px-3 py-2">
                                        <textarea 
                                            className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded p-1.5 resize-none text-gray-800 transition-all outline-none"
                                            rows={2} value={row.reqText || ''} onChange={(e) => handleCellChange(index, 'reqText', e.target.value)}
                                            placeholder="Nhập requirement..."
                                        />
                                    </td>

                                    {/* Test Type (Badge + Select) */}
                                    <td className="px-3 py-2">
                                        <select 
                                            value={row.testType || 'functional'}
                                            onChange={(e) => handleCellChange(index, 'testType', e.target.value)}
                                            className={`appearance-none text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer w-full text-center ${getTypeBadgeColor(row.testType)}`}
                                        >
                                            <option value="functional">Functional</option>
                                            <option value="boundary">Boundary</option>
                                            <option value="negative">Negative</option>
                                            <option value="security">Security</option>
                                            <option value="ui">UI</option>
                                        </select>
                                    </td>

                                    {/* Description */}
                                    <td className="px-3 py-2">
                                        <textarea className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded p-1.5 resize-none text-gray-600 transition-all outline-none"
                                            rows={3} value={row.description || ''} onChange={(e) => handleCellChange(index, 'description', e.target.value)} />
                                    </td>

                                    {/* Steps */}
                                    <td className="px-3 py-2">
                                        <textarea className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded p-1.5 resize-none text-gray-600 transition-all outline-none"
                                            rows={3} value={row.steps || ''} onChange={(e) => handleCellChange(index, 'steps', e.target.value)} />
                                    </td>

                                    {/* Expected Result */}
                                    <td className="px-3 py-2">
                                        <textarea className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded p-1.5 resize-none text-gray-600 transition-all outline-none"
                                            rows={3} value={row.expectedResult || ''} onChange={(e) => handleCellChange(index, 'expectedResult', e.target.value)} />
                                    </td>
                                    
                                    {/* --- 5. RENDER CỘT ACTUAL RESULT --- */}
                                    <td className="px-3 py-2 border-l border-dashed border-gray-200 bg-gray-50/30">
                                        <textarea 
                                            className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:bg-white focus:border-blue-500 rounded p-1.5 resize-none text-gray-700 outline-none transition-all"
                                            rows={2} 
                                            value={row.actualResult || ''} 
                                            placeholder="..."
                                            onChange={(e) => handleCellChange(index, 'actualResult', e.target.value)} 
                                        />
                                    </td>

                                    {/* --- 6. RENDER CỘT STATUS --- */}
                                    <td className="px-3 py-2 border-l border-dashed border-gray-200 bg-gray-50/30">
                                        <select 
                                            value={row.status || 'untested'}
                                            onChange={(e) => handleCellChange(index, 'status', e.target.value)}
                                            className={`appearance-none text-xs font-semibold px-2 py-1.5 rounded border outline-none cursor-pointer w-full text-center uppercase tracking-wide transition-colors ${getStatusBadgeColor(row.status)}`}
                                        >
                                            <option value="untested">Untested</option>
                                            <option value="passed">Passed</option>
                                            <option value="failed">Failed</option>
                                            <option value="blocked">Blocked</option>
                                            <option value="skipped">Skipped</option>
                                        </select>
                                    </td>

                                    {/* Actions (Delete & Add After) - Hiện khi Hover */}
                                    <td className="px-1 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Nút Thêm Dòng Sau */}
                                            <button 
                                                onClick={() => handleAddRowAfter(index)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="Chèn dòng mới phía dưới"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>

                                            {/* Nút Xóa Dòng */}
                                            <button 
                                                onClick={() => handleDeleteRow(index)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Xóa dòng này"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-gray-400 bg-gray-50 border-dashed border-2 border-gray-200 m-4 rounded-lg">
                                    <p className="mb-2">Bảng trống</p>
                                    <button onClick={() => handleAddRowAfter(-1)} className="text-blue-600 font-semibold hover:underline">
                                        + Thêm dòng đầu tiên
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- FLOATING SNACKBAR (XÓA MULTI-ROW) --- */}
            <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-6 transition-all duration-300 z-50 ${hasSelection ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded-full text-white ring-2 ring-gray-900">
                        {selectedIndices.size}
                    </span>
                    <span className="text-sm font-medium">dòng đang chọn</span>
                </div>
                
                <div className="h-4 w-px bg-gray-700"></div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSelectedIndices(new Set())}
                        className="text-gray-400 hover:text-white text-sm px-3 py-1.5 transition-colors rounded hover:bg-gray-800"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleDeleteSelected}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default TabCustomGrid;