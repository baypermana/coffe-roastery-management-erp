
import React from 'react';

interface CardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: React.ReactNode; // Changed from string to React.ReactNode
    changeType?: 'positive' | 'negative' | 'neutral';
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, change, changeType, className = '' }) => {
    const changeColorClass = changeType === 'positive' ? 'text-brand-green-700' : changeType === 'negative' ? 'text-red-600' : 'text-gray-600';

    return (
        <div className={`bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105 ${className}`}>
            <div className="p-3 bg-brand-brown-100 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-brand-brown-700">{title}</p>
                <p className="text-2xl font-bold text-brand-brown-900">{value}</p>
                {change && (
                    <p className={`text-xs mt-1 flex items-center font-medium ${changeColorClass}`}>
                        {change}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Card;
