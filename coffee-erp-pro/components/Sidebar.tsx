
import React, { useMemo } from 'react';
import { View, User, UserRole } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    currentUser: User | null;
}

// Main Logo Icon
const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 21h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" /><path d="M12 2v4" /><path d="M18 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" /><path d="M2 12h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2v6Z" />
    </svg>
);

// Control Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// Navigation Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>;
const PurchaseOrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V3h5.5l3.5 3.5V21c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6.5L15.5 2z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>;
const GradingFormIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const SuppliersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const RoastingFormIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 20.5 9.5 19l-2 2.5 2 2.5 5 1.5-2-2.5 2-2.5zM19.5 15.5l-5-1.5 2-2.5-2-2.5 5 1.5 2 2.5-2 2.5zM4 9A5 5 0 0 1 9 4h0a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5Z"></path></svg>;
const ExternalRoastingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5a2.5 2.5 0 0 1 5 0"/><path d="M4 12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3"/><path d="M13 18.5a2.5 2.5 0 0 0 5 0"/><path d="M14 16a4 4 0 0 1-4-4v-3"/><path d="m14 11 3-3 3 3"/><path d="M3 13h.01"/><path d="M21 17h-8"/><path d="M7 13h.01"/></svg>;
const CuppingFormIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8Zm7 0v2.95c0 .58-.47 1.05-1.05 1.05H9.05C8.47 6 8 5.53 8 4.95V2"/><path d="M18 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3"/></svg>;
const BlendingFormIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3-3-3s-3-1-3-3a7 7 0 0 0-7 7c0 2 1 3 3 3s3 1 3 3Z"></path><path d="M20.34 10.22a7 7 0 0 0-8.56-8.56"></path><path d="M3.66 13.78a7 7 0 0 0 8.56 8.56"></path></svg>;
const WarehouseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3 6.5l8-4.5a2 2 0 0 1 2 0l8 4.5a2 2 0 0 1 1 1.85Z"></path><path d="M22 22H2"></path><path d="M6 16v.01"></path><path d="M6 12v.01"></path><rect width="8" height="12" x="12" y="10"></rect></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>;
const HPPCalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h4"/><path d="M8 18h4"/></svg>;
const FinancialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4v8c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4Z" /><path d="M7 16h10" /><path d="M7 12h10" /><path d="M12 12v8" /></svg>;
const UserManagementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const TasksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AnalyticsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;


const getViewIcon = (view: View) => {
    switch(view) {
        case 'Dashboard': return <DashboardIcon />;
        case 'Purchase Orders': return <PurchaseOrdersIcon />;
        case 'Grading Form': return <GradingFormIcon />;
        case 'Suppliers': return <SuppliersIcon />;
        case 'Roasting Form': return <RoastingFormIcon />;
        case 'External Roasting': return <ExternalRoastingIcon />;
        case 'Cupping Form': return <CuppingFormIcon />;
        case 'Blending Form': return <BlendingFormIcon />;
        case 'Warehouse': return <WarehouseIcon />;
        case 'Sales': return <SalesIcon />;
        case 'Kalkulator HPP': return <HPPCalculatorIcon />;
        case 'Financial Management': return <FinancialIcon />;
        case 'User Management': return <UserManagementIcon />;
        case 'Tasks': return <TasksIcon />;
        case 'Analytics': return <AnalyticsIcon />;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
    }
}


const NavItem: React.FC<{
    viewName: View;
    currentView: View;
    onClick: () => void;
    children: React.ReactNode;
    text: string;
}> = ({ viewName, currentView, onClick, children, text }) => {
    const isActive = currentView === viewName;
    return (
        <li
            onClick={onClick}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                    ? 'bg-brand-brown-500 text-white shadow-md'
                    : 'text-brand-brown-100 hover:bg-brand-brown-700 hover:text-white'
            }`}
        >
            {children}
            <span className="ml-3 font-medium">{text}</span>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setOpen, currentUser }) => {
    const { t } = useTranslation();
    
    const accessibleViews = useMemo(() => {
        if (!currentUser) return [];

        const allViews: View[] = [
            'Dashboard', 'Analytics', 'Purchase Orders', 'Grading Form', 'Suppliers', 'Roasting Form',
            'External Roasting', 'Cupping Form', 'Blending Form', 'Warehouse', 'Sales', 'Tasks',
            'Kalkulator HPP', 'Financial Management', 'User Management'
        ];

        const rolePermissions: Record<UserRole, View[]> = {
            [UserRole.ADMIN]: allViews,
            [UserRole.ROASTER]: ['Dashboard', 'Analytics', 'Roasting Form', 'External Roasting', 'Blending Form', 'Warehouse', 'Cupping Form', 'Tasks'],
            [UserRole.QC]: ['Dashboard', 'Analytics', 'Grading Form', 'Cupping Form', 'Warehouse', 'Tasks'],
            [UserRole.SALES]: ['Dashboard', 'Analytics', 'Sales', 'Warehouse', 'Tasks'],
            [UserRole.USER]: ['Dashboard', 'Analytics', 'Warehouse', 'Tasks']
        };
        
        return rolePermissions[currentUser.role] || [];
    }, [currentUser]);

    const handleViewChange = (view: View) => {
        setCurrentView(view);
        setOpen(false); // Close sidebar on mobile after selection
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
            <aside className={`absolute lg:relative z-40 w-64 h-full bg-brand-brown-800 text-white flex flex-col transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between p-4 border-b border-brand-brown-700">
                    <div className="flex items-center">
                        <CoffeeIcon />
                        <h1 className="ml-2 text-xl font-bold">Coffee ERP</h1>
                    </div>
                     <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-white">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul>
                        {accessibleViews.map(view => (
                            <NavItem 
                                key={view} 
                                viewName={view} 
                                currentView={currentView} 
                                onClick={() => handleViewChange(view)}
                                text={t(`sidebar.${view}` as any, {})}
                            >
                                {getViewIcon(view)}
                            </NavItem>
                        ))}
                    </ul>
                </nav>
                 <div className="p-4 border-t border-brand-brown-700">
                    <p className="text-xs text-brand-brown-300">&copy; 2024 Coffee ERP Pro</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
