// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProjectModals from '../components/ProjectModals';
import { useProjects } from '../hooks/useProjects';

function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. State User & UI
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // 2. State Modal Management
    const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'delete' | null
    const [selectedProject, setSelectedProject] = useState(null);

    // 3. Custom Hook Logic
    const { projects, addProject, updateProject, deleteProject } = useProjects(user?._id);

    // Load User
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate("/");
        }
    }, [navigate]);

    // --- HANDLERS ---
    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        navigate("/");
    };

    // Xử lý logic khi bấm nút "Lưu" trong Modal
    const handleModalConfirm = async (formData) => {
        // Kiểm tra trùng tên (Client side check)
        const isDuplicate = projects.some(p => 
            p.name.toLowerCase() === formData?.name?.trim().toLowerCase() && 
            (modalType === 'create' || p._id !== selectedProject?._id)
        );
        if (isDuplicate) return false; // Báo lỗi cho modal biết

        try {
            if (modalType === 'create') {
                const newProj = await addProject({ ...formData, userId: user._id });
                navigate(`/home/project/${newProj._id}`);
            } else if (modalType === 'edit') {
                await updateProject(selectedProject._id, formData);
            } else if (modalType === 'delete') {
                await deleteProject(selectedProject._id);
                navigate('/home/dashboard');
            }
            setModalType(null); // Đóng modal nếu thành công
            return true;
        } catch (e) {
            alert(e.response?.data || "Có lỗi xảy ra");
            return true;
        }
    };

    const openEditModal = (project) => { setSelectedProject(project); setModalType('edit'); };
    const openDeleteModal = (project) => { setSelectedProject(project); setModalType('delete'); };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar 
                isOpen={isSidebarOpen} 
                projects={projects} 
                navigate={navigate} 
                location={location} 
                onOpenCreate={() => {setSelectedProject(null); setModalType('create')}} 
            />

            <div className="flex-1 overflow-y-auto flex flex-col h-screen">
                <Header 
                    user={user} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    isSidebarOpen={isSidebarOpen}
                    onLogout={handleLogout}
                    navigate={navigate}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
                    {/* Truyền context xuống các trang con như Dashboard/Detail */}
                    <Outlet context={{ updateUser: setUser, projects, openEditModal, openDeleteModal }} />
                </main>
            </div>

            {/* Component quản lý toàn bộ Popup */}
            <ProjectModals 
                modalType={modalType} 
                onClose={() => setModalType(null)} 
                onConfirm={handleModalConfirm}
                projectData={selectedProject}
            />
        </div>
    );
}

export default Home;