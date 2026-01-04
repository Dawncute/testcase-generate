// src/components/Sidebar.jsx
import React from 'react';
import { COLORS, ICONS } from '../assets/constants';

const Sidebar = ({ isOpen, projects, navigate, location, onOpenCreate }) => {
    return (
        <div className={`bg-gray-800 text-white transition-all duration-300 flex flex-col ${isOpen ? "w-64" : "w-0 overflow-hidden"}`}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700 bg-gray-900">
                <span className="font-bold text-lg">Projects</span>
                <button onClick={onOpenCreate} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center transition">+</button>
            </div>
            <ul className="p-2 space-y-1 overflow-y-auto flex-1">
                <li onClick={() => navigate('/home/dashboard')} className={`p-3 rounded cursor-pointer flex items-center gap-3 transition ${location.pathname.includes('dashboard') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Dashboard
                </li>
                <div className="border-t border-gray-700 my-2"></div>
                {projects.map(project => {
                    const colorClass = COLORS.find(c => c.id === (project.color || 'blue'))?.class || 'text-blue-500';
                    return (
                        <li key={project._id} onClick={() => navigate(`/home/project/${project._id}`)} className={`p-3 rounded cursor-pointer flex items-center gap-3 transition group ${location.pathname.includes(project._id) ? 'bg-gray-700 border-l-4 border-blue-500' : 'hover:bg-gray-700'}`}>
                            <span className={colorClass}>{ICONS[project.icon || 'folder']}</span>
                            <span className="truncate flex-1">{project.name}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};
export default Sidebar;