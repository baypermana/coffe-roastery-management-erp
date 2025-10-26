import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dataService } from '../services/supabaseService';
import type { SalesRecord, StockItem, PurchaseOrder, Expense, RoastProfile } from '../types';
import Card from './common/Card';

const COLORS = ['#8D5437', '#A96841', '#C8956F', '#DCBCA1', '#4CAF50', '#388E3C'];

interface AnalyticsProps {
  data: typeof dataService;
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [roasts, setRoasts] = useState<RoastProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [salesData, stockData, poData, expenseData, roastData] = await Promise.all([
      data.sales.getAll(),
      data.stock.getAll(),
      data.purchaseOrders.getAll(),
      data.expenses.getAll(),
      data.roasts.getAll(),
    ]);
    setSales(salesData);
    setStock(stockData);
    setPurchaseOrders(poData);
    setExpenses(expenseData);
    setRoasts(roastData);
    setLoading(false);
  };

  const filterByTimeRange = (dateString: string) => {
    if (timeRange === 'all') return true;
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    const ranges = { '7d': 7, '30d': 30, '90d': 90 };
    return days <= ranges[timeRange];
  };

  const filteredSales = sales.filter(s => filterByTimeRange(s.sale_date || s.saleDate));
  const filteredExpenses = expenses.filter(e => filterByTimeRange(e.date));
  const filteredRoasts = roasts.filter(r => filterByTimeRange(r.roast_date || r.roastDate));

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total_amount || sale.totalAmount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const revenueByDay = filteredSales.reduce((acc, sale) => {
    const date = (sale.sale_date || sale.saleDate).slice(0, 10);
    if (!acc[date]) acc[date] = 0;
    acc[date] += (sale.total_amount || sale.totalAmount);
    return acc;
  }, {} as Record<string, number>);

  const revenueChartData = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      revenue: revenue / 1000000,
    }));

  const stockByVariety = stock.reduce((acc, item) => {
    const key = `${item.variety} (${item.type})`;
    if (!acc[key]) acc[key] = 0;
    acc[key] += item.quantity_kg || item.quantityKg;
    return acc;
  }, {} as Record<string, number>);

  const stockChartData = Object.entries(stockByVariety).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  const salesByVariety = filteredSales.reduce((acc, sale) => {
    (sale.items || []).forEach(item => {
      if (!acc[item.variety]) acc[item.variety] = 0;
      acc[item.variety] += (item.quantityKg || item.quantity_kg);
    });
    return acc;
  }, {} as Record<string, number>);

  const salesByVarietyData = Object.entries(salesByVariety).map(([variety, quantity]) => ({
    variety,
    quantity: Number(quantity.toFixed(2)),
  }));

  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) acc[expense.category] = 0;
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount: amount / 1000000,
  }));

  const roastingEfficiency = filteredRoasts.map(roast => ({
    batchId: (roast.batch_id || roast.batchId).slice(-8),
    efficiency: (((roast.roasted_weight_kg || roast.roastedWeightKg) / (roast.green_bean_weight_kg || roast.greenBeanWeightKg)) * 100).toFixed(1),
  }));

  const avgEfficiency = roastingEfficiency.length > 0
    ? (roastingEfficiency.reduce((sum, r) => sum + Number(r.efficiency), 0) / roastingEfficiency.length).toFixed(1)
    : '0';

  const lowStockItems = stock.filter(item => (item.quantity_kg || item.quantityKg) < 50);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-brand-brown-700 text-white'
                  : 'bg-white text-brand-brown-700 border border-brand-brown-300 hover:bg-brand-brown-50'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Revenue">
          <div className="text-3xl font-bold text-brand-green-700">{formatCurrency(totalRevenue)}</div>
          <p className="text-sm text-gray-500 mt-1">{filteredSales.length} transactions</p>
        </Card>
        <Card title="Total Expenses">
          <div className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-sm text-gray-500 mt-1">{filteredExpenses.length} expense records</p>
        </Card>
        <Card title="Net Profit">
          <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-brand-green-700' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Profit Margin: {profitMargin}%</p>
        </Card>
        <Card title="Roasting Efficiency">
          <div className="text-3xl font-bold text-brand-brown-700">{avgEfficiency}%</div>
          <p className="text-sm text-gray-500 mt-1">Average weight retention</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Trend (in Million IDR)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(2)}M`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} dot={{ fill: '#4CAF50' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sales by Coffee Variety (kg)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByVarietyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variety" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8D5437">
                {salesByVarietyData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Current Stock Distribution (kg)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockChartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Expenses by Category (in Million IDR)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(2)}M`, 'Amount']} />
              <Bar dataKey="amount" fill="#A96841" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Roasting Efficiency by Batch">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roastingEfficiency.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batchId" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
              <Bar dataKey="efficiency" fill="#C8956F" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">Shows weight retention percentage (roasted / green bean weight)</p>
        </Card>

        <Card title="Low Stock Alerts">
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.variety} - {item.type}</p>
                    <p className="text-sm text-gray-600">Location: {item.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{(item.quantity_kg || item.quantityKg).toFixed(2)} kg</p>
                    <p className="text-xs text-red-500">Low Stock</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>All stock levels are healthy!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Key Performance Indicators">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-brown-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold text-brand-brown-800">
              {formatCurrency(filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0)}
            </p>
          </div>
          <div className="p-4 bg-brand-brown-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <p className="text-2xl font-bold text-brand-brown-800">
              {formatCurrency(
                stock.reduce((sum, item) => {
                  const qty = item.quantity_kg || item.quantityKg;
                  const avgPrice = item.type === 'Roasted Bean' ? 350000 : 200000;
                  return sum + (qty * avgPrice);
                }, 0)
              )}
            </p>
          </div>
          <div className="p-4 bg-brand-brown-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Roast Batches</p>
            <p className="text-2xl font-bold text-brand-brown-800">{filteredRoasts.length}</p>
          </div>
        </div>
      </Card>

      <Card title="Business Insights">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h4 className="font-semibold text-blue-900">Revenue Analysis</h4>
            <p className="text-sm text-blue-800 mt-1">
              {netProfit >= 0
                ? `Your business is profitable with a ${profitMargin}% profit margin. ${salesByVarietyData.length > 0 ? `${salesByVarietyData[0].variety} is your best-selling variety.` : ''}`
                : `Current period shows a loss of ${formatCurrency(Math.abs(netProfit))}. Review expenses and pricing strategy.`}
            </p>
          </div>
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <h4 className="font-semibold text-green-900">Inventory Status</h4>
            <p className="text-sm text-green-800 mt-1">
              {lowStockItems.length > 0
                ? `${lowStockItems.length} item(s) are running low. Consider reordering to avoid stockouts.`
                : 'All inventory levels are healthy. No immediate action required.'}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h4 className="font-semibold text-yellow-900">Production Efficiency</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Average roasting efficiency is {avgEfficiency}%. {Number(avgEfficiency) < 80 ? 'Consider reviewing roasting parameters to improve yield.' : 'Excellent roasting performance!'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
