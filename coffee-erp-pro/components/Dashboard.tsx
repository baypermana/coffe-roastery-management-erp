
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { getBusinessAnalytics } from '../services/geminiService';
import Card from './common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StockItem, StockType, SalesRecord, PurchaseOrder, AlertSetting, WarehouseLog, POStatus } from '../types';
import { useTranslation } from '../hooks/useTranslation';

// Icons for cards
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const QuantityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M17 15.5V6"/><path d="M21 15.5V6"/><path d="M13 15.5V6"/><path d="m15.3 18.7 3.4 2.6 3.4-2.6"/><path d="M18.7 21.3v-6.6"/></svg>;
const POIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-brown-600"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V3h5.5l3.5 3.5V21c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V6.5L15.5 2z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

const TrendArrow = ({ type }: { type: 'positive' | 'negative' }) => {
    if (type === 'positive') {
        return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M12 5v14M18 11l-6-6-6 6"/></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M12 5v14M18 13l-6 6-6-6"/></svg>;
};

const COLORS = ['#8d5437', '#b97a4d', '#c8956f', '#dcbca1'];

interface DashboardProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const CustomTooltip = ({ active, payload, label, totalSales }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = totalSales > 0 ? (data.amount / totalSales * 100).toFixed(2) : 0;
        return (
            <div className="p-3 bg-white border border-brand-brown-200 rounded-lg shadow-lg">
                <p className="font-bold text-brand-brown-800">{`${label}`}</p>
                <p className="text-sm text-gray-700">{`Sales: ${formatCurrency(data.amount)}`}</p>
                <p className="text-sm text-brand-green-700">{`Contribution: ${percentage}%`}</p>
            </div>
        );
    }
    return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#5d3a2b" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="14px">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const [analytics, setAnalytics] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(true);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [hiddenSlices, setHiddenSlices] = useState<string[]>([]);
    const { t } = useTranslation();

    const [allStock, setAllStock] = useState<StockItem[]>([]);
    const [allSales, setAllSales] = useState<SalesRecord[]>([]);
    const [allPOs, setAllPOs] = useState<PurchaseOrder[]>([]);
    const [allAlertSettings, setAllAlertSettings] = useState<AlertSetting[]>([]);
    const [allWarehouseLogs, setAllWarehouseLogs] = useState<WarehouseLog[]>([]);

    const fetchData = useCallback(async () => {
        setIsDataLoading(true);
        const [stockData, salesData, poData, alertData, logData] = await Promise.all([
            data.stock.getAll(),
            data.sales.getAll(),
            data.purchaseOrders.getAll(),
            data.alertSettings.getAll(),
            data.warehouseLogs.getAll(),
        ]);
        setAllStock(stockData);
        setAllSales(salesData);
        setAllPOs(poData);
        setAllAlertSettings(alertData);
        setAllWarehouseLogs(logData);
        setIsDataLoading(false);
    }, [data]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGetAnalytics = useCallback(async () => {
        if (allStock.length === 0) return;
        setIsAiLoading(true);
        const result = await getBusinessAnalytics(allStock, allSales, allPOs);
        setAnalytics(result);
        setIsAiLoading(false);
    }, [allStock, allSales, allPOs]);

    useEffect(() => {
        if(!isDataLoading) {
            handleGetAnalytics();
        }
    }, [isDataLoading, handleGetAnalytics]);

    const operationalMetrics = useMemo(() => {
        const today = new Date();
        const startDate1 = new Date(new Date().setDate(today.getDate() - 30));
        const startDate2 = new Date(new Date().setDate(today.getDate() - 60));
        const calculateMetricsForPeriod = (start: Date, end: Date) => {
            const periodSales = allSales.filter(s => new Date(s.saleDate) >= start && new Date(s.saleDate) <= end);
            const revenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
            const quantitySold = periodSales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.quantityKg, 0), 0);
            return { revenue, quantitySold };
        };
        const currentPeriod = calculateMetricsForPeriod(startDate1, today);
        const previousPeriod = calculateMetricsForPeriod(startDate2, new Date(startDate1.getTime() - 1));
        const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));
        const logsLast7Days = allWarehouseLogs.filter(l => new Date(l.date) >= sevenDaysAgo);
        const greenBeanStockItems = allStock.filter(s => s.type === StockType.GREEN_BEAN);
        const greenBeanStockIds = greenBeanStockItems.map(s => s.id);
        const netStockChangeLast7Days = logsLast7Days.filter(l => greenBeanStockIds.includes(l.itemId)).reduce((sum, log) => sum + log.change, 0);
        const totalGreenBeanStock = greenBeanStockItems.reduce((sum, item) => sum + item.quantityKg, 0);
        const pendingPOsValue = allPOs.filter(p => p.status === POStatus.PENDING || p.status === POStatus.APPROVED).reduce((sum, p) => sum + p.items.reduce((itemSum, i) => itemSum + i.pricePerKg * i.quantityKg, 0), 0);
        return { currentPeriod, previousPeriod, netStockChangeLast7Days, totalGreenBeanStock, pendingPOsValue };
    }, [allSales, allStock, allWarehouseLogs, allPOs]);
    
    const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? Infinity : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    };
    
    const formatTrend = (change: number, unit: '%' | 'kg' = '%'): { text: string; type: 'positive' | 'negative' | 'neutral' } => {
        const period = t('dashboard.trend_vsPrevDays');
        if (unit === 'kg') {
            const sign = change > 0 ? '+' : '';
            const type = change === 0 ? 'neutral' : (change > 0 ? 'positive' : 'negative');
            return { text: t('dashboard.stockTrend_lastDays', { change: `${sign}${change.toFixed(2)}` }), type };
        }
        if (change === Infinity) return { text: '+100%+', type: 'positive' };
        if (isNaN(change) || change === 0) return { text: period, type: 'neutral' };
        const sign = change > 0 ? '+' : '';
        const type: 'positive' | 'negative' = change > 0 ? 'positive' : 'negative';
        return { text: `${sign}${change.toFixed(1)}% ${period}`, type };
    };
    
    const revenueChange = calcChange(operationalMetrics.currentPeriod.revenue, operationalMetrics.previousPeriod.revenue);
    const quantityChange = calcChange(operationalMetrics.currentPeriod.quantitySold, operationalMetrics.previousPeriod.quantitySold);
    const stockTrend = formatTrend(operationalMetrics.netStockChangeLast7Days, 'kg');
    const revenueTrend = formatTrend(revenueChange);
    const quantityTrend = formatTrend(quantityChange);

    const activeAlerts = useMemo(() => {
        return allAlertSettings.map(setting => {
            const totalStockForSetting = allStock.filter(item => item.variety === setting.variety && item.type === setting.type).reduce((sum, item) => sum + item.quantityKg, 0);
            if (totalStockForSetting <= setting.threshold) {
                return { ...setting, currentStock: totalStockForSetting };
            }
            return null;
        }).filter(Boolean);
    }, [allStock, allAlertSettings]);

    const { salesChartData, totalSalesValue, stockDistributionData, varietyColors } = useMemo(() => {
        // FIX: Explicitly type the accumulator's initial value to prevent TypeScript from inferring it as 'unknown'.
        const salesByVarietyAmount = allSales.flatMap(s => s.items).reduce((acc: Record<string, number>, item) => {
            const amount = item.quantityKg * item.pricePerKg;
            acc[item.variety] = (acc[item.variety] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);
        const totalSalesValue = Object.values(salesByVarietyAmount).reduce((sum, amount) => sum + amount, 0);
        const salesChartData = Object.entries(salesByVarietyAmount).map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }));
        const stockDistributionData = allStock.filter(s => s.type === StockType.GREEN_BEAN).map(s => ({ name: s.variety, value: s.quantityKg }));
        const colorMap: Record<string, string> = {};
        stockDistributionData.forEach((item, index) => {
            colorMap[item.name] = COLORS[index % COLORS.length];
        });
        return { salesChartData, totalSalesValue, stockDistributionData, varietyColors: colorMap };
    }, [allSales, allStock]);

    const activeStockDistributionData = useMemo(() => stockDistributionData.filter(d => !hiddenSlices.includes(d.name)), [stockDistributionData, hiddenSlices]);
    const handleLegendClick = (data: any) => setHiddenSlices(prev => prev.includes(data.value) ? prev.filter(slice => slice !== data.value) : [...prev, data.value]);
    const renderLegendText = (value: string) => <span style={{ color: hiddenSlices.includes(value) ? '#A0A0A0' : '#333' }}>{value}</span>;
    
    if (isDataLoading) {
        return <div className="text-center p-8">Loading dashboard data...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-brown-900">{t('dashboard.title')}</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title={t('dashboard.card_totalStock')} value={`${operationalMetrics.totalGreenBeanStock.toFixed(2)} kg`} icon={<InventoryIcon />} change={<>{stockTrend.text}</>} changeType={stockTrend.type} />
                <Card title={t('dashboard.card_revenue')} value={formatCurrency(operationalMetrics.currentPeriod.revenue)} icon={<SalesIcon />} change={<>{revenueTrend.type !== 'neutral' && <TrendArrow type={revenueTrend.type} />} {revenueTrend.text}</>} changeType={revenueTrend.type} />
                <Card title={t('dashboard.card_quantitySold')} value={`${operationalMetrics.currentPeriod.quantitySold.toFixed(2)} kg`} icon={<QuantityIcon />} change={<>{quantityTrend.type !== 'neutral' && <TrendArrow type={quantityTrend.type} />} {quantityTrend.text}</>} changeType={quantityTrend.type} />
                <Card title={t('dashboard.card_pendingPO')} value={formatCurrency(operationalMetrics.pendingPOsValue)} icon={<POIcon />} change={<>{t('dashboard.pendingPO_description')}</>} changeType="neutral" />
            </div>

            {activeAlerts.length > 0 && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center"><AlertTriangleIcon /><span className="ml-2">{t('dashboard.lowStock_title')}</span></h2>
                    <ul className="space-y-2">
                        {activeAlerts.map(alert => (alert && <li key={alert.id} className="text-red-700"><strong>{t('dashboard.lowStock_alert', { variety: alert.variety, type: t(`enums.stockType.${alert.type.replace(/\s/g, '')}` as any), currentStock: alert.currentStock.toFixed(2), threshold: alert.threshold })}</strong></li>))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-brand-brown-800 mb-4">{t('dashboard.salesByVariety_title')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(value) => `Rp${(value as number / 1000000)} Jt`} /><Tooltip content={<CustomTooltip totalSales={totalSalesValue} />} cursor={{fill: 'rgba(233, 220, 207, 0.5)'}} /><Legend /><Bar dataKey="amount" fill="#8d5437" /></BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-brand-brown-800 mb-4">{t('dashboard.greenBeanDistribution_title')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={activeStockDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                                {activeStockDistributionData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={varietyColors[entry.name]} />))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg`} />
                            <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '15px'}} onClick={handleLegendClick} formatter={renderLegendText}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <h2 className="text-xl font-semibold text-brand-brown-800">{t('dashboard.ai_title')}</h2>
                    <button onClick={handleGetAnalytics} disabled={isAiLoading} className="mt-4 sm:mt-0 px-6 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">{isAiLoading ? t('dashboard.ai_button_loading') : t('dashboard.ai_button_refresh')}</button>
                </div>
                {isAiLoading && !analytics ? (
                    <div className="text-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown-700 mx-auto"></div><p className="mt-2 text-gray-500">{t('dashboard.ai_loadingMessage')}</p></div>
                ) : analytics ? (
                    <div className="prose prose-sm max-w-none p-4 bg-brand-brown-50 rounded-lg border border-brand-brown-200 text-brand-brown-900" dangerouslySetInnerHTML={{ __html: analytics.replace(/\n/g, '<br />') }}></div>
                ) : (!isAiLoading && <p className="text-gray-500">{t('dashboard.ai_prompt')}</p>)}
            </div>
        </div>
    );
};

export default Dashboard;
