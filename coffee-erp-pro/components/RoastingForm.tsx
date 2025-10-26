
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { RoastProfile, StockItem, StockType, BeanVariety, PurchaseOrder, WarehouseLog } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface RoastingFormProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
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

const RoastingForm: React.FC<RoastingFormProps> = ({ data }) => {
    const { roasts, stock } = data;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRoast, setSelectedRoast] = useState<RoastProfile | null>(null);
    const { t } = useTranslation();

    const [roastList, setRoastList] = useState<RoastProfile[]>([]);
    const [greenBeanStock, setGreenBeanStock] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [roastsData, stockData] = await Promise.all([roasts.getAll(), stock.getAll()]);
        setRoastList(roastsData);
        setGreenBeanStock(stockData.filter(s => s.type === StockType.GREEN_BEAN && s.quantityKg > 0));
        setIsLoading(false);
    }, [roasts, stock]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleAddNew = () => {
        setSelectedRoast(null);
        setIsFormModalOpen(true);
    };

    const handleViewDetails = (roast: RoastProfile) => {
        setSelectedRoast(roast);
        setIsDetailsModalOpen(true);
    };

    const handleSave = async () => {
        setIsFormModalOpen(false);
        setSelectedRoast(null);
        await fetchData();
    };
    
    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDetailsModalOpen(false);
        setSelectedRoast(null);
    }

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('roasting.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={() => downloadCSV(roastList, 'roast-profiles')} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('roasting.exportButton')}
                    </button>
                    <button onClick={handleAddNew} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors" disabled={greenBeanStock.length === 0}>
                        {greenBeanStock.length === 0 ? t('roasting.addButton_disabled') : t('roasting.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_batchId')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_variety')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_input')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_output')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_roastTime')}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase">{t('roasting.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {roastList.map(roast => (
                                <tr key={roast.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 text-sm font-medium text-brand-brown-900">{roast.batchId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{roast.roastDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{roast.greenBeanVariety}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{roast.greenBeanWeightKg.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{roast.roastedWeightKg.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{(roast.totalRoastTime/60).toFixed(2)} min</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleViewDetails(roast)} className="text-brand-brown-600 hover:text-brand-brown-900">{t('common.viewDetails')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {roastList.length === 0 && <p className="p-4 text-center text-gray-500">{t('roasting.noRecords')}</p>}
                </div>
            </div>
            
            {isFormModalOpen && <RoastFormModal roast={selectedRoast} greenBeanStock={greenBeanStock} onSave={handleSave} onClose={handleCloseModals} data={data}/>}
            {isDetailsModalOpen && selectedRoast && <RoastDetailsModal roast={selectedRoast} onClose={handleCloseModals} />}
        </div>
    );
};

// Details Modal
interface RoastDetailsModalProps {
    roast: RoastProfile;
    onClose: () => void;
}
const RoastDetailsModal: React.FC<RoastDetailsModalProps> = ({ roast, onClose }) => {
    const { t } = useTranslation();
    const weightLoss = ((roast.greenBeanWeightKg - roast.roastedWeightKg) / roast.greenBeanWeightKg) * 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-brown-900">{t('roasting.details_title', { batchId: roast.batchId })}</h2>
                        <p className="text-sm text-gray-500">{roast.roastDate} - {roast.greenBeanVariety}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.details_roaster')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{roast.roasterName}</dd></div>
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.details_ambientTemp')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{roast.ambientTemp}°C</dd></div>
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.details_chargeWeight')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{roast.greenBeanWeightKg.toFixed(2)} kg</dd></div>
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.details_roastedWeight')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{roast.roastedWeightKg.toFixed(2)} kg</dd></div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('roasting.details_milestones')}</h3>
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('roasting.details_chargeTemp')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{roast.chargeTemp}°C</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('roasting.details_turnaround')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{formatTime(roast.turnaroundTime)} @ {roast.turnaroundTemp}°C</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('roasting.details_dryingEnd')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{formatTime(roast.dryingPhaseEndTime)}</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('roasting.details_firstCrack')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{formatTime(roast.firstCrackTime)}</dd></div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('roasting.details_postRoast')}</h3>
                        <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div className="p-3 bg-blue-50 rounded-lg"><dt className="text-xs font-medium text-blue-500">{t('roasting.details_totalTime')}</dt><dd className="mt-1 font-semibold text-blue-800">{formatTime(roast.totalRoastTime)}</dd></div>
                            <div className="p-3 bg-blue-50 rounded-lg"><dt className="text-xs font-medium text-blue-500">{t('roasting.details_dropTemp')}</dt><dd className="mt-1 font-semibold text-blue-800">{roast.dropTemp}°C</dd></div>
                            <div className="p-3 bg-blue-50 rounded-lg"><dt className="text-xs font-medium text-blue-500">{t('roasting.details_devTime')}</dt><dd className="mt-1 font-semibold text-blue-800">{formatTime(roast.developmentTime)}</dd></div>
                            <div className="p-3 bg-blue-50 rounded-lg"><dt className="text-xs font-medium text-blue-500">{t('roasting.details_weightLoss')}</dt><dd className="mt-1 font-semibold text-blue-800">{weightLoss.toFixed(2)}%</dd></div>
                            <div className="p-3 bg-green-50 rounded-lg"><dt className="text-xs font-medium text-green-500">{t('roasting.details_roastingCost')}</dt><dd className="mt-1 font-semibold text-green-800">{formatCurrency(roast.internalRoastingCostPerKg)}/kg</dd></div>
                        </dl>
                    </div>

                     <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('roasting.details_notes')}</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{roast.notes || t('roasting.details_noNotes')}</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-auto border-t">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                </div>
            </div>
        </div>
    );
};


// Form Modal
interface RoastFormModalProps {
    roast: RoastProfile | null;
    greenBeanStock: StockItem[];
    onSave: () => Promise<void>;
    onClose: () => void;
    data: ReturnType<typeof useMockData>['dataService'];
}

const RoastFormModal: React.FC<RoastFormModalProps> = ({ roast, greenBeanStock, onSave, onClose, data }) => {
    const { stock, warehouseLogs, roasts, purchaseOrders } = data;
    const { t } = useTranslation();
    const [greenBeanStockId, setGreenBeanStockId] = useState(roast?.greenBeanStockId || '');
    const selectedStockItem = useMemo(() => greenBeanStock.find(s => s.id === greenBeanStockId), [greenBeanStockId, greenBeanStock]);

    const [allLogs, setAllLogs] = useState<WarehouseLog[]>([]);
    const [allPOs, setAllPOs] = useState<PurchaseOrder[]>([]);

    useEffect(() => {
        const fetchDeps = async () => {
            const [logsData, poData] = await Promise.all([warehouseLogs.getAll(), purchaseOrders.getAll()]);
            setAllLogs(logsData);
            setAllPOs(poData);
        };
        fetchDeps();
    }, [warehouseLogs, purchaseOrders]);

    const [formData, setFormData] = useState<Omit<RoastProfile, 'id' | 'batchId' | 'greenBeanVariety' | 'greenBeanStockId' | 'developmentTime'>>({
        roastDate: roast?.roastDate || new Date().toISOString().split('T')[0],
        roasterName: roast?.roasterName || 'Admin',
        ambientTemp: roast?.ambientTemp || 0,
        greenBeanWeightKg: roast?.greenBeanWeightKg || 0,
        chargeTemp: roast?.chargeTemp || 0,
        turnaroundTime: roast?.turnaroundTime || 0,
        turnaroundTemp: roast?.turnaroundTemp || 0,
        dryingPhaseEndTime: roast?.dryingPhaseEndTime || 0,
        firstCrackTime: roast?.firstCrackTime || 0,
        totalRoastTime: roast?.totalRoastTime || 0,
        dropTemp: roast?.dropTemp || 0,
        roastedWeightKg: roast?.roastedWeightKg || 0,
        colorScore: roast?.colorScore || '',
        internalRoastingCostPerKg: roast?.internalRoastingCostPerKg || 0,
        notes: roast?.notes || '',
    });

    const [roastedBeanLocation, setRoastedBeanLocation] = useState('R1');

    const greenBeanCostPerKg = useMemo(() => {
        if (!selectedStockItem || allLogs.length === 0 || allPOs.length === 0) return 0;
        
        const purchaseLog = allLogs.find(log => log.itemId === selectedStockItem.id && log.change > 0 && log.notes.includes('Stock from PO'));
        if (!purchaseLog) return 0;
        
        const poIdMatch = purchaseLog.notes.match(/Stock from PO #(\w+-\w+)/);
        if (!poIdMatch) return 0;
        
        const po = allPOs.find(p => p.id === poIdMatch[1]);
        const poItem = po?.items.find(item => item.variety === selectedStockItem.variety);
        
        return poItem?.pricePerKg || 0;
    }, [selectedStockItem, allLogs, allPOs]);

    const finalRoastedCostPerKg = useMemo(() => {
        if (formData.roastedWeightKg <= 0) return 0;
        
        const totalGreenBeanCost = greenBeanCostPerKg * formData.greenBeanWeightKg;
        const totalRoastingCost = formData.internalRoastingCostPerKg * formData.greenBeanWeightKg;
        
        return (totalGreenBeanCost + totalRoastingCost) / formData.roastedWeightKg;
    }, [formData.roastedWeightKg, formData.greenBeanWeightKg, formData.internalRoastingCostPerKg, greenBeanCostPerKg]);
    
    const weightLoss = useMemo(() => {
        if (formData.greenBeanWeightKg > 0 && formData.roastedWeightKg >= 0 && formData.roastedWeightKg <= formData.greenBeanWeightKg) {
            return ((formData.greenBeanWeightKg - formData.roastedWeightKg) / formData.greenBeanWeightKg) * 100;
        }
        return 0;
    }, [formData.greenBeanWeightKg, formData.roastedWeightKg]);
    
    const developmentTime = useMemo(() => {
        if (formData.totalRoastTime > 0 && formData.firstCrackTime > 0 && formData.totalRoastTime > formData.firstCrackTime) {
            return formData.totalRoastTime - formData.firstCrackTime;
        }
        return 0;
    }, [formData.totalRoastTime, formData.firstCrackTime]);

    const handleStockSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setGreenBeanStockId(id);
        const selected = greenBeanStock.find(s => s.id === id);
        if (selected) {
            setFormData(prev => ({...prev, greenBeanWeightKg: selected.quantityKg}));
        }
    }
    
    const handleNumberChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStockItem || formData.greenBeanWeightKg <= 0 || formData.greenBeanWeightKg > selectedStockItem.quantityKg) {
            alert('Invalid green bean selection or weight is greater than available stock.');
            return;
        }
        if (formData.roastedWeightKg > formData.greenBeanWeightKg) {
            alert('Roasted weight cannot be greater than green bean weight.');
            return;
        }

        const newRoastProfileData: Omit<RoastProfile, 'id'> = {
            ...formData,
            batchId: `RB-${Date.now()}`,
            greenBeanStockId: selectedStockItem.id,
            greenBeanVariety: selectedStockItem.variety,
            developmentTime: developmentTime,
        };

        // 1. Deduct Green Bean Stock
        await stock.update(selectedStockItem.id, { quantityKg: selectedStockItem.quantityKg - formData.greenBeanWeightKg });
        await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: selectedStockItem.id, change: -formData.greenBeanWeightKg, notes: `Used for roast batch ${newRoastProfileData.batchId}` });

        // 2. Add/Update Roasted Bean Stock
        const allStock = await stock.getAll();
        const existingRoastedStock = allStock.find(s => s.type === StockType.ROASTED_BEAN && s.variety === selectedStockItem.variety && s.location === roastedBeanLocation);
        let roastedStockItemId: string | undefined = '';
        if (existingRoastedStock) {
            roastedStockItemId = existingRoastedStock.id;
            await stock.update(existingRoastedStock.id, { quantityKg: existingRoastedStock.quantityKg + formData.roastedWeightKg });
        } else {
            const newStock = await stock.add({ type: StockType.ROASTED_BEAN, variety: selectedStockItem.variety, quantityKg: formData.roastedWeightKg, location: roastedBeanLocation, lastUpdated: new Date().toISOString().split('T')[0] });
            roastedStockItemId = newStock?.id;
        }
        if(roastedStockItemId){
            await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: roastedStockItemId, change: formData.roastedWeightKg, notes: `From roast batch ${newRoastProfileData.batchId}` });
        }
        
        await roasts.add(newRoastProfileData);
        await onSave();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{roast ? t('roasting.modal_title_edit') : t('roasting.modal_title_add')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('roasting.modal_sourceBatch')}</label>
                        <select value={greenBeanStockId} onChange={handleStockSelectionChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                           <option value="">{t('roasting.modal_selectBatch')}</option>
                            {greenBeanStock.map(s => <option key={s.id} value={s.id}>{s.variety} - {s.quantityKg.toFixed(2)}kg in {s.location} (ID: {s.id})</option>)}
                        </select>
                    </div>

                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('roasting.modal_preRoast')}</legend>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_roaster')}</label><input type="text" value={formData.roasterName} onChange={e => setFormData(p => ({...p, roasterName: e.target.value}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_ambientTemp')}</label><input type="number" value={formData.ambientTemp || ''} onChange={e => handleNumberChange('ambientTemp', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_chargeWeight')}</label><input type="number" step="0.01" value={formData.greenBeanWeightKg || ''} max={selectedStockItem?.quantityKg} onChange={e => handleNumberChange('greenBeanWeightKg', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_chargeTemp')}</label><input type="number" value={formData.chargeTemp || ''} onChange={e => handleNumberChange('chargeTemp', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('roasting.modal_milestones')}</legend>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_turnaroundTime')}</label><div className="flex items-center"><input type="number" value={formData.turnaroundTime || ''} onChange={e => handleNumberChange('turnaroundTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /><span className="ml-2 text-gray-500 text-sm">({formatTime(formData.turnaroundTime)})</span></div></div>
                             <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_turnaroundTemp')}</label><input type="number" value={formData.turnaroundTemp || ''} onChange={e => handleNumberChange('turnaroundTemp', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                             <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_dryingEnd')}</label><div className="flex items-center"><input type="number" value={formData.dryingPhaseEndTime || ''} onChange={e => handleNumberChange('dryingPhaseEndTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /><span className="ml-2 text-gray-500 text-sm">({formatTime(formData.dryingPhaseEndTime)})</span></div></div>
                             <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_firstCrack')}</label><div className="flex items-center"><input type="number" value={formData.firstCrackTime || ''} onChange={e => handleNumberChange('firstCrackTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /><span className="ml-2 text-gray-500 text-sm">({formatTime(formData.firstCrackTime)})</span></div></div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('roasting.modal_postRoast')}</legend>
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_totalTime')}</label><div className="flex items-center"><input type="number" value={formData.totalRoastTime || ''} onChange={e => handleNumberChange('totalRoastTime', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /><span className="ml-2 text-gray-500 text-sm">({formatTime(formData.totalRoastTime)})</span></div></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_dropTemp')}</label><input type="number" value={formData.dropTemp || ''} onChange={e => handleNumberChange('dropTemp', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_roastedWeight')}</label><input type="number" step="0.01" value={formData.roastedWeightKg || ''} onChange={e => handleNumberChange('roastedWeightKg', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_colorScore')}</label><input type="text" value={formData.colorScore} onChange={e => setFormData(p => ({...p, colorScore: e.target.value}))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div className="md:col-span-5 grid grid-cols-2 gap-4">
                               <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_opCost')}</label><input type="number" value={formData.internalRoastingCostPerKg || ''} onChange={e => handleNumberChange('internalRoastingCostPerKg', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('roasting.modal_opCostPlaceholder')} /></div>
                               <div><label className="block text-sm font-medium text-gray-700">{t('roasting.modal_roastedLocation')}</label><input type="text" value={roastedBeanLocation} onChange={e => setRoastedBeanLocation(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('roasting.modal_roastedLocationPlaceholder')} required /></div>
                            </div>
                        </div>
                    </fieldset>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.modal_calc_weightLoss')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{weightLoss.toFixed(2)}%</dd></div>
                         <div className="p-3 bg-brand-brown-50 rounded-lg"><dt className="text-sm font-medium text-gray-500">{t('roasting.modal_calc_devTime')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{formatTime(developmentTime)}</dd></div>
                         <div className="p-3 bg-green-50 rounded-lg"><dt className="text-sm font-medium text-green-600">{t('roasting.modal_calc_finalCost')}</dt><dd className="mt-1 text-lg font-semibold text-green-800">{formatCurrency(finalRoastedCostPerKg)}</dd></div>
                    </div>
                     
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('roasting.modal_notes')}</label>
                        <textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
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

export default RoastingForm;
