
import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Blend, StockItem, StockType, BeanVariety, RoastProfile, PurchaseOrder, WarehouseLog } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface BlendingFormProps {
    // FIX: Correct prop type to get dataService
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


const BlendingForm: React.FC<BlendingFormProps> = ({ data }) => {
    const { blends, stock } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();
    
    const [blendList, setBlendList] = useState<Blend[]>([]);
    const [roastedBeanStock, setRoastedBeanStock] = useState<StockItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const allBlends = await blends.getAll();
            const allStock = await stock.getAll();
            setBlendList(allBlends);
            setRoastedBeanStock(allStock.filter(s => s.type === StockType.ROASTED_BEAN && s.quantityKg > 0 && s.variety !== BeanVariety.BLEND));
        };
        fetchData();
    }, [blends, stock, isModalOpen]);

    const handleSave = () => {
        setIsModalOpen(false);
    };

    const handleExport = () => {
        const dataForExport = blendList.map(blend => ({
            id: blend.id,
            name: blend.name,
            totalCostPerKg: blend.totalCostPerKg,
            creationDate: blend.creationDate,
            notes: blend.notes,
            components: blend.components.map(c => `${c.percentage}% ${c.variety} (Stock ID: ${c.stockId})`).join('; '),
        }));
        downloadCSV(dataForExport, 'blends');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('blending.title')}</h1>
                <div className="flex gap-4">
                     <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('blending.exportButton')}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors"
                        disabled={roastedBeanStock.length < 2}
                    >
                        {roastedBeanStock.length < 2 ? t('blending.addButton_disabled') : t('blending.addButton')}
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('blending.table_name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('blending.table_components')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('blending.table_date')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {blendList.map(blend => (
                                <tr key={blend.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 font-medium text-brand-brown-900">{blend.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {blend.components.map(c => `${c.variety} (${c.percentage}%)`).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{blend.creationDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {blendList.length === 0 && <p className="p-4 text-center text-gray-500">{t('blending.noRecords')}</p>}
                </div>
            </div>
            
            {isModalOpen && <BlendFormModal onSave={handleSave} roastedBeanStock={roastedBeanStock} data={data} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

interface BlendFormModalProps {
    onSave: () => void;
    onClose: () => void;
    roastedBeanStock: StockItem[];
    data: ReturnType<typeof useMockData>['dataService'];
}

const BlendFormModal: React.FC<BlendFormModalProps> = ({ onSave, onClose, roastedBeanStock, data }) => {
    const { stock, warehouseLogs, blends, roasts, purchaseOrders } = data;
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [totalBatchSize, setTotalBatchSize] = useState(0);
    const [location, setLocation] = useState('B1');
    const [components, setComponents] = useState<{ stockId: string; variety: BeanVariety; percentage: number; costPerKg: number }[]>([]);
    const [dbData, setDbData] = useState<{allRoasts: RoastProfile[], allPOs: PurchaseOrder[], allLogs: WarehouseLog[]}>({ allRoasts: [], allPOs: [], allLogs: [] });

    useEffect(() => {
        const fetchDbData = async () => {
            const [roastData, poData, logData] = await Promise.all([
                roasts.getAll(),
                purchaseOrders.getAll(),
                warehouseLogs.getAll(),
            ]);
            setDbData({ allRoasts: roastData, allPOs: poData, allLogs: logData });
        };
        fetchDbData();
    }, [roasts, purchaseOrders, warehouseLogs]);

    const calculateRoastedBeanCost = (roastedStockId: string): number => {
        const { allRoasts, allPOs, allLogs } = dbData;
        // 1. Find the roast batch ID from the warehouse log for the roasted bean
        const roastLog = allLogs.find(log => log.itemId === roastedStockId && log.change > 0 && log.notes.includes('From roast batch'));
        if (!roastLog) return 0;
        
        // FIX: The regex was too restrictive and failed to match demo data like 'RB-DEMO-001'.
        // This new regex allows for letters, numbers, and hyphens in the batch ID.
        const batchIdMatch = roastLog.notes.match(/From roast batch (RB-[\w-]+)/);
        if (!batchIdMatch) return 0;
        const batchId = batchIdMatch[1];
        
        // 2. Find the roast profile
        const roastProfile = allRoasts.find(r => r.batchId === batchId);
        if (!roastProfile) return 0;
        
        // 3. Find the source green bean and its purchase log
        const greenBeanStockId = roastProfile.greenBeanStockId;
        const purchaseLog = allLogs.find(log => log.itemId === greenBeanStockId && log.change > 0 && log.notes.includes('Stock from PO'));
        if (!purchaseLog) return 0;
        const poIdMatch = purchaseLog.notes.match(/Stock from PO #(\w+-\w+)/);
        if (!poIdMatch) return 0;
        const poId = poIdMatch[1];

        // 4. Find the PO and the price
        const po = allPOs.find(p => p.id === poId);
        const poItem = po?.items.find(item => item.variety === roastProfile.greenBeanVariety);
        if (!poItem) return 0;
        
        // 5. Calculate cost adjusted for weight loss
        const totalGreenBeanCost = poItem.pricePerKg * roastProfile.greenBeanWeightKg;
        if (roastProfile.roastedWeightKg === 0) return 0; // Avoid division by zero
        const costPerKgRoasted = totalGreenBeanCost / roastProfile.roastedWeightKg;
        
        return costPerKgRoasted;
    };


    const totalPercentage = useMemo(() => components.reduce((sum, c) => sum + (c.percentage || 0), 0), [components]);
    const totalBlendCost = useMemo(() => {
        if (totalPercentage === 0) return 0;
        const weightedCost = components.reduce((sum, c) => sum + (c.costPerKg * (c.percentage / 100)), 0);
        return weightedCost;
    }, [components, totalPercentage]);


    const handleAddComponent = () => {
        setComponents([...components, { stockId: '', variety: BeanVariety.ARABICA, percentage: 0, costPerKg: 0 }]);
    };
    
    const handleComponentChange = (index: number, field: string, value: string | number) => {
        const newComponents = [...components];
        const component = newComponents[index];

        if (field === 'stockId') {
            const selectedStock = roastedBeanStock.find(s => s.id === value);
            component.stockId = value as string;
            component.variety = selectedStock?.variety || BeanVariety.ARABICA;
            component.costPerKg = selectedStock ? calculateRoastedBeanCost(selectedStock.id) : 0;
        } else if (field === 'percentage') {
            component.percentage = parseFloat(value as string) || 0;
        }

        setComponents(newComponents);
    };

    const handleRemoveComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Blend name is required.');
            return;
        }
        if (totalPercentage !== 100) {
            alert(`Total percentage must be 100%, but it is ${totalPercentage}%.`);
            return;
        }
        if (components.some(c => c.stockId === '')) {
            alert('Please select a stock item for all components.');
            return;
        }
        
        // Check if there is enough stock for each component
        for (const component of components) {
            const stockItem = await stock.getById(component.stockId);
            const requiredQty = totalBatchSize * (component.percentage / 100);
            if (!stockItem || stockItem.quantityKg < requiredQty) {
                alert(`Not enough stock for ${component.variety}. Required: ${requiredQty.toFixed(2)}kg, Available: ${stockItem?.quantityKg.toFixed(2) || 0}kg.`);
                return;
            }
        }
        
        // Deduct stock
        for (const component of components) {
            const stockItem = await stock.getById(component.stockId);
            if (stockItem) {
                const requiredQty = totalBatchSize * (component.percentage / 100);
                await stock.update(component.stockId, { quantityKg: stockItem.quantityKg - requiredQty });
                await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: component.stockId, change: -requiredQty, notes: `Used for blend: ${name} (${totalBatchSize}kg batch)` });
            }
        }
        
        // Add new blend stock
        const newBlendStock = await stock.add({
            type: StockType.ROASTED_BEAN,
            // FIX: This was a shorthand property `variety` which is not in scope.
            // It should be `variety: BeanVariety.BLEND`.
            variety: BeanVariety.BLEND,
            quantityKg: totalBatchSize,
            location,
            lastUpdated: new Date().toISOString().split('T')[0]
        });

        if (newBlendStock) {
             await warehouseLogs.add({
                date: new Date().toISOString().split('T')[0],
                itemId: newBlendStock.id,
                change: newBlendStock.quantityKg,
                notes: `Created blend: ${name} (${totalBatchSize}kg batch)`
            });
        }
        
        // Create blend record
        await blends.add({
            name,
            components,
            totalCostPerKg: totalBlendCost,
            creationDate: new Date().toISOString().split('T')[0],
            notes
        });
        
        onSave();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('blending.modal_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder={t('blending.modal_namePlaceholder')} value={name} onChange={e => setName(e.target.value)} className="p-2 border border-gray-300 rounded-md" required />
                        <input type="number" placeholder={t('blending.modal_batchSizePlaceholder')} value={totalBatchSize || ''} onChange={e => setTotalBatchSize(parseFloat(e.target.value) || 0)} className="p-2 border border-gray-300 rounded-md" required />
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="font-semibold text-gray-700">{t('blending.modal_components')}</label>
                        {components.map((component, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                <select value={component.stockId} onChange={e => handleComponentChange(index, 'stockId', e.target.value)} className="col-span-6 p-2 border border-gray-300 rounded-md" required>
                                    <option value="">{t('blending.modal_selectStock')}</option>
                                    {roastedBeanStock.map(s => <option key={s.id} value={s.id}>{s.variety} ({s.quantityKg.toFixed(2)}kg available)</option>)}
                                </select>
                                <input type="number" placeholder="%" value={component.percentage || ''} onChange={e => handleComponentChange(index, 'percentage', e.target.value)} className="col-span-2 p-2 border border-gray-300 rounded-md" required/>
                                <div className="col-span-3 text-sm text-gray-600 font-medium truncate">{formatCurrency(component.costPerKg)}/kg</div>
                                <button type="button" onClick={() => handleRemoveComponent(index)} className="col-span-1 text-red-500 hover:text-red-700 font-bold p-2 rounded-full">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddComponent} className="text-sm text-brand-brown-600 hover:text-brand-brown-800 font-semibold pt-2">{t('blending.modal_addComponent')}</button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <div className="p-3 bg-brand-brown-50 rounded-lg text-center"><dt className="text-sm font-medium text-gray-500">{t('blending.modal_totalPercentage')}</dt><dd className={`mt-1 text-lg font-semibold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalPercentage}%</dd></div>
                        <div className="p-3 bg-brand-brown-50 rounded-lg text-center"><dt className="text-sm font-medium text-gray-500">{t('blending.modal_totalCost')}</dt><dd className="mt-1 text-lg font-semibold text-brand-brown-800">{formatCurrency(totalBlendCost)}/kg</dd></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder={t('blending.modal_locationPlaceholder')} value={location} onChange={e => setLocation(e.target.value)} className="p-2 border border-gray-300 rounded-md" required/>
                        <textarea placeholder={t('blending.modal_notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} rows={1} className="p-2 border border-gray-300 rounded-md" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('blending.modal_createButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlendingForm;
