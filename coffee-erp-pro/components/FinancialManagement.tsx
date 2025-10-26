
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { View, Expense, ExpenseCategory, POStatus, PaymentStatus, StockItem, BeanVariety, User, SalesRecord, PurchaseOrder, Blend, RoastProfile, ExternalRoastLog, WarehouseLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from './common/Card';
import { useTranslation } from '../hooks/useTranslation';

// Icons for cards
const GrossProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="M19.7 12.3c.04-.2.04-.4.04-.6 0-4.42-3.58-8-8-8s-8 3.58-8 8c0 .2.01.4.04.6C3.1 13.8 3 15.3 3 16.5 3 20.1 6.1 23 10 23c3.3 0 6-2.1 7-5 .4-1.3.5-2.6.5-3.8 0-.6-.1-1.3-.3-1.9zM12 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/><path d="M11 3.2c.5-.1 1-.2 1.5-.2 4.4 0 8 3.6 8 8 0 .5-.1 1-.2 1.5"/></svg>;
const NetProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M20 12h-8a2 2 0 0 1-2-2V6"/><path d="M18 12a2 2 0 0 0 2-2V8"/></svg>;
const ExpensesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="M21 8c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4v8c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4Z" /><path d="M7 16h10" /><path d="M7 12h10" /><path d="M12 12v8" /></svg>;

const TrendArrow = ({ type }: { type: 'positive' | 'negative' }) => {
    const iconClass = "inline mr-1";
    if (type === 'positive') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M12 5v14M18 11l-6-6-6 6"/></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M12 5v14M18 13l-6 6-6-6"/></svg>;
};


interface FinancialManagementProps {
    data: ReturnType<typeof useMockData>['dataService'];
    currentUser: User;
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


const FinancialManagement: React.FC<FinancialManagementProps> = ({ data, currentUser }) => {
    const { sales, purchaseOrders, expenses, stock, blends, roasts, externalRoasts, warehouseLogs } = data;
    const { t } = useTranslation();
    
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

    const [dbData, setDbData] = useState<{
        allSales: SalesRecord[], allPOs: PurchaseOrder[], allStock: StockItem[],
        allBlends: Blend[], allRoasts: RoastProfile[], allExternalRoasts: ExternalRoastLog[], allLogs: WarehouseLog[]
    }>({ allSales: [], allPOs: [], allStock: [], allBlends: [], allRoasts: [], allExternalRoasts: [], allLogs: [] });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [
            salesData, poData, expensesData, stockData,
            blendsData, roastsData, externalRoastsData, logsData
        ] = await Promise.all([
            sales.getAll(), purchaseOrders.getAll(), expenses.getAll(), stock.getAll(),
            blends.getAll(), roasts.getAll(), externalRoasts.getAll(), warehouseLogs.getAll()
        ]);
        setAllExpenses(expensesData);
        setDbData({
            allSales: salesData, allPOs: poData, allStock: stockData, allBlends: blendsData,
            allRoasts: roastsData, allExternalRoasts: externalRoastsData, allLogs: logsData
        });
        setIsLoading(false);
    }, [sales, purchaseOrders, expenses, stock, blends, roasts, externalRoasts, warehouseLogs]);

    useEffect(() => {
        if (currentUser.role === 'Admin') {
            fetchData();
        }
    }, [fetchData, currentUser.role]);

    const financialData = useMemo(() => {
        const { allSales, allPOs, allStock, allBlends, allRoasts, allExternalRoasts, allLogs } = dbData;
        const getRoastedBeanCost = (roastedStock: StockItem): number => {
            if (roastedStock.variety === BeanVariety.BLEND) {
                const blendLog = allLogs.find(l => l.itemId === roastedStock.id && l.notes.startsWith('Created blend:'));
                if (!blendLog) return 0;
                const blendNameMatch = blendLog.notes.match(/Created blend: (.*?) /);
                if (!blendNameMatch) return 0;
                const blendName = blendNameMatch[1];
                const blend = allBlends.find(b => b.name === blendName);
                return blend?.totalCostPerKg || 0;
            }
            const creationLog = allLogs.find(l => l.itemId === roastedStock.id && l.change > 0 && (l.notes.includes('From roast batch') || l.notes.includes('Received from external roastery')));
            if (!creationLog) return 0;
            const getCostFromPO = (greenBeanStockId: string, greenBeanVariety: BeanVariety): number => {
                const purchaseLog = allLogs.find(log => log.itemId === greenBeanStockId && log.change > 0 && log.notes.includes('Stock from PO'));
                if (!purchaseLog) return 0;
                const poIdMatch = purchaseLog.notes.match(/Stock from PO #(\w+-\w+)/);
                if (!poIdMatch) return 0;
                const po = allPOs.find(p => p.id === poIdMatch[1]);
                const poItem = po?.items.find(item => item.variety === greenBeanVariety);
                return poItem?.pricePerKg || 0;
            };
            const internalRoastMatch = creationLog.notes.match(/From roast batch (RB-[\w-]+)/);
            if (internalRoastMatch) {
                const batchId = internalRoastMatch[1];
                const roast = allRoasts.find(r => r.batchId === batchId);
                if (!roast) return 0;
                const greenBeanCostPerKg = getCostFromPO(roast.greenBeanStockId, roast.greenBeanVariety);
                const totalGreenBeanCost = greenBeanCostPerKg * roast.greenBeanWeightKg;
                const totalRoastingCost = roast.internalRoastingCostPerKg * roast.greenBeanWeightKg;
                if (roast.roastedWeightKg === 0) return 0;
                return (totalGreenBeanCost + totalRoastingCost) / roast.roastedWeightKg;
            }
            const externalRoastMatch = creationLog.notes.match(/Received from external roastery: (.*)/);
            if(externalRoastMatch) {
                const roasteryName = externalRoastMatch[1];
                 const externalRoast = allExternalRoasts.find(er => er.roasteryName === roasteryName && er.dateReceived === creationLog.date);
                 if(!externalRoast) return 0;
                 const greenBeanCostPerKg = getCostFromPO(externalRoast.greenBeanStockId, externalRoast.greenBeanVariety);
                 const totalGreenBeanCost = greenBeanCostPerKg * externalRoast.greenBeanWeightSentKg;
                 const totalRoastingCost = externalRoast.roastingCostPerKg * externalRoast.greenBeanWeightSentKg;
                 if(externalRoast.roastedBeanWeightReceivedKg === 0) return 0;
                 return (totalGreenBeanCost + totalRoastingCost) / externalRoast.roastedBeanWeightReceivedKg;
            }
            return 0;
        };
        
        const today = new Date();
        const endDate1 = new Date();
        const startDate1 = new Date(new Date().setDate(today.getDate() - 30));
        const endDate2 = new Date(new Date().setDate(today.getDate() - 31));
        const startDate2 = new Date(new Date().setDate(today.getDate() - 60));

        const calculateMetricsForPeriod = (start: Date, end: Date) => {
            const periodSales = allSales.filter(s => new Date(s.saleDate) >= start && new Date(s.saleDate) <= end);
            const periodExpenses = allExpenses.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);
            const revenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
            const cogs = periodSales.reduce((sum, sale) => {
                const saleCOGS = sale.items.reduce((itemSum, item) => {
                    const stockItem = allStock.find(s => s.id === item.stockId);
                    if (!stockItem) return itemSum;
                    const costPerKg = getRoastedBeanCost(stockItem);
                    return itemSum + (costPerKg * item.quantityKg);
                }, 0);
                return sum + saleCOGS;
            }, 0);
            const expensesTotal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - expensesTotal;
            return { revenue, grossProfit, netProfit, expenses: expensesTotal, cogs };
        };

        const currentPeriod = calculateMetricsForPeriod(startDate1, endDate1);
        const previousPeriod = calculateMetricsForPeriod(startDate2, endDate2);
        
        const accountsReceivable = allSales.filter(s => s.paymentStatus === PaymentStatus.UNPAID).reduce((sum, s) => sum + s.totalAmount, 0);
        const accountsPayable = allPOs.filter(p => p.status === POStatus.PENDING || p.status === POStatus.APPROVED).reduce((sum, p) => sum + p.items.reduce((itemSum, i) => itemSum + i.pricePerKg * i.quantityKg, 0), 0);
        
        // FIX: Update the accumulator type to allow string for `name` property alongside the number index signature.
        const monthlyData = allSales.reduce((acc, sale) => {
            const month = new Date(sale.saleDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            const revenueKey = t('financial.chart_revenue');
            const expensesKey = t('financial.chart_expenses');
            if (!acc[month]) {
                acc[month] = { name: month, [revenueKey]: 0, [expensesKey]: 0 };
            }
            // FIX: Use type assertion for arithmetic operation on a property that could be string or number.
            acc[month][revenueKey] = (acc[month][revenueKey] as number) + sale.totalAmount;
            return acc;
        }, {} as Record<string, {name: string, [key: string]: string | number}>);

        allExpenses.forEach(exp => {
             const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
             const revenueKey = t('financial.chart_revenue');
             const expensesKey = t('financial.chart_expenses');
             if (!monthlyData[month]) {
                monthlyData[month] = { name: month, [revenueKey]: 0, [expensesKey]: 0 };
            }
            // FIX: Use type assertion for arithmetic operation on a property that could be string or number.
            monthlyData[month][expensesKey] = (monthlyData[month][expensesKey] as number) + exp.amount;
        });

        // FIX: With the correct type for `monthlyData`, `a.name` and `b.name` are now accessible.
        const chartData = Object.values(monthlyData).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

        return { currentPeriod, previousPeriod, accountsReceivable, accountsPayable, chartData };
    }, [dbData, allExpenses, t]);
    
    if (currentUser.role !== 'Admin') {
        return (
             <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600">{t('financial.accessDenied')}</h1>
                <p className="mt-4 text-gray-600">{t('financial.accessDeniedMsg')}</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }
    
    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    };
    
    const formatTrend = (change: number, reverseColors: boolean = false) => {
        const period = t('dashboard.trend_vsPrevDays');
        if (change === Infinity) return { text: '+100%+', type: 'positive' as const };
        if (isNaN(change) || change === 0) return { text: period, type: 'neutral' as const };
        const sign = change > 0 ? '+' : '';
        let type: 'positive' | 'negative' = change > 0 ? 'positive' : 'negative';
        if (reverseColors) type = type === 'positive' ? 'negative' : 'positive';
        return { text: `${sign}${change.toFixed(1)}% ${period}`, type };
    };

    const grossProfitChange = calcChange(financialData.currentPeriod.grossProfit, financialData.previousPeriod.grossProfit);
    const expensesChange = calcChange(financialData.currentPeriod.expenses, financialData.previousPeriod.expenses);
    const netProfitChange = calcChange(financialData.currentPeriod.netProfit, financialData.previousPeriod.netProfit);
    
    const grossProfitTrend = formatTrend(grossProfitChange);
    const expensesTrend = formatTrend(expensesChange, true); // Higher expenses are negative
    const netProfitTrend = formatTrend(netProfitChange);
    
    const handleSaveExpense = async () => {
        setIsExpenseModalOpen(false);
        await fetchData();
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-brown-900">{t('financial.title')}</h1>

            {/* Financial Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card 
                    title={t('financial.card_grossProfit')}
                    value={formatCurrency(financialData.currentPeriod.grossProfit)} 
                    icon={<GrossProfitIcon />} 
                    change={<>{grossProfitTrend.type !== 'neutral' && <TrendArrow type={grossProfitTrend.type} />} {grossProfitTrend.text}</>}
                    changeType={grossProfitTrend.type}
                />
                 <Card 
                    title={t('financial.card_opEx')}
                    value={formatCurrency(financialData.currentPeriod.expenses)}
                    icon={<ExpensesIcon />}
                    change={<>{expensesTrend.type !== 'neutral' && <TrendArrow type={expensesChange > 0 ? 'positive' : 'negative'} />} {expensesTrend.text}</>}
                    changeType={expensesTrend.type}
                />
                 <Card 
                    title={t('financial.card_netProfit')}
                    value={formatCurrency(financialData.currentPeriod.netProfit)}
                    icon={<NetProfitIcon />}
                    change={<>{netProfitTrend.type !== 'neutral' && <TrendArrow type={netProfitTrend.type} />} {netProfitTrend.text}</>}
                    changeType={netProfitTrend.type}
                />
            </div>
             
             {/* P&L and Debts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-brand-brown-800 mb-4">{t('financial.pnl_title')}</h2>
                     <table className="min-w-full">
                        <tbody>
                            <tr className="border-b"><td className="py-2 text-brand-brown-800">{t('financial.pnl_revenue')}</td><td className="py-2 text-right font-semibold text-brand-brown-900">{formatCurrency(financialData.currentPeriod.revenue)}</td></tr>
                            <tr className="border-b"><td className="py-2 text-brand-brown-800">{t('financial.pnl_cogs')}</td><td className="py-2 text-right font-semibold text-red-600">({formatCurrency(financialData.currentPeriod.cogs)})</td></tr>
                            <tr className="border-b bg-gray-50"><td className="py-2 font-bold text-brand-brown-800">{t('financial.pnl_grossProfit')}</td><td className="py-2 text-right font-bold text-brand-brown-900">{formatCurrency(financialData.currentPeriod.grossProfit)}</td></tr>
                            <tr className="border-b"><td className="py-2 text-brand-brown-800">{t('financial.pnl_opEx')}</td><td className="py-2 text-right font-semibold text-red-600">({formatCurrency(financialData.currentPeriod.expenses)})</td></tr>
                            <tr className="bg-brand-brown-100"><td className="py-3 font-extrabold text-lg text-brand-brown-900">{t('financial.pnl_netProfit')}</td><td className="py-3 text-right font-extrabold text-lg text-brand-brown-900">{formatCurrency(financialData.currentPeriod.netProfit)}</td></tr>
                        </tbody>
                    </table>
                </div>
                 <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg"><p className="text-sm font-semibold text-brand-brown-700">{t('financial.receivable')}</p><p className="text-2xl font-bold text-green-700">{formatCurrency(financialData.accountsReceivable)}</p></div>
                    <div className="bg-white p-6 rounded-xl shadow-lg"><p className="text-sm font-semibold text-brand-brown-700">{t('financial.payable')}</p><p className="text-2xl font-bold text-red-700">{formatCurrency(financialData.accountsPayable)}</p></div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-brand-brown-800 mb-4">{t('financial.chart_title')}</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={financialData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `Rp${(value as number / 1000000)} Jt`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey={t('financial.chart_revenue')} stroke="#16a34a" strokeWidth={2} />
                        <Line type="monotone" dataKey={t('financial.chart_expenses')} stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
             {/* Expenses */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-brand-brown-800">{t('financial.expenses_title')}</h2>
                    <div className="flex gap-4">
                        <button onClick={() => downloadCSV(allExpenses, 'expenses')} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold text-sm rounded-lg hover:bg-brand-green-700">
                            <DownloadIcon />
                            {t('financial.expenses_export')}
                        </button>
                        <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 bg-brand-brown-600 text-white font-semibold text-sm rounded-lg hover:bg-brand-brown-700">{t('financial.expenses_add')}</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('financial.table_date')}</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('financial.table_description')}</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('financial.table_category')}</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-brand-brown-700 uppercase">{t('financial.table_amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allExpenses.map(exp => (
                                <tr key={exp.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{exp.date}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{exp.description}</td>
                                    <td className="px-4 py-2 text-sm"><span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{exp.category}</span></td>
                                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800">{formatCurrency(exp.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isExpenseModalOpen && <ExpenseFormModal data={data} onClose={handleSaveExpense} />}
        </div>
    );
};

interface ExpenseFormModalProps {
    data: ReturnType<typeof useMockData>['dataService'];
    onClose: () => Promise<void>;
}

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ data, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: ExpenseCategory.OTHER,
        amount: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.description.trim() || formData.amount <= 0) {
            alert('Please provide a valid description and amount.');
            return;
        }
        await data.expenses.add(formData);
        await onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('financial.modal_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder={t('financial.modal_description')} value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="date" value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md" />
                        <input type="number" placeholder={t('financial.modal_amount')} value={formData.amount || ''} onChange={e => setFormData(p => ({...p, amount: parseFloat(e.target.value) || 0}))} className="w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value as ExpenseCategory}))} className="w-full p-2 border border-gray-300 rounded-md">
                        {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default FinancialManagement;
