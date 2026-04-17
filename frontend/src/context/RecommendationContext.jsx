import React, { createContext, useContext, useState, useEffect } from 'react';

const RecommendationContext = createContext(null);

export const RecommendationProvider = ({ children }) => {
    // Инициализация из localStorage, если есть данные
    const [selections, setSelections] = useState(() => {
        const saved = localStorage.getItem('stepper_draft');
        return saved ? JSON.parse(saved) : {
            fish: null,
            waterbody: null,
            equipment: {
                'удочка': null,
                'куртка': null,
                'штаны': null,
                'обувь': null,
                'головной убор': null
            },
            lure: null,
            groundbait: null
        };
    });

    // Сохраняем в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem('stepper_draft', JSON.stringify(selections));
    }, [selections]);

    const updateSelection = (key, value) => {
        setSelections(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updateEquipment = (category, value) => {
        setSelections(prev => ({
            ...prev,
            equipment: {
                ...prev.equipment,
                [category]: value
            }
        }));
    };

    const resetSelections = () => {
        const empty = {
            fish: null,
            waterbody: null,
            equipment: {
                'удочка': null,
                'куртка': null,
                'штаны': null,
                'обувь': null,
                'головной убор': null
            },
            lure: null,
            groundbait: null
        };
        setSelections(empty);
        localStorage.removeItem('stepper_draft');
    };

    return (
        <RecommendationContext.Provider value={{ selections, updateSelection, updateEquipment, resetSelections }}>
            {children}
        </RecommendationContext.Provider>
    );
};

export const useRecommendation = () => {
    const context = useContext(RecommendationContext);
    if (!context) {
        throw new Error('useRecommendation must be used within a RecommendationProvider');
    }
    return context;
};