
import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { StockItem, WarehouseLog, StockType, BeanVariety, AlertSetting } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface WarehouseProps {
    // FIX: Correct prop type to get dataService
    data: ReturnType<typeof useMockData>['dataService'];
}

const getTypeColor = (type: StockType) => {
    switch (type) {
        case StockType.GREEN_BEAN: return 'bg-green-100 text-green-800';
        case StockType.ROASTED_BEAN: return 'bg-yellow-100 text-yellow-800';
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


const Warehouse: React.FC<WarehouseProps> = ({ data }) => {
    // FIX: Destructure from data to get the correct data object.
    const { stock, warehouseLogs, alertSettings } = data;
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
    const { t } = useTranslation();

    const [stockList, setStockList] = useState<StockItem[]>([]);
    const [logList, setLogList] = useState<WarehouseLog[]>([]);

    useEffect(() => {
        Promise.all([stock.getAll(), warehouseLogs.getAll()]).then(([stockData, logData]) => {
            setStockList(stockData);
            setLogList(logData);
        })
    }, [stock, warehouseLogs, isFormModalOpen, isDetailsModalOpen]);


    const handleViewDetails = (item: StockItem) => {
        setSelectedStockItem(item);
        setIsDetailsModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setSelectedStockItem(null);
        setIsFormModalOpen(true);
    }
    
    const handleOpenEditModal = (item: StockItem) => {
        setSelectedStockItem(item);
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(true);
    }

    const handleCloseModals = () => {
        setIsDetailsModalOpen(false);
        setIsFormModalOpen(false);
        setIsAlertModalOpen(false);
        setSelectedStockItem(null);
    }
    
    const handleSaveStock = async (stockData: (Omit<StockItem, 'id'> | StockItem) & { notes: string }) => {
        const { notes: userNotes, ...itemData } = stockData;

        if ('id' in itemData) { // Editing existing item
            const originalItem = await stock.getById(itemData.id);
            if (!originalItem) return;

            const quantityChange = itemData.quantityKg - originalItem.quantityKg;

            await stock.update(itemData.id, {
                ...itemData,
                lastUpdated: new Date().toISOString().split('T')[0]
            });

            if (quantityChange !== 0) {
                 const baseNote = `Manual stock adjustment: ${itemData.variety} (${itemData.type})`;
                 const finalNote = userNotes.trim() ? `${baseNote} - ${userNotes.trim()}` : baseNote;
                 await warehouseLogs.add({
                    itemId: itemData.id,
                    date: new Date().toISOString().split('T')[0],
                    change: quantityChange,
                    notes: finalNote
                });
            }

        } else { // Adding new item
            const newStockItem = await stock.add({
                ...itemData,
                lastUpdated: new Date().toISOString().split('T')[0]
            });

            if (newStockItem) {
                const baseNote = `Manual stock addition: ${newStockItem.variety} (${newStockItem.type})`;
                const finalNote = userNotes.trim() ? `${baseNote} - ${userNotes.trim()}` : baseNote;
                await warehouseLogs.add({
                    itemId: newStockItem.id,
                    date: new Date().toISOString().split('T')[0],
                    change: newStockItem.quantityKg,
                    notes: finalNote
                });
            }
        }
        
        handleCloseModals();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('warehouse.title')}</h1>
                 <div className="flex gap-4">
                    <button onClick={() => downloadCSV(stockList, 'warehouse_stock')} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('warehouse.exportButton')}
                    </button>
                    <button onClick={() => setIsAlertModalOpen(true)} className="px-5 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors">
                        {t('warehouse.alertsButton')}
                    </button>
                    <button onClick={handleOpenAddModal} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                        {t('warehouse.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_id')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_type')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_variety')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_qty')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_location')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase tracking-wider">{t('warehouse.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {stockList.map((item) => (
                                <tr key={item.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-brown-900">{item.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(item.type)}`}>
                                            {t(`enums.stockType.${item.type.replace(/\s/g, '')}` as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.variety}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">{item.quantityKg.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleViewDetails(item)} className="text-brand-brown-600 hover:text-brand-brown-900">{t('common.details')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isDetailsModalOpen && selectedStockItem && <StockDetailsModal item={selectedStockItem} logs={logList} onEdit={() => handleOpenEditModal(selectedStockItem)} onClose={handleCloseModals} />}
            {isFormModalOpen && <StockFormModal itemToEdit={selectedStockItem} onSave={handleSaveStock} onClose={handleCloseModals} />}
            {isAlertModalOpen && <AlertSettingsModal data={alertSettings} onClose={handleCloseModals} />}
        </div>
    );
};

interface StockDetailsModalProps {
    item: StockItem;
    logs: WarehouseLog[];
    onEdit: () => void;
    onClose: () => void;
}

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({ item, logs, onEdit, onClose }) => {
    const { t } = useTranslation();
    const itemLogs = useMemo(() => logs.filter(log => log.itemId === item.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [item, logs]);

    const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
    const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-brown-900">{t('warehouse.details_title', { itemId: item.id })}</h2>
                        <p className="text-sm text-gray-500">{item.variety} - {t(`enums.stockType.${item.type.replace(/\s/g, '')}` as any)}</p>
                    </div>
                     <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-6">
                    <div><span className="font-semibold text-gray-700">{t('warehouse.details_currentQty')}:</span><span className="ml-2 text-brand-brown-800 font-bold">{item.quantityKg.toFixed(2)} kg</span></div>
                    <div><span className="font-semibold text-gray-700">{t('warehouse.details_location')}:</span><span className="ml-2">{item.location}</span></div>
                    <div><span className="font-semibold text-gray-700">{t('warehouse.details_lastUpdated')}:</span><span className="ml-2">{item.lastUpdated}</span></div>
                </div>

                <h3 className="text-lg font-semibold text-brand-brown-800 mb-4">{t('warehouse.details_logsTitle')}</h3>
                <div className="flex-grow overflow-y-auto pr-2">
                   {itemLogs.length > 0 ? (
                        <ul className="space-y-3">
                        {itemLogs.map(log => (
                            <li key={log.id} className={`p-3 bg-brand-brown-50 rounded-lg border-l-4 ${log.change > 0 ? 'border-green-400' : 'border-red-400'}`}>
                                <div className="flex justify-between items-center">
                                    <p className={`flex items-center font-bold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.change > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                        <span className="ml-2">{log.change > 0 ? '+' : ''}{log.change.toFixed(2)} kg</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{log.date}</p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                            </li>
                        ))}
                    </ul>
                   ) : (
                    <p className="text-center text-gray-500 py-4">{t('warehouse.details_noLogs')}</p>
                   )}
                </div>
                 <div className="flex justify-end pt-6 mt-auto border-t gap-4">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                    <button type="button" onClick={onEdit} className="px-5 py-2 bg-brand-brown-600 text-white font-semibold rounded-lg hover:bg-brand-brown-700">{t('common.edit')}</button>
                </div>
            </div>
        </div>
    );
};


interface StockFormModalProps {
    itemToEdit?: StockItem | null;
    onSave: (data: (Omit<StockItem, 'id'> | StockItem) & { notes: string }) => void;
    onClose: () => void;
}

const StockFormModal: React.FC<StockFormModalProps> = ({ itemToEdit, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        type: StockType.GREEN_BEAN,
        variety: BeanVariety.ARABICA,
        quantityKg: 0,
        location: ''
    });
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                type: itemToEdit.type,
                variety: itemToEdit.variety,
                quantityKg: itemToEdit.quantityKg,
                location: itemToEdit.location,
            });
            setNotes(''); // Reset notes for new edit session
        }
    }, [itemToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.location.trim() || formData.quantityKg < 0) {
            alert('Please fill in a valid location and a non-negative quantity.');
            return;
        }

        if (itemToEdit) {
            onSave({ ...itemToEdit, ...formData, notes });
        } else {
            onSave({ ...formData, notes });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{itemToEdit ? t('warehouse.modal_editTitle') : t('warehouse.modal_addTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('warehouse.modal_stockType')}</label>
                            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as StockType})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                {Object.values(StockType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('warehouse.modal_beanVariety')}</label>
                            <select value={formData.variety} onChange={(e) => setFormData({...formData, variety: e.target.value as BeanVariety})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                                {Object.values(BeanVariety).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('warehouse.modal_qty')}</label>
                            <input type="number" step="0.01" value={formData.quantityKg || ''} onChange={(e) => setFormData({...formData, quantityKg: parseFloat(e.target.value) || 0})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('warehouse.modal_location')}</label>
                            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder={t('warehouse.modal_locationPlaceholder')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('warehouse.modal_logNotes')}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder={t('warehouse.modal_logNotesPlaceholder')}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')} Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AlertSettingsModalProps {
    data: ReturnType<typeof useMockData>['dataService']['alertSettings'];
    onClose: () => void;
}

const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({ data, onClose }) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<AlertSetting[]>([]);
    const [newAlert, setNewAlert] = useState({ variety: BeanVariety.ARABICA, type: StockType.GREEN_BEAN, threshold: 0 });

    useEffect(() => {
        data.getAll().then(setSettings);
    }, [data]);

    const handleAddAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentSettings = await data.getAll();
        const existing = currentSettings.find(s => s.variety === newAlert.variety && s.type === newAlert.type);
        if (existing) {
            alert(`An alert for ${newAlert.variety} (${newAlert.type}) already exists.`);
            return;
        }
        await data.add(newAlert);
        const updatedSettings = await data.getAll();
        setSettings(updatedSettings);
    };
    
    const handleRemoveAlert = async (id: string) => {
        await data.remove(id);
        const updatedSettings = await data.getAll();
        setSettings(updatedSettings);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('warehouse.alerts_title')}</h2>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-brand-brown-800">{t('warehouse.alerts_existing')}</h3>
                    {settings.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {settings.map(s => (
                                <li key={s.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{s.variety}</span> ({t(`enums.stockType.${s.type.replace(/\s/g, '')}` as any)})
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">{t('warehouse.alerts_threshold')}: <span className="font-bold">{s.threshold}kg</span></span>
                                        <button onClick={() => handleRemoveAlert(s.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">{t('warehouse.alerts_remove')}</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">{t('warehouse.alerts_noAlerts')}</p>}
                </div>

                <form onSubmit={handleAddAlert} className="space-y-4 border-t pt-6">
                     <h3 className="text-lg font-semibold text-brand-brown-800">{t('warehouse.alerts_addNew')}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">{t('warehouse.alerts_variety')}</label>
                             <select value={newAlert.variety} onChange={(e) => setNewAlert({...newAlert, variety: e.target.value as BeanVariety})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                {Object.values(BeanVariety).map(v => <option key={v} value={v}>{v}</option>)}
                             </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">{t('warehouse.alerts_type')}</label>
                             <select value={newAlert.type} onChange={(e) => setNewAlert({...newAlert, type: e.target.value as StockType})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                {Object.values(StockType).map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('warehouse.alerts_thresholdKg')}</label>
                            <input type="number" value={newAlert.threshold || ''} onChange={(e) => setNewAlert({...newAlert, threshold: parseInt(e.target.value) || 0})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                     </div>
                     <button type="submit" className="w-full px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('warehouse.alerts_addButton')}</button>
                </form>

                <div className="mt-6 text-right">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.close')}</button>
                </div>
            </div>
        </div>
    );
};

export default Warehouse;
