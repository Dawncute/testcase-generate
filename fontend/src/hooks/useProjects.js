// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProjects = (userId) => {
    const [projects, setProjects] = useState([]);

    // Load projects khi có userId
    useEffect(() => {
        if (userId) {
            fetchProjects();
        }
    }, [userId]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/get-projects/${userId}`);
            setProjects(res.data);
        } catch (err) {
            console.error("Lỗi lấy projects:", err);
        }
    };

    const addProject = async (payload) => {
        const res = await axios.post('http://localhost:3001/add-project', payload);
        setProjects(prev => [...prev, res.data]);
        return res.data;
    };

    const updateProject = async (id, payload) => {
        const res = await axios.put(`http://localhost:3001/update-project/${id}`, payload);
        setProjects(prev => prev.map(p => p._id === id ? res.data : p));
        return res.data;
    };

    const deleteProject = async (id) => {
        await axios.delete(`http://localhost:3001/delete-project/${id}`);
        setProjects(prev => prev.filter(p => p._id !== id));
    };

    return { projects, addProject, updateProject, deleteProject };
};