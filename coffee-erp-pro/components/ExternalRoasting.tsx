
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { ExternalRoastLog, StockItem, StockType, BeanVariety } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ExternalRoastingProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
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


const ExternalRoasting: React.FC<ExternalRoastingProps> = ({ data }) => {
    const { externalRoasts, stock } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();

    const [logList, setLogList] = useState<ExternalRoastLog[]>([]);
    const [greenBeanStock, setGreenBeanStock] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [logs, stocks] = await Promise.all([externalRoasts.getAll(), stock.getAll()]);
        setLogList(logs);
        setGreenBeanStock(stocks.filter(s => s.type === StockType.GREEN_BEAN && s.quantityKg > 0));
        setIsLoading(false);
    }, [externalRoasts, stock]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setIsModalOpen(false);
        await fetchData();
    };

    const handleExport = () => {
        const dataForExport = logList.map(log => ({
            ...log,
            totalCost: log.roastingCostPerKg * log.greenBeanWeightSentKg,
        }));
        downloadCSV(dataForExport, 'external_roasting_logs');
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('externalRoasting.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('externalRoasting.exportButton')}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors"
                        disabled={greenBeanStock.length === 0}
                    >
                        {greenBeanStock.length === 0 ? t('externalRoasting.addButton_disabled') : t('externalRoasting.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_roastery')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_dateSent')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_dateReceived')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_weightSent')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_weightReceived')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('externalRoasting.table_totalCost')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {logList.map(log => {
                                const totalCost = log.roastingCostPerKg * log.greenBeanWeightSentKg;
                                return (
                                <tr key={log.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 font-medium text-brand-brown-900">{log.roasteryName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.dateSent}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.dateReceived}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.greenBeanWeightSentKg.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{log.roastedBeanWeightReceivedKg.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-brand-brown-800">{formatCurrency(totalCost)}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    {logList.length === 0 && <p className="p-4 text-center text-gray-500">{t('externalRoasting.noRecords')}</p>}
                </div>
            </div>
            
            {isModalOpen && <ExternalRoastFormModal onSave={handleSave} greenBeanStock={greenBeanStock} data={data} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

interface ExternalRoastFormModalProps {
    onSave: () => Promise<void>;
    onClose: () => void;
    greenBeanStock: StockItem[];
    data: ReturnType<typeof useMockData>['dataService'];
}

const ExternalRoastFormModal: React.FC<ExternalRoastFormModalProps> = ({ onSave, onClose, greenBeanStock, data }) => {
    const { stock, warehouseLogs, externalRoasts } = data;
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<ExternalRoastLog, 'id' | 'greenBeanVariety'>>({
        roasteryName: '',
        dateSent: new Date().toISOString().split('T')[0],
        dateReceived: new Date().toISOString().split('T')[0],
        greenBeanStockId: '',
        greenBeanWeightSentKg: 0,
        roastedBeanWeightReceivedKg: 0,
        roastingCostPerKg: 0,
        notes: ''
    });
    
    const [roastedBeanLocation, setRoastedBeanLocation] = useState('R-EXT');
    const selectedStockItem = useMemo(() => greenBeanStock.find(s => s.id === formData.greenBeanStockId), [formData.greenBeanStockId, greenBeanStock]);

    const totalCost = useMemo(() => formData.roastingCostPerKg * formData.greenBeanWeightSentKg, [formData.roastingCostPerKg, formData.greenBeanWeightSentKg]);
    const weightLoss = useMemo(() => {
        if (formData.greenBeanWeightSentKg > 0 && formData.roastedBeanWeightReceivedKg > 0) {
            return ((formData.greenBeanWeightSentKg - formData.roastedBeanWeightReceivedKg) / formData.greenBeanWeightSentKg) * 100;
        }
        return 0;
    }, [formData.greenBeanWeightSentKg, formData.roastedBeanWeightReceivedKg]);

    const handleStockSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const selected = greenBeanStock.find(s => s.id === id);
        if (selected) {
             setFormData(prev => ({ ...prev, greenBeanStockId: id, greenBeanWeightSentKg: selected.quantityKg }));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockItem || formData.greenBeanWeightSentKg <= 0 || formData.greenBeanWeightSentKg > selectedStockItem.quantityKg) {
            alert('Invalid green bean selection or weight is greater than available stock.');
            return;
        }
        if (formData.roastedBeanWeightReceivedKg > formData.greenBeanWeightSentKg) {
            alert('Roasted weight cannot be greater than green bean weight sent.');
            return;
        }
        if (!formData.roasteryName.trim()) {
            alert('Roastery Name is required.');
            return;
        }

        const logData: Omit<ExternalRoastLog, 'id'> = {
            ...formData,
            greenBeanVariety: selectedStockItem.variety,
        };
        
        // 1. Deduct Green Bean Stock
        await stock.update(selectedStockItem.id, { quantityKg: selectedStockItem.quantityKg - formData.greenBeanWeightSentKg });
        await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: selectedStockItem.id, change: -formData.greenBeanWeightSentKg, notes: `Sent to external roastery: ${formData.roasteryName}` });

        // 2. Add/Update Roasted Bean Stock
        const allStock = await stock.getAll();
        const existingRoastedStock = allStock.find(s => s.type === StockType.ROASTED_BEAN && s.variety === selectedStockItem.variety && s.location === roastedBeanLocation);
        let roastedStockItemId: string | undefined = '';
        if (existingRoastedStock) {
            roastedStockItemId = existingRoastedStock.id;
            await stock.update(existingRoastedStock.id, { quantityKg: existingRoastedStock.quantityKg + formData.roastedBeanWeightReceivedKg });
        } else {
            const newStock = await stock.add({ type: StockType.ROASTED_BEAN, variety: selectedStockItem.variety, quantityKg: formData.roastedBeanWeightReceivedKg, location: roastedBeanLocation, lastUpdated: new Date().toISOString().split('T')[0] });
            roastedStockItemId = newStock?.id;
        }
        
        if (roastedStockItemId) {
            await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: roastedStockItemId, change: formData.roastedBeanWeightReceivedKg, notes: `Received from external roastery: ${formData.roasteryName}` });
        }
        
        await externalRoasts.add(logData);
        await onSave();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('externalRoasting.modal_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="roasteryName" placeholder={t('externalRoasting.modal_roastery')} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_dateSent')}</label>
                            <input type="date" name="dateSent" value={formData.dateSent} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_dateReceived')}</label>
                            <input type="date" name="dateReceived" value={formData.dateReceived} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_sourceBatch')}</label>
                        <select name="greenBeanStockId" value={formData.greenBeanStockId} onChange={handleStockSelectionChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                           <option value="">{t('externalRoasting.modal_selectBatch')}</option>
                            {greenBeanStock.map(s => <option key={s.id} value={s.id}>{s.variety} - {s.quantityKg.toFixed(2)}kg in {s.location} (ID: {s.id})</option>)}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_weightSent')}</label>
                            <input type="number" name="greenBeanWeightSentKg" step="0.01" value={formData.greenBeanWeightSentKg || ''} max={selectedStockItem?.quantityKg} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_weightReceived')}</label>
                            <input type="number" name="roastedBeanWeightReceivedKg" step="0.01" value={formData.roastedBeanWeightReceivedKg || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_roastingCost')}</label>
                            <input type="number" name="roastingCostPerKg" value={formData.roastingCostPerKg || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('externalRoasting.modal_roastedLocation')}</label>
                            <input type="text" value={roastedBeanLocation} onChange={e => setRoastedBeanLocation(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center border-t pt-4 mt-4">
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('externalRoasting.modal_calc_weightLoss')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{weightLoss.toFixed(2)}%</dd></div>
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('externalRoasting.modal_calc_totalCost')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{formatCurrency(totalCost)}</dd></div>
                    </div>
                    
                    <textarea name="notes" placeholder={t('externalRoasting.modal_notes')} value={formData.notes} onChange={handleChange} rows={2} className="w-full p-2 border border-gray-300 rounded-md" />

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default ExternalRoasting;
