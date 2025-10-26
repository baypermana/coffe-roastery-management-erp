import React, { useState } from 'react';
import { View } from './types';
import { useAuth } from './contexts/AuthContext';
import { useSupabaseData } from './services/supabaseService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PurchaseOrders from './components/PurchaseOrders';
import GradingForm from './components/GradingForm';
import Warehouse from './components/Warehouse';
import Suppliers from './components/Suppliers';
import RoastingForm from './components/RoastingForm';
import ExternalRoasting from './components/ExternalRoasting';
import CuppingForm from './components/CuppingForm';
import BlendingForm from './components/BlendingForm';
import Sales from './components/Sales';
import HPPCalculator from './components/HPPCalculator';
import FinancialManagement from './components/FinancialManagement';
import UserManagement from './components/UserManagement';
import LoginPage from './components/LoginPage';
import Tasks from './components/Tasks';
import { useTranslation } from './hooks/useTranslation';
import RegistrationPage from './components/RegistrationPage';
import ProfileModal from './components/ProfileModal';
import Analytics from './components/Analytics';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useTranslation();
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'id' : 'en');
    };
    return (
        <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 text-sm text-brand-brown-700 bg-brand-brown-100 rounded-lg hover:bg-brand-brown-200 font-semibold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="font-bold">{language.toUpperCase()}</span>
        </button>
    );
};

const UserMenu = ({ onLogout, onProfileClick }: { onLogout: () => void; onProfileClick: () => void; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <span className="text-brand-brown-700 font-medium hidden sm:block">{t('header.welcome', { username: user.username })}</span>
                <img className="w-10 h-10 rounded-full" src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.username}/>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a href="#" onClick={(e) => { e.preventDefault(); onProfileClick(); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('profile.myProfile')}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">{t('header.logout')}</a>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('Dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { user, loading, signIn, signUp, signOut, updateProfile } = useAuth();
    const { dataService } = useSupabaseData();
    const { t } = useTranslation();

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        const result = await signIn(email, password);
        if (result.success) {
            setCurrentView('Dashboard');
            return true;
        }
        return false;
    };

    const handleRegister = async (email: string, password: string, username: string): Promise<{success: boolean, message: string}> => {
        const result = await signUp(email, password, username);
        if (result.success) {
            return { success: true, message: t('register.success') };
        }
        return { success: false, message: result.error || t('register.error_userExists') };
    };

    const handleUpdateProfile = async (_userId: string, data: { password?: string }) => {
        await updateProfile(data);
        setIsProfileModalOpen(false);
    };

    const handleLogout = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-brand-brown-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-brown-700"></div>
                <p className="ml-4 text-lg font-semibold text-brand-brown-800">Loading...</p>
            </div>
        );
    }

    if (!user) {
        if (authView === 'login') {
            return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />;
        }
        return <RegistrationPage onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
    }

    const renderView = () => {
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard data={dataService} />;
            case 'Purchase Orders':
                return <PurchaseOrders data={dataService} />;
            case 'Grading Form':
                return <GradingForm data={dataService} />;
            case 'Warehouse':
                return <Warehouse data={dataService} />;
            case 'Suppliers':
                return <Suppliers data={dataService} />;
            case 'Roasting Form':
                return <RoastingForm data={dataService} />;
            case 'External Roasting':
                return <ExternalRoasting data={dataService} />;
            case 'Cupping Form':
                return <CuppingForm data={dataService} />;
            case 'Blending Form':
                return <BlendingForm data={dataService} />;
            case 'Sales':
                return <Sales data={dataService} />;
            case 'Kalkulator HPP':
                return <HPPCalculator data={dataService} />;
            case 'Financial Management':
                return <FinancialManagement data={dataService} currentUser={user} />;
            case 'User Management':
                return <UserManagement data={dataService} currentUser={user} />;
            case 'Tasks':
                return <Tasks data={dataService} currentUser={user} />;
            case 'Analytics':
                return <Analytics data={dataService} />;
            default:
                return (
                    <div className="p-8 bg-white rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold text-brand-brown-800">{currentView}</h1>
                        <p className="mt-4 text-gray-600">This feature is under construction.</p>
                        <img src="https://picsum.photos/800/400?grayscale" alt="Under Construction" className="mt-4 rounded-lg"/>
                    </div>
                );
        }
    };

    const MenuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    );

    return (
        <div className="flex h-screen bg-brand-brown-50 font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setOpen={setSidebarOpen} currentUser={user} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white border-b border-brand-brown-200 lg:justify-end">
                     <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-brand-brown-800 rounded-md lg:hidden"
                        aria-label="Open sidebar"
                    >
                       <MenuIcon/>
                    </button>
                    <h1 className="text-xl font-bold text-brand-brown-900 lg:hidden">{t(`sidebar.${currentView}` as any, {})}</h1>
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />
                        <UserMenu onLogout={handleLogout} onProfileClick={() => setIsProfileModalOpen(true)} />
                    </div>
                </header>
                <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
            {isProfileModalOpen && user && (
                <ProfileModal
                    user={user}
                    onClose={() => setIsProfileModalOpen(false)}
                    onSave={handleUpdateProfile}
                />
            )}
        </div>
    );
};

export default App;
