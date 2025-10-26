
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { PurchaseOrder, POStatus, BeanVariety, Supplier } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface PurchaseOrdersProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const getStatusColor = (status: POStatus) => {
    switch (status) {
        case POStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
        case POStatus.APPROVED: return 'bg-blue-100 text-blue-800';
        case POStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case POStatus.REJECTED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

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


const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ data }) => {
    const { purchaseOrders, suppliers } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
    const { t } = useTranslation();

    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [supplierList, setSupplierList] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [poData, supplierData] = await Promise.all([
            purchaseOrders.getAll(),
            suppliers.getAll()
        ]);
        setPos(poData);
        setSupplierList(supplierData);
        setIsLoading(false);
    }, [purchaseOrders, suppliers]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const supplierMap = useMemo(() => 
        supplierList.reduce((acc, sup) => {
            acc[sup.id] = sup.name;
            return acc;
        }, {} as Record<string, string>), 
    [supplierList]);

    const handleAddNew = () => {
        setEditingPO(null);
        setIsModalOpen(true);
    };

    const handleEdit = (po: PurchaseOrder) => {
        setEditingPO(po);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm(t('common.confirmDelete'))) {
            await purchaseOrders.remove(id);
            await fetchData();
        }
    }

    const handleSave = async (poData: Omit<PurchaseOrder, 'id'>) => {
        if (editingPO) {
            await purchaseOrders.update(editingPO.id, poData);
        } else {
            await purchaseOrders.add(poData);
        }
        setIsModalOpen(false);
        setEditingPO(null);
        await fetchData();
    };
    
    const handleExport = () => {
        const dataForExport = pos.map(po => ({
            ID: po.id,
            Supplier: supplierMap[po.supplierId] || 'Unknown',
            'Order Date': po.orderDate,
            'Expected Delivery': po.expectedDeliveryDate,
            'Total Value': po.items.reduce((sum, item) => sum + item.quantityKg * item.pricePerKg, 0),
            Status: po.status,
            Items: po.items.map(i => `${i.quantityKg}kg of ${i.variety} @ ${formatCurrency(i.pricePerKg)}/kg`).join('; '),
        }));
        downloadCSV(dataForExport, 'purchase_orders');
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('purchaseOrders.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('purchaseOrders.exportButton')}
                    </button>
                    <button onClick={handleAddNew} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                        {t('purchaseOrders.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_id')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_supplier')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_orderDate')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_totalValue')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_status')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('purchaseOrders.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {pos.map((po) => {
                                const totalValue = po.items.reduce((sum, item) => sum + item.quantityKg * item.pricePerKg, 0);
                                return (
                                <tr key={po.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-brown-900">{po.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplierMap[po.supplierId] || 'Unknown'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{po.orderDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{formatCurrency(totalValue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(po.status)}`}>
                                            {t(`enums.poStatus.${po.status}` as any, {})}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(po)} className="text-brand-brown-600 hover:text-brand-brown-900 mr-4">{t('common.edit')}</button>
                                        <button onClick={() => handleDelete(po.id)} className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && <POFormModal po={editingPO} suppliers={supplierList} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

interface POFormModalProps {
    po: PurchaseOrder | null;
    suppliers: Supplier[];
    onSave: (data: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    onClose: () => void;
}

const POFormModal: React.FC<POFormModalProps> = ({ po, suppliers, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        supplierId: po?.supplierId || '',
        orderDate: po?.orderDate || new Date().toISOString().split('T')[0],
        expectedDeliveryDate: po?.expectedDeliveryDate || '',
        items: po?.items.length ? po.items : [{ variety: BeanVariety.ARABICA, quantityKg: 0, pricePerKg: 0 }],
        status: po?.status || POStatus.PENDING,
    });
    
    const grandTotal = useMemo(() => formData.items.reduce((sum, item) => sum + (item.quantityKg || 0) * (item.pricePerKg || 0), 0), [formData.items]);

    const handleItemChange = (index: number, field: keyof typeof formData.items[0], value: any) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({...prev, items: newItems}));
    }

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { variety: BeanVariety.ARABICA, quantityKg: 0, pricePerKg: 0 }]}));
    }
    
    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({...prev, items: newItems}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{po ? t('purchaseOrders.modal_title_edit') : t('purchaseOrders.modal_title_create')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.modal_supplier')}</label>
                        <select value={formData.supplierId} onChange={(e) => setFormData({...formData, supplierId: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-brown-500 focus:border-brand-brown-500">
                           <option value="">{t('purchaseOrders.modal_selectSupplier')}</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.modal_orderDate')}</label>
                            <input type="date" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.modal_expectedDelivery')}</label>
                            <input type="date" value={formData.expectedDeliveryDate} onChange={(e) => setFormData({...formData, expectedDeliveryDate: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('purchaseOrders.modal_items')}</label>
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                <select value={item.variety} onChange={e => handleItemChange(index, 'variety', e.target.value as BeanVariety)} className="col-span-3 p-2 border border-gray-300 rounded-md">
                                    {Object.values(BeanVariety).filter(v => v !== BeanVariety.BLEND).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <input type="number" placeholder={t('purchaseOrders.modal_qtyPlaceholder')} value={item.quantityKg || ''} onChange={e => handleItemChange(index, 'quantityKg', parseFloat(e.target.value) || 0)} className="col-span-2 p-2 border border-gray-300 rounded-md" />
                                <input type="number" placeholder={t('purchaseOrders.modal_pricePlaceholder')} value={item.pricePerKg || ''} onChange={e => handleItemChange(index, 'pricePerKg', parseFloat(e.target.value) || 0)} className="col-span-3 p-2 border border-gray-300 rounded-md" />
                                <div className="col-span-3 text-sm text-gray-600 font-medium truncate">{formatCurrency((item.quantityKg || 0) * (item.pricePerKg || 0))}</div>
                                <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700 font-bold">&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm text-brand-brown-600 hover:text-brand-brown-800 font-semibold">{t('purchaseOrders.modal_addItem')}</button>
                    </div>

                    <div className="text-right font-bold text-xl text-brand-brown-900 pt-2 border-t mt-4">
                        {t('purchaseOrders.modal_grandTotal')}: {formatCurrency(grandTotal)}
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('purchaseOrders.modal_status')}</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as POStatus})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            {Object.values(POStatus).map(s => <option key={s} value={s}>{t(`enums.poStatus.${s}` as any)}</option>)}
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
}

export default PurchaseOrders;
