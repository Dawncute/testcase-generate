import { useParams, useOutletContext } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react'; // [EDITED] Thêm useCallback

// Import components và constants
import TabOverview from '../components/TabOverview';
import TabTestCases from '../components/TabTestCases';
import TabCustomGrid from '../components/TabCustomGrid';
import { COLORS, ICONS } from '../assets/constants';

// Import hooks
import { useProjectTabs } from '../hooks/useProjectTabs';

// --- COMPONENT SNACKBAR (Internal) ---
const Snackbar = ({ message, isOpen, onClose, type = 'error' }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[99999] animate-fade-in-up ${type === 'error' ? 'bg-gray-900 text-white' : 'bg-green-600 text-white'}`}>
            {type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white">✕</button>
        </div>
    );
};

function ProjectDetail() {
    const { id } = useParams();
    const { projects, openEditModal, openDeleteModal } = useOutletContext() || {};
    const project = projects?.find(p => p._id === id);

    // State
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const projectMenuRef = useRef(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Hooks
    const { customTabs, addTabLocal, updateTabName, deleteTab } = useProjectTabs(id, project?.customTabs || []);
    
    // State Menu & Edit Tab
    const [tabMenu, setTabMenu] = useState(null); 
    const [editingTabId, setEditingTabId] = useState(null);
    const [tempName, setTempName] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'error' });

    // --- LOGIC "XEM THÊM" ---
    const VISIBLE_LIMIT = 3; 
    const visibleCustomTabs = customTabs.slice(0, VISIBLE_LIMIT);
    const hiddenCustomTabs = customTabs.slice(VISIBLE_LIMIT);
    
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef(null);

    // --- EFFECT 1: Reset khi chuyển Project ---
    useEffect(() => {
        setActiveTab('overview');
        setIsProjectMenuOpen(false);
        setIsMoreMenuOpen(false);
        setTabMenu(null);
    }, [id]);

    // --- EFFECT 2: Global Event Listeners ---
    useEffect(() => {
        const closeMenu = () => setTabMenu(null);
        window.addEventListener('click', closeMenu);
        window.addEventListener('scroll', closeMenu, true);
        
        function handleClickOutside(event) {
            if (projectMenuRef.current && !projectMenuRef.current.contains(event.target)) {
                setIsProjectMenuOpen(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setIsMoreMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('scroll', closeMenu, true);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- HANDLERS ---
    const showSnackbar = (msg, type = 'error') => {
        setSnackbar({ open: true, message: msg, type });
        setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 3000);
    };

    const handleTabMenuClick = (e, tabId) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setTabMenu({ x: rect.left, y: rect.bottom + 5, tabId: tabId });
    };

    const startRenaming = (e) => {
        e.stopPropagation();
        const tab = customTabs.find(t => t.id === tabMenu.tabId);
        if (tab) {
            setEditingTabId(tab.id);
            setTempName(tab.name);
        }
        setTabMenu(null);
        setIsMoreMenuOpen(false);
    };

    const saveTabName = async () => {
        if (!tempName.trim()) { setEditingTabId(null); return; }
        const oldName = customTabs.find(t => t.id === editingTabId)?.name;
        if (tempName === oldName) { setEditingTabId(null); return; }

        try {
            await updateTabName(editingTabId, tempName);
            setEditingTabId(null); 
        } catch (error) {
            showSnackbar(error.message, 'error');
            setEditingTabId(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') saveTabName();
        if (e.key === 'Escape') setEditingTabId(null);
    };

    const handleDeleteTab = (e) => {
        e.stopPropagation();
        if (tabMenu?.tabId) {
            deleteTab(tabMenu.tabId);
            if (activeTab === tabMenu.tabId) setActiveTab('overview');
        }
        setTabMenu(null);
        setIsMoreMenuOpen(false);
    };
    
    const handleCreateTabSuccess = (newTabInfo) => {
        addTabLocal(newTabInfo); 
        setActiveTab(newTabInfo.id); 
    };

    // [EDITED] Đã xóa khối comment thừa "--- EFFECTS ---" ở đây

    if (!project) return <div>Đang tải...</div>;

    const colorObj = COLORS.find(c => c.id === (project.color || 'blue')) || COLORS[0];
    const STATIC_TABS = [{ id: 'overview', label: 'Overview' }, { id: 'testcases', label: 'Requirements' }];

    // --- [EDITED] TỐI ƯU HÓA RENDER TAB ITEM BẰNG USECALLBACK ---
    // Giúp tránh render lại danh sách tab không cần thiết
    const renderTabItem = (tab, isInDropdown = false) => {
        const isActive = activeTab === tab.id;
        const isEditing = editingTabId === tab.id;

        return (
            <div 
                key={tab.id} 
                onClick={() => {
                    setActiveTab(tab.id);
                    if (isInDropdown) setIsMoreMenuOpen(false);
                }}
                className={`
                    group flex items-center gap-2 text-sm font-medium cursor-pointer transition-all
                    ${isInDropdown 
                        ? `w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}` 
                        : `relative pl-4 pr-8 py-3 border-b-2 whitespace-nowrap ${isActive ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}` 
                    }
                `}
            >
                {isEditing ? (
                    <input 
                        autoFocus
                        className="w-24 px-1 py-0.5 text-xs border border-blue-400 rounded outline-none"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveTabName}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" /></svg>
                        {tab.name}
                    </span>
                )}
                
                <button 
                    onClick={(e) => handleTabMenuClick(e, tab.id)}
                    className={`
                        p-1 rounded-full hover:bg-gray-200 text-gray-400 
                        ${isInDropdown ? 'ml-auto' : 'absolute right-1 top-1/2 transform -translate-y-1/2'}
                        ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded shadow h-full flex flex-col relative">
            
            {/* --- HEADER --- */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${colorObj.bg} ${colorObj.class}`}>
                            {ICONS[project.icon || 'folder']}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                            <p className="text-sm text-gray-500">ID: {project._id.slice(-6)}</p>
                        </div>
                    </div>

                    <div className="relative" ref={projectMenuRef}>
                        <button onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        </button>
                        {isProjectMenuOpen && (
                            <div className="absolute right-0 top-10 w-40 bg-white rounded shadow-xl border border-gray-100 z-50 animate-fade-in-down">
                                <button onClick={() => { setIsProjectMenuOpen(false); openEditModal(project); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Đổi tên
                                </button>
                                <button onClick={() => { setIsProjectMenuOpen(false); openDeleteModal(project); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    Xóa Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TAB BAR MỚI --- */}
                <div className="flex items-center border-b border-gray-200 pt-2 relative">
                    {STATIC_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                    {visibleCustomTabs.map(tab => renderTabItem(tab, false))}

                    {hiddenCustomTabs.length > 0 && (
                        <div className="relative ml-2" ref={moreMenuRef}>
                            <button 
                                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors ${
                                    hiddenCustomTabs.some(t => t.id === activeTab) ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
                                }`}
                            >
                                <span>Xem thêm ({hiddenCustomTabs.length})</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>

                            {isMoreMenuOpen && (
                                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-30 max-h-80 overflow-y-auto animate-fade-in-up">
                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-50">
                                        Các bảng khác
                                    </div>
                                    {hiddenCustomTabs.map(tab => renderTabItem(tab, true))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
                {activeTab === 'overview' && <TabOverview />}
                
                {activeTab === 'testcases' && (
                    <TabTestCases 
                        projectId={project._id} 
                        onCreateTab={handleCreateTabSuccess}
                        existingTabs={customTabs}
                    />
                )}

                {/* [EDITED] Logic Render Custom Grid gọn hơn */}
                {(() => {
                    const activeCustomTab = customTabs.find(t => t.id === activeTab);
                    return activeCustomTab ? (
                        <TabCustomGrid 
                            key={activeCustomTab.id} 
                            projectId={project._id} 
                            tabId={activeCustomTab.id} 
                        />
                    ) : null;
                })()}
            </div>

            {/* --- FLOATING ACTION MENU --- */}
            {tabMenu && (
                <div 
                    style={{ position: 'fixed', top: tabMenu.y, left: tabMenu.x, zIndex: 9999 }}
                    className="bg-white rounded-lg shadow-xl border border-gray-100 w-40 py-1 animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <button onClick={startRenaming} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Đổi tên
                    </button>
                    <button onClick={handleDeleteTab} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Xóa bảng
                    </button>
                </div>
            )}

            <Snackbar 
                isOpen={snackbar.open} 
                message={snackbar.message} 
                type={snackbar.type} 
                onClose={() => setSnackbar(prev => ({...prev, open: false}))} 
            />
        </div>
    );
}

export default ProjectDetail;