
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { StockItem, StockType, BeanVariety, Packaging, Blend, RoastProfile, PurchaseOrder, WarehouseLog, ExternalRoastLog } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HPPCalculatorProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const HPPCalculator: React.FC<HPPCalculatorProps> = ({ data }) => {
    const { stock, packaging, blends, roasts, externalRoasts, purchaseOrders, warehouseLogs } = data;
    const { t } = useTranslation();
    
    const [selectedStockId, setSelectedStockId] = useState('');
    const [selectedPackagingId, setSelectedPackagingId] = useState('');
    const [otherCostsPerKg, setOtherCostsPerKg] = useState(0);

    const [roastedBeanStock, setRoastedBeanStock] = useState<StockItem[]>([]);
    const [packagingOptions, setPackagingOptions] = useState<Packaging[]>([]);
    const [dbData, setDbData] = useState<{ allBlends: Blend[], allRoasts: RoastProfile[], allExternalRoasts: ExternalRoastLog[], allPOs: PurchaseOrder[], allLogs: WarehouseLog[] }>({ allBlends: [], allRoasts: [], allExternalRoasts: [], allPOs: [], allLogs: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [stockData, packagingData, blendsData, roastsData, externalRoastsData, poData, logsData] = await Promise.all([
            stock.getAll(),
            packaging.getAll(),
            blends.getAll(),
            roasts.getAll(),
            externalRoasts.getAll(),
            purchaseOrders.getAll(),
            warehouseLogs.getAll(),
        ]);
        setRoastedBeanStock(stockData.filter(s => s.type === StockType.ROASTED_BEAN && s.quantityKg > 0));
        setPackagingOptions(packagingData);
        setDbData({ allBlends: blendsData, allRoasts: roastsData, allExternalRoasts: externalRoastsData, allPOs: poData, allLogs: logsData });
        setIsLoading(false);
    }, [stock, packaging, blends, roasts, externalRoasts, purchaseOrders, warehouseLogs]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const calculateCost = useMemo(() => {
        const { allBlends, allRoasts, allExternalRoasts, allPOs, allLogs } = dbData;
        
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

        if (!selectedStockId) return { beanCost: 0, packagingCost: 0, finalHPPPerPackage: 0, finalHPPPerKg: 0, selectedPackageSize: 0 };
        
        const selectedStock = roastedBeanStock.find(s => s.id === selectedStockId);
        const selectedPackage = packagingOptions.find(p => p.id === selectedPackagingId);
        
        const beanCost = selectedStock ? getRoastedBeanCost(selectedStock) : 0;
        const packagingCost = selectedPackage?.cost || 0;
        const packageSizeKg = selectedPackage?.sizeKg || 0;

        const hppPerPackage = (beanCost * packageSizeKg) + packagingCost + (otherCostsPerKg * packageSizeKg);
        const hppPerKg = packageSizeKg > 0 ? hppPerPackage / packageSizeKg : 0;
        
        return { beanCost, packagingCost, finalHPPPerPackage: hppPerPackage, finalHPPPerKg: hppPerKg, selectedPackageSize: packageSizeKg };
    }, [selectedStockId, selectedPackagingId, otherCostsPerKg, roastedBeanStock, packagingOptions, dbData]);

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-brand-brown-900">{t('hpp.title')}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Column */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg space-y-6">
                    <h2 className="text-xl font-semibold text-brand-brown-800 border-b pb-2">{t('hpp.configTitle')}</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('hpp.selectBean')}</label>
                        <select value={selectedStockId} onChange={e => setSelectedStockId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">{t('hpp.selectBeanPlaceholder')}</option>
                            {roastedBeanStock.map(s => (
                                <option key={s.id} value={s.id}>{s.variety} - {s.quantityKg.toFixed(2)}kg (in {s.location})</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('hpp.selectPackaging')}</label>
                        <select value={selectedPackagingId} onChange={e => setSelectedPackagingId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">{t('hpp.selectPackagingPlaceholder')}</option>
                            {packagingOptions.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sizeKg * 1000}g)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('hpp.otherCosts')}</label>
                        <input type="number" value={otherCostsPerKg || ''} onChange={e => setOtherCostsPerKg(parseFloat(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md" placeholder={t('hpp.otherCostsPlaceholder')} />
                    </div>
                </div>

                {/* Results Column */}
                <div className="bg-brand-brown-800 text-white p-6 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold border-b border-brand-brown-700 pb-2">{t('hpp.resultsTitle')}</h2>
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-brand-brown-300">{t('hpp.beanCost')}</span>
                        <span className="font-bold">{formatCurrency(calculateCost.beanCost)} / kg</span>
                    </div>
                     <div className="flex justify-between items-center text-lg">
                        <span className="text-brand-brown-300">{t('hpp.packagingCost')}</span>
                        <span className="font-bold">{formatCurrency(calculateCost.packagingCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-brand-brown-300">{t('hpp.otherCostResult')}</span>
                        <span className="font-bold">{formatCurrency(otherCostsPerKg)} / kg</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-brand-brown-700 space-y-2">
                        <div className="flex justify-between items-center text-xl">
                            <span className="text-brand-brown-200">{t('hpp.hppPerKg')}</span>
                            <span className="font-bold text-green-300">{formatCurrency(calculateCost.finalHPPPerKg)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl">
                            <span className="text-brand-brown-100">{t('hpp.hppPerPackage')}</span>
                            <span className="font-bold text-green-300">{formatCurrency(calculateCost.finalHPPPerPackage)}</span>
                        </div>
                         <p className="text-xs text-brand-brown-400 text-right pt-2">
                            {t('hpp.disclaimer', { size: calculateCost.selectedPackageSize * 1000 })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HPPCalculator;
