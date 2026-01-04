import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

export const useRequirements = (projectId) => {
    const [requirements, setRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState(null); 
    const [isGenerating, setIsGenerating] = useState(false);
    
    const inputRefs = useRef([]); 
    const [focusIndex, setFocusIndex] = useState(null);
    const isInitialLoad = useRef(true);

    // --- API & EFFECTS ---
    useEffect(() => {
        isInitialLoad.current = true;
        setIsLoading(true);
        setRequirements([]);

        axios.get(`http://localhost:3001/get-requirements/${projectId}`)
            .then(res => {
                if (res.data.length === 0) {
                    setRequirements([{
                        _id: null, text: "", testCases: [], isExpanded: false
                    }]);
                } else {
                    const mappedData = res.data.map(item => ({ ...item, isExpanded: false }));
                    setRequirements(mappedData);
                }
                setIsLoading(false);
                isInitialLoad.current = false;
            });
    }, [projectId]);

    useEffect(() => {
        if (focusIndex !== null && inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
            setFocusIndex(null);
        }
    }, [requirements, focusIndex]);

    // --- AUTOSAVE LOGIC ---
    const autoSave = useCallback(debounce((data, currentProjectId) => {
        const clean = data.map(item => {
            const { id, ...rest } = item;
            return rest;
        });

        axios.post('http://localhost:3001/save-requirements', {
            projectId: currentProjectId,
            requirements: clean
        })
        .then(() => console.log("Saved"))
        .catch(err => console.error("Save failed", err));
    }, 1000), []);

    const updateRequirements = (newData) => {
        setRequirements(newData);
        if (!isInitialLoad.current && !isGenerating) {
            autoSave(newData, projectId);
        }
    };

    // --- ACTIONS ---
    const handleTextChange = (index, value) => {
        const newData = [...requirements];
        newData[index].text = value;
        updateRequirements(newData);
    };

    const handleAddRow = (index) => {
        const newData = [...requirements];
        const newRow = { _id: null, text: "", testCases: [], isExpanded: false };
        newData.splice(index + 1, 0, newRow);
        setRequirements(newData);
        autoSave(newData, projectId);
        setFocusIndex(index + 1);
    };

    const handleDeleteRow = (index) => {
        const newData = [...requirements];
        if (newData.length <= 1) {
            newData[0].text = "";
            newData[0].testCases = [];
            setRequirements(newData);
            autoSave(newData, projectId);
            return;
        }
        newData.splice(index, 1);
        setRequirements(newData);
        autoSave(newData, projectId);
        if (index > 0) setFocusIndex(index - 1);
    };

    const toggleExpand = (index) => {
        const newData = [...requirements];
        newData[index].isExpanded = !newData[index].isExpanded;
        setRequirements(newData);
    };

    const handleGenerate = (index, text) => {
        if (!text.trim()) return alert("Vui lòng nhập nội dung trước khi tạo.");
        const currentReq = requirements[index];
        const reqId = currentReq._id || null;

        setGeneratingId(index);
        setIsGenerating(true);

        axios.post('http://localhost:3001/generate-and-save', { 
            projectId, requirementId: reqId, text
        })
        .then(res => {
            const savedDoc = res.data.data;
            const newData = [...requirements];
            newData[index] = {
                ...newData[index],
                _id: savedDoc._id,
                testCases: savedDoc.testCases,
                isExpanded: true
            };
            setRequirements(newData);
        })
        .finally(() => {
            setGeneratingId(null);
            setIsGenerating(false);
        });
    };

    return {
        requirements,
        isLoading,
        generatingId,
        inputRefs,
        handleTextChange,
        handleAddRow,
        handleDeleteRow,
        toggleExpand,
        handleGenerate
    };
};