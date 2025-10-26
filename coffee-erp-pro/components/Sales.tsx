
import React, { useState, useMemo, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
// FIX: Import PaymentStatus to be used when creating a new SalesRecord
import { SalesRecord, StockItem, StockType, BeanVariety, PaymentStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SalesProps {
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


const Sales: React.FC<SalesProps> = ({ data }) => {
    const { sales, stock } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();

    const [salesList, setSalesList] = useState<SalesRecord[]>([]);
    const [availableStock, setAvailableStock] = useState<StockItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [salesData, stockData] = await Promise.all([sales.getAll(), stock.getAll()]);
            setSalesList(salesData.sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
            setAvailableStock(stockData.filter(s => s.type === StockType.ROASTED_BEAN && s.quantityKg > 0));
        };
        fetchData();
    }, [sales, stock, isModalOpen]);


    const handleSave = () => {
        setIsModalOpen(false);
    };

    const handleExport = () => {
        const dataForExport = salesList.map(sale => ({
            ID: sale.id,
            'Invoice #': sale.invoiceNumber,
            'Sale Date': sale.saleDate,
            Customer: sale.customerName,
            'Total Amount': sale.totalAmount,
            'Payment Status': sale.paymentStatus,
            'Shipping Address': sale.shippingAddress,
            Notes: sale.notes,
            Items: sale.items.map(i => `${i.quantityKg}kg of ${i.variety} @ ${formatCurrency(i.pricePerKg)}/kg`).join('; '),
        }));
        downloadCSV(dataForExport, 'sales_records');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('sales.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('sales.exportButton')}
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors" disabled={availableStock.length === 0}>
                        {availableStock.length === 0 ? t('sales.addButton_disabled') : t('sales.addButton')}
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('sales.table_saleId')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('sales.table_date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('sales.table_customer')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('sales.table_items')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('sales.table_totalAmount')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {salesList.map(sale => (
                                <tr key={sale.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 font-medium text-sm text-brand-brown-900">{sale.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{sale.saleDate}</td>
                                    {/* FIX: Use `customerName` instead of `customer` to match the SalesRecord type */}
                                    <td className="px-6 py-4 text-sm text-gray-600">{sale.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{sale.items.map(i => `${i.quantityKg}kg ${i.variety === BeanVariety.BLEND ? 'Blend' : i.variety}`).join(', ')}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-brand-brown-800">{formatCurrency(sale.totalAmount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {salesList.length === 0 && <p className="p-4 text-center text-gray-500">{t('sales.noRecords')}</p>}
                </div>
            </div>

            {isModalOpen && <SalesFormModal onSave={handleSave} availableStock={availableStock} data={data} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

interface SalesFormModalProps {
    onSave: () => void;
    onClose: () => void;
    availableStock: StockItem[];
    data: ReturnType<typeof useMockData>['dataService'];
}

const SalesFormModal: React.FC<SalesFormModalProps> = ({ onSave, onClose, availableStock, data }) => {
    const { stock, warehouseLogs, sales } = data;
    const { t } = useTranslation();
    // FIX: Changed state variable from `customer` to `customerName`
    const [customerName, setCustomerName] = useState('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<{ stockId: string; variety: BeanVariety; quantityKg: number; pricePerKg: number }[]>([]);

    const grandTotal = useMemo(() => items.reduce((sum, item) => sum + ((item.quantityKg || 0) * (item.pricePerKg || 0)), 0), [items]);

    const handleAddItem = () => {
        setItems([...items, { stockId: '', variety: BeanVariety.ARABICA, quantityKg: 0, pricePerKg: 0 }]);
    };
    
    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'stockId') {
            const selectedStock = availableStock.find(s => s.id === value);
            item.stockId = value as string;
            item.variety = selectedStock?.variety || BeanVariety.ARABICA;
        } else if (field === 'quantityKg') {
            item.quantityKg = parseFloat(value as string) || 0;
        } else if (field === 'pricePerKg') {
            item.pricePerKg = parseFloat(value as string) || 0;
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Check `customerName` instead of `customer`
        if (!customerName.trim() || items.length === 0 || items.some(i => !i.stockId || i.quantityKg <= 0)) {
            alert('Customer name and at least one valid item are required.');
            return;
        }

        for (const item of items) {
            const stockItem = await stock.getById(item.stockId);
            if (!stockItem || stockItem.quantityKg < item.quantityKg) {
                alert(`Not enough stock for ${item.variety}. Required: ${item.quantityKg}kg, Available: ${stockItem?.quantityKg.toFixed(2) || 0}kg.`);
                return;
            }
        }

        for (const item of items) {
            const stockItem = await stock.getById(item.stockId);
            if (stockItem) {
                await stock.update(item.stockId, { quantityKg: stockItem.quantityKg - item.quantityKg });
                 // FIX: Use `customerName` in log notes
                await warehouseLogs.add({ date: new Date().toISOString().split('T')[0], itemId: item.stockId, change: -item.quantityKg, notes: `Sale to ${customerName}` });
            }
        }

        // FIX: Construct a complete `SalesRecord` object including all required fields.
        const saleData: Omit<SalesRecord, 'id'> = {
            invoiceNumber: `INV-${Date.now()}`,
            saleDate,
            items,
            customerName,
            totalAmount: grandTotal,
            paymentStatus: PaymentStatus.PAID,
            shippingAddress: '', // Form does not capture this, so default to empty
            notes: '', // Form does not capture this, so default to empty
        };
        await sales.add(saleData);
        onSave();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('sales.modal_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* FIX: Bind input to `customerName` state */}
                        <input type="text" placeholder={t('sales.modal_customerPlaceholder')} value={customerName} onChange={e => setCustomerName(e.target.value)} className="p-2 border border-gray-300 rounded-md" required />
                        <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="p-2 border border-gray-300 rounded-md" />
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="font-semibold text-gray-700">{t('sales.modal_items')}</label>
                        {items.map((item, index) => {
                            const selectedStock = availableStock.find(s => s.id === item.stockId);
                            const itemTotal = (item.quantityKg || 0) * (item.pricePerKg || 0);
                            return (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <select value={item.stockId} onChange={e => handleItemChange(index, 'stockId', e.target.value)} className="col-span-4 p-2 border border-gray-300 rounded-md" required>
                                        <option value="">{t('sales.modal_selectItem')}</option>
                                        {availableStock.map(s => <option key={s.id} value={s.id}>{s.variety === BeanVariety.BLEND ? 'Blend' : s.variety} ({s.quantityKg.toFixed(2)}kg)</option>)}
                                    </select>
                                    <input type="number" step="0.01" placeholder={t('sales.modal_qtyPlaceholder')} value={item.quantityKg || ''} max={selectedStock?.quantityKg} onChange={e => handleItemChange(index, 'quantityKg', e.target.value)} className="col-span-2 p-2 border border-gray-300 rounded-md" required/>
                                    <input type="number" step="0.01" placeholder={t('sales.modal_pricePlaceholder')} value={item.pricePerKg || ''} onChange={e => handleItemChange(index, 'pricePerKg', e.target.value)} className="col-span-3 p-2 border border-gray-300 rounded-md" required/>
                                    <div className="col-span-2 text-sm text-gray-600 font-medium truncate">{formatCurrency(itemTotal)}</div>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-1 text-red-500 hover:text-red-700 font-bold p-2 rounded-full">&times;</button>
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" onClick={handleAddItem} className="text-sm text-brand-brown-600 hover:text-brand-brown-800 font-semibold pt-2">{t('sales.modal_addItem')}</button>

                    <div className="text-right font-bold text-xl text-brand-brown-900 pt-4 border-t mt-4">
                        {t('sales.modal_grandTotal')}: {formatCurrency(grandTotal)}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('sales.modal_recordSale')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Sales;
