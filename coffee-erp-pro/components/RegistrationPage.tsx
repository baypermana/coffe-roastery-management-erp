
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface RegistrationPageProps {
    onRegister: (username: string, password: string) => Promise<{success: boolean, message: string}>;
    onSwitchToLogin: () => void;
}

const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-700">
        <path d="M10 21h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" /><path d="M12 2v4" /><path d="M18 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" /><path d="M2 12h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2v6Z" />
    </svg>
);

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegister, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError(t('register.error_passwordMismatch'));
            return;
        }
        setIsLoading(true);
        const result = await onRegister(username, password);
        if (result.success) {
            setSuccess(result.message);
            setUsername('');
            setPassword('');
            setConfirmPassword('');
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-brown-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CoffeeIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-brown-900">{t('register.title')}</h1>
                    <p className="mt-2 text-gray-600">{t('register.subtitle')}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                     <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-brown-500 focus:border-brand-brown-500 focus:z-10 sm:text-sm" placeholder={t('register.usernamePlaceholder')} />
                        </div>
                        <div>
                            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-brown-500 focus:border-brand-brown-500 focus:z-10 sm:text-sm" placeholder={t('register.passwordPlaceholder')} />
                        </div>
                         <div>
                            <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-brown-500 focus:border-brand-brown-500 focus:z-10 sm:text-sm" placeholder={t('register.confirmPasswordPlaceholder')} />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                    <div>
                        <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-brown-700 hover:bg-brand-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown-500 transition-colors disabled:bg-gray-400">
                            {isLoading ? t('register.registerButton')+'...' : t('register.registerButton')}
                        </button>
                    </div>
                     <div className="text-center text-sm">
                        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }} className="font-medium text-brand-brown-600 hover:text-brand-brown-800">
                             {t('register.switchToLogin')}
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
