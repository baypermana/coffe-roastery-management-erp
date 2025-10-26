
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { User, UserRole } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface UserManagementProps {
    data: ReturnType<typeof useMockData>['dataService'];
    currentUser: User | null;
}

const getRoleColor = (role: UserRole) => {
    switch (role) {
        case UserRole.ADMIN: return 'bg-red-200 text-red-800';
        case UserRole.ROASTER: return 'bg-yellow-200 text-yellow-800';
        case UserRole.QC: return 'bg-blue-200 text-blue-800';
        case UserRole.SALES: return 'bg-green-200 text-green-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    const header = Object.keys(data[0]);
    const processRow = (row: any) => header.map(fieldName => {
        let value = row[fieldName];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') value = JSON.stringify(value);
        let stringValue = String(value);
        if (stringValue.search(/("|,|\n)/g) >= 0) {
            stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
    }).join(',');

    const csvContent = [
        header.join(','),
        ...data.map(processRow)
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const UserManagement: React.FC<UserManagementProps> = ({ data, currentUser }) => {
    const { users } = data;
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userList, setUserList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const usersData = await users.getAll();
        setUserList(usersData);
        setIsLoading(false);
    }, [users]);

    useEffect(() => {
        if (currentUser?.role === UserRole.ADMIN) {
            fetchData();
        }
    }, [fetchData, currentUser?.role]);

    if (currentUser?.role !== UserRole.ADMIN) {
        return (
             <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600">{t('users.accessDenied')}</h1>
                <p className="mt-4 text-gray-600">{t('users.accessDeniedMsg')}</p>
            </div>
        );
    }

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser.id) {
            alert("You cannot delete your own account.");
            return;
        }
        if (window.confirm(t('common.confirmDelete'))) {
            await users.remove(id);
            await fetchData();
        }
    };

    const handleSave = async (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            const { password, ...rest } = userData;
            const updateData: Partial<User> = rest;
            if (password) { // Only update password if a new one is provided
                updateData.password = password;
            }
            await users.update(userData.id, updateData);
        } else {
            await users.add(userData as Omit<User, 'id'>);
        }
        setIsModalOpen(false);
        setEditingUser(null);
        await fetchData();
    };

    const handleExport = () => {
        const dataForExport = userList.map(({ id, username, role }) => ({
            id,
            username,
            role
        }));
        downloadCSV(dataForExport, 'users');
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('users.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('users.exportButton')}
                    </button>
                    <button onClick={handleAddNew} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                        {t('users.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('users.table_username')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('users.table_role')}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase">{t('users.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {userList.map((user) => (
                                <tr key={user.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-brown-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(user)} className="text-brand-brown-600 hover:text-brand-brown-900 mr-4">{t('common.edit')}</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <UserFormModal user={editingUser} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

interface UserFormModalProps {
    user: User | null;
    onSave: (data: Omit<User, 'id'> | User) => Promise<void>;
    onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: '',
        role: user?.role || UserRole.USER,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user && !formData.password) {
            alert('Password is required for new users.');
            return;
        }
        if (user) {
            await onSave({ ...user, ...formData });
        } else {
            await onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{user ? t('users.modal_title_edit') : t('users.modal_title_add')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('users.modal_username')}</label>
                        <input type="text" value={formData.username} onChange={(e) => setFormData(p => ({...p, username: e.target.value}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('users.modal_password')}</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({...p, password: e.target.value}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={user ? t('users.modal_passwordPlaceholder') : ""} required={!user} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('users.modal_role')}</label>
                        <select value={formData.role} onChange={(e) => setFormData(p => ({...p, role: e.target.value as UserRole}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagement;
