
import React, { useState } from 'react';
import { User } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (userId: string, data: { password?: string }) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setError(t('profile.error_passwordMismatch'));
            return;
        }
        
        const dataToSave: { password?: string } = {};
        if (password) {
            dataToSave.password = password;
        }

        onSave(user.id, dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('profile.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('profile.username')}</label>
                        <input type="text" value={user.username} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('profile.role')}</label>
                        <input type="text" value={user.role} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('profile.newPassword')}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('profile.newPasswordPlaceholder')} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('profile.confirmPassword')}</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('profile.confirmPasswordPlaceholder')} />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
