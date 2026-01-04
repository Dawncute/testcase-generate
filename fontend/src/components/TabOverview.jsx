import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
    passed: '#10B981', 
    failed: '#EF4444', 
    blocked: '#F59E0B', 
    skipped: '#666666ff', 
    untested: '#b2b2b2ff',
    default: '#6366F1'
};

const TabOverview = () => {
    const { id: projectId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true; // Cleanup flag để tránh update state khi unmount
        setLoading(true);
        
        axios.get(`http://localhost:3001/api/testcase_tabs/summary/${projectId}`)
            .then(res => {
                if (isMounted) setData(res.data);
            })
            .catch(err => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [projectId]);

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Đang tải báo cáo...</div>;
    if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded m-4">Lỗi: {error}</div>;

    // --- XỬ LÝ DỮ LIỆU AN TOÀN ---
    // Nếu API trả về null hoặc format sai, tự tạo data rỗng giả lập để không crash
    const safeData = data || { 
        totalCases: 0, 
        statusCounts: { passed: 0, failed: 0, blocked: 0, skipped: 0, untested: 0 }, 
        tabsDetails: [] 
    };

    const totalCases = safeData.totalCases || 0;
    
    // Chỉ tạo data cho PieChart nếu có test case
    const pieData = totalCases > 0 ? [
        { name: 'Passed', value: safeData.statusCounts?.passed || 0, color: COLORS.passed },
        { name: 'Failed', value: safeData.statusCounts?.failed || 0, color: COLORS.failed },
        { name: 'Blocked', value: safeData.statusCounts?.blocked || 0, color: COLORS.blocked },
        { name: 'Skipped', value: safeData.statusCounts?.skipped || 0, color: COLORS.skipped },
        { name: 'Untested', value: safeData.statusCounts?.untested || 0, color: COLORS.untested }
    ].filter(item => item.value > 0) : [];

    const passRate = totalCases > 0 
        ? Math.round(((safeData.statusCounts?.passed || 0) / totalCases) * 100) 
        : 0;

    const activeTabs = safeData.tabsDetails?.filter(t => t.total > 0) || [];

    // --- COMPONENT EMPTY STATE (Hiển thị khi không có data) ---
    const EmptyChartState = () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">Chưa có dữ liệu Test Case</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-10 animate-fade-in-down">
            
            {/* 1. CARDS SUMMARY: Luôn hiển thị dù là số 0 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard label="Tổng Test Cases" value={totalCases} color="text-gray-800" />
                <SummaryCard label="Passed" value={safeData.statusCounts?.passed || 0} color="text-green-600" />
                <SummaryCard label="Failed" value={safeData.statusCounts?.failed || 0} color="text-red-600" />
                <SummaryCard label="Tỷ lệ Pass" value={`${passRate}%`} color="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. PIE CHART */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1 flex flex-col items-center min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-700 w-full mb-4">Phân bố trạng thái</h3>
                    
                    {/* ĐIỀU KIỆN: Nếu không có case nào -> Hiện Empty State thay vì Chart */}
                    {totalCases === 0 ? (
                        <div className="w-full h-[250px]">
                            <EmptyChartState />
                        </div>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS.default} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* 3. PROGRESS LIST */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-700 mb-6">Chi tiết theo bảng</h3>
                    
                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {(!safeData.tabsDetails || safeData.tabsDetails.length === 0) && (
                            <div className="h-[200px] flex items-center justify-center">
                                <p className="text-gray-400 text-sm">Chưa có bảng dữ liệu nào được tạo.</p>
                            </div>
                        )}

                        {safeData.tabsDetails?.map((tab) => {
                            // Vẫn render tên bảng nhưng thanh progress trống nếu total = 0
                            if (!tab) return null;
                            const total = tab.total || 0;
                            const passed = tab.passed || 0;
                            const failed = tab.failed || 0;
                            const blocked = tab.blocked || 0;
                            const skipped = tab.skipped || 0;

                            return (
                                <div key={tab.tabId}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                            {tab.tabName || "Unnamed Tab"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {passed}/{total} Passed
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                                        {total > 0 ? (
                                            <>
                                                {passed > 0 && <div style={{ width: `${(passed/total)*100}%` }} className="bg-green-500 h-2.5"></div>}
                                                {failed > 0 && <div style={{ width: `${(failed/total)*100}%` }} className="bg-red-500 h-2.5"></div>}
                                                {blocked > 0 && <div style={{ width: `${(blocked/total)*100}%` }} className="bg-yellow-500 h-2.5"></div>}
                                                {skipped > 0 && <div style={{ width: `${(skipped/total)*100}%` }} className="bg-gray-500 h-2.5"></div>}
                                            </>
                                        ) : (
                                            // Thanh màu xám nếu chưa có data
                                            <div className="bg-gray-100 h-2.5 w-full"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ... Phần code bên trên giữ nguyên ... */}

            {/* 4. BAR CHART - SO SÁNH CÁC BẢNG (CÓ SCROLL NGANG) */}
            {activeTabs.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">So sánh các bảng</h3>
                    
                    {/* CONTAINER SCROLL: Tạo vùng cuộn */}
                    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                        
                        {/* DYNAMIC WIDTH CONTAINER: 
                            - Tính toán chiều rộng dựa trên số lượng cột.
                            - Mỗi cột chiếm khoảng 80px.
                            - Nếu ít cột quá thì lấy tối thiểu 100% để không bị co lại.
                         */}
                        <div style={{ 
                            height: 350, 
                            minWidth: '100%', 
                            width: Math.max(activeTabs.length * 80, 600) // Logic tính width tự động
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={activeTabs}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    // Tăng khoảng cách giữa các nhóm cột
                                    barCategoryGap="20%" 
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                    
                                    {/* XAxis: Thêm interval={0} để hiện HẾT tên, không bị ẩn */}
                                    <XAxis 
                                        dataKey="tabName" 
                                        tick={{fontSize: 12}} 
                                        interval={0} 
                                        // Nếu tên dài quá, có thể cho nghiêng chữ đi một chút
                                        angle={activeTabs.length > 10 ? -45 : 0}
                                        textAnchor={activeTabs.length > 10 ? "end" : "middle"}
                                        height={activeTabs.length > 10 ? 60 : 30} // Tăng chiều cao footer nếu chữ nghiêng
                                    />
                                    
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    
                                    {/* Giới hạn độ rộng tối đa của cột là 40px để nhìn đẹp hơn */}
                                    <Bar dataKey="passed" name="Passed" stackId="a" fill={COLORS.passed} barSize={40} maxBarSize={50} />
                                    <Bar dataKey="failed" name="Failed" stackId="a" fill={COLORS.failed} barSize={40} maxBarSize={50} />
                                    <Bar dataKey="blocked" name="Blocked" stackId="a" fill={COLORS.blocked} barSize={40} maxBarSize={50} />
                                    <Bar dataKey="skipped" name="Skipped" stackId="a" fill={COLORS.skipped} barSize={40} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Hướng dẫn người dùng nếu quá dài */}
                    {activeTabs.length > 8 && (
                        <p className="text-center text-xs text-gray-400 mt-2 italic">
                            Kéo sang ngang để xem thêm &rarr;
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ label, value, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p className={`text-sm font-medium opacity-80 ${color}`}>{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);

export default TabOverview;