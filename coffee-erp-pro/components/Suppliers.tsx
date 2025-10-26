
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Supplier, BeanVariety } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SuppliersProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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

const Suppliers: React.FC<SuppliersProps> = ({ data }) => {
    const { suppliers } = data;
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const { t } = useTranslation();

    const [supplierList, setSupplierList] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const suppliersData = await suppliers.getAll();
        setSupplierList(suppliersData);
        setIsLoading(false);
    }, [suppliers]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDetailsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedSupplier(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('common.confirmDelete'))) {
            await suppliers.remove(id);
            await fetchData();
        }
    };

    const handleSave = async (supplierData: Omit<Supplier, 'id'> | Supplier) => {
        if ('id' in supplierData) {
            await suppliers.update(supplierData.id, supplierData);
        } else {
            await suppliers.add(supplierData);
        }
        handleCloseModals();
        await fetchData();
    };

    const handleCloseModals = () => {
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(false);
        setSelectedSupplier(null);
    };
    
    const handleExport = () => {
        const dataForExport = supplierList.map(s => ({
            ...s,
            specialties: s.specialties.join(', '),
        }));
        downloadCSV(dataForExport, 'suppliers');
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('suppliers.title')}</h1>
                 <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('suppliers.exportButton')}
                    </button>
                    <button onClick={handleAddNew} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                        {t('suppliers.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('suppliers.table_name')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('suppliers.table_origin')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('suppliers.table_contact')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('suppliers.table_phone')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('suppliers.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {supplierList.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-brown-900">{supplier.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.origin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.contactPerson}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewDetails(supplier)} className="text-blue-600 hover:text-blue-900">{t('common.view')}</button>
                                        <button onClick={() => handleEdit(supplier)} className="text-brand-brown-600 hover:text-brand-brown-900">{t('common.edit')}</button>
                                        <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isDetailsModalOpen && selectedSupplier && <SupplierDetailsModal supplier={selectedSupplier} onClose={handleCloseModals} />}
            {isFormModalOpen && <SupplierFormModal supplier={selectedSupplier} onSave={handleSave} onClose={handleCloseModals} />}
        </div>
    );
};

// Details Modal
interface SupplierDetailsModalProps {
    supplier: Supplier;
    onClose: () => void;
}
const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({ supplier, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-brown-900">{t('suppliers.details_title')}</h2>
                        <p className="text-sm text-gray-500">{supplier.name}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('suppliers.details_origin')}</p>
                        <p className="text-lg text-brand-brown-800">{supplier.origin}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('suppliers.details_specialties')}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {supplier.specialties.map(v => (
                                <span key={v} className="px-3 py-1 text-xs font-semibold text-white bg-brand-brown-600 rounded-full">{v}</span>
                            ))}
                        </div>
                    </div>
                    <div className="border-t my-4"></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('suppliers.details_contact')}</p>
                        <p className="text-lg text-brand-brown-800">{supplier.contactPerson}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('suppliers.details_phone')}</p>
                        <p className="text-lg text-brand-brown-800">{supplier.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('suppliers.details_email')}</p>
                        <p className="text-lg text-brand-brown-800">{supplier.email}</p>
                    </div>
                </div>
                <div className="flex justify-end pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                </div>
            </div>
        </div>
    );
};

// Form Modal
interface SupplierFormModalProps {
    supplier: Supplier | null;
    onSave: (data: Omit<Supplier, 'id'> | Supplier) => Promise<void>;
    onClose: () => void;
}
const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
        name: supplier?.name || '',
        contactPerson: supplier?.contactPerson || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        origin: supplier?.origin || '',
        specialties: supplier?.specialties || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSpecialtyChange = (variety: BeanVariety) => {
        setFormData(prev => {
            const currentSpecialties = prev.specialties;
            if (currentSpecialties.includes(variety)) {
                return { ...prev, specialties: currentSpecialties.filter(v => v !== variety) };
            } else {
                return { ...prev, specialties: [...currentSpecialties, variety] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (supplier) {
            await onSave({ ...supplier, ...formData });
        } else {
            await onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{supplier ? t('suppliers.modal_editTitle') : t('suppliers.modal_addTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_name')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_origin')}</label>
                        <input type="text" name="origin" value={formData.origin} placeholder={t('suppliers.modal_originPlaceholder')} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_contact')}</label>
                        <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_phone')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('suppliers.modal_specialties')}</label>
                        <div className="mt-2 flex flex-wrap gap-4">
                            {Object.values(BeanVariety).filter(v => v !== BeanVariety.BLEND).map(variety => (
                                <label key={variety} className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.specialties.includes(variety)} 
                                        onChange={() => handleSpecialtyChange(variety)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-brown-600 focus:ring-brand-brown-500"
                                    />
                                    <span>{variety}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')} Supplier</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Suppliers;
