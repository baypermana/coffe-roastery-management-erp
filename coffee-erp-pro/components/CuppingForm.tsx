
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { CuppingSession, RoastProfile } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface CuppingFormProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

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


const CuppingForm: React.FC<CuppingFormProps> = ({ data }) => {
    const { cuppings, roasts } = data;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCupping, setSelectedCupping] = useState<CuppingSession | null>(null);
    const { t } = useTranslation();
    
    const [cuppingList, setCuppingList] = useState<CuppingSession[]>([]);
    const [roastList, setRoastList] = useState<RoastProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [cuppingsData, roastsData] = await Promise.all([
            cuppings.getAll(),
            roasts.getAll()
        ]);
        setCuppingList(cuppingsData);
        setRoastList(roastsData);
        setIsLoading(false);
    }, [cuppings, roasts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const roastMap = useMemo(() => roastList.reduce((acc, r) => {
        acc[r.id] = `${r.batchId} - ${r.greenBeanVariety}`;
        return acc;
    }, {} as Record<string, string>), [roastList]);

    const handleSave = async (cuppingData: Omit<CuppingSession, 'id'>) => {
        await cuppings.add(cuppingData);
        handleCloseModals();
        await fetchData();
    };

    const handleViewDetails = (cupping: CuppingSession) => {
        setSelectedCupping(cupping);
        setIsDetailsModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDetailsModalOpen(false);
        setSelectedCupping(null);
    };

    const handleExport = () => {
        const dataForExport = cuppingList.map(cup => ({
            id: cup.id,
            roastProfile: roastMap[cup.roastProfileId] || cup.roastProfileId,
            sessionDate: cup.sessionDate,
            roastLevel: cup.roastLevel,
            fragranceDry: cup.fragranceDry,
            fragranceBreak: cup.fragranceBreak,
            flavor: cup.flavor,
            aftertaste: cup.aftertaste,
            acidity: cup.acidity,
            body: cup.body,
            balance: cup.balance,
            sweetness: cup.sweetness,
            cleanliness: cup.cleanliness,
            uniformity: cup.uniformity,
            defects_numberOfCups: cup.defects.numberOfCups,
            defects_taints: cup.defects.taints,
            defects_faults: cup.defects.faults,
            finalScore: cup.finalScore,
            notes: cup.notes,
        }));
        downloadCSV(dataForExport, 'cupping_sessions');
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('cupping.title')}</h1>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-brand-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-brand-green-700 transition-colors">
                        <DownloadIcon />
                        {t('cupping.exportButton')}
                    </button>
                    <button onClick={() => setIsFormModalOpen(true)} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors" disabled={roastList.length === 0}>
                       {roastList.length === 0 ? t('cupping.addButton_disabled') : t('cupping.addButton')}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_roastProfile')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_flavor')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_acidity')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_finalScore')}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase">{t('cupping.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {cuppingList.map(cup => (
                                <tr key={cup.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 text-sm font-medium text-brand-brown-900">{roastMap[cup.roastProfileId] || 'Unknown Roast'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{cup.sessionDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{cup.flavor.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{cup.acidity.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-brand-brown-800">{cup.finalScore.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleViewDetails(cup)} className="text-brand-brown-600 hover:text-brand-brown-900">{t('common.viewDetails')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {cuppingList.length === 0 && <p className="p-4 text-center text-gray-500">{t('cupping.noRecords')}</p>}
                </div>
            </div>
            
            {isFormModalOpen && <CuppingFormModal roasts={roastList} onSave={handleSave} onClose={handleCloseModals} />}
            {isDetailsModalOpen && selectedCupping && <CuppingDetailsModal cupping={selectedCupping} roastName={roastMap[selectedCupping.roastProfileId]} onClose={handleCloseModals} />}
        </div>
    );
};

// Details Modal
interface CuppingDetailsModalProps {
    cupping: CuppingSession;
    roastName: string;
    onClose: () => void;
}
const CuppingDetailsModal: React.FC<CuppingDetailsModalProps> = ({ cupping, roastName, onClose }) => {
    const { t } = useTranslation();
    const scores: (keyof Omit<CuppingSession, 'id' | 'roastProfileId' | 'sessionDate' | 'roastLevel' | 'defects' | 'finalScore' | 'notes'>)[] = ['fragranceDry', 'fragranceBreak', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity'];
    const totalScore = scores.reduce((sum, key) => sum + (cupping[key] as number), 0);
    const defectDeductions = (cupping.defects.taints * 2) + (cupping.defects.faults * 4);

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-brown-900">{t('cupping.details_title')}</h2>
                        <p className="text-sm text-gray-500">{cupping.sessionDate} - {roastName} ({cupping.roastLevel})</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {scores.map(key => (
                             <div key={key.toString()} className="p-3 bg-gray-50 rounded-lg text-center">
                                 <dt className="text-xs font-medium text-gray-500 capitalize">{key.toString().replace(/([A-Z])/g, ' $1').trim()}</dt>
                                 <dd className="mt-1 font-semibold text-brand-brown-800">{(cupping[key] as number).toFixed(2)}</dd>
                             </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg"><dt className="text-xs font-medium text-blue-500">{t('cupping.details_totalScore')}</dt><dd className="mt-1 text-lg font-semibold text-blue-800">{totalScore.toFixed(2)}</dd></div>
                        <div className="p-3 bg-red-50 rounded-lg"><dt className="text-xs font-medium text-red-500">{t('cupping.details_deductions')}</dt><dd className="mt-1 text-lg font-semibold text-red-800">-{defectDeductions.toFixed(2)}</dd></div>
                        <div className="p-3 bg-brand-brown-100 rounded-lg"><dt className="text-sm font-medium text-gray-600">{t('cupping.details_finalScore')}</dt><dd className="mt-1 text-2xl font-bold text-brand-brown-900">{cupping.finalScore.toFixed(2)}</dd></div>
                    </div>

                     <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('cupping.details_notes')}</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{cupping.notes || t('cupping.details_noNotes')}</p>
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
interface CuppingFormModalProps {
    roasts: RoastProfile[];
    onSave: (data: Omit<CuppingSession, 'id'>) => Promise<void>;
    onClose: () => void;
}
const CuppingFormModal: React.FC<CuppingFormModalProps> = ({ roasts, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<CuppingSession, 'id' | 'finalScore'>>({
        roastProfileId: '',
        sessionDate: new Date().toISOString().split('T')[0],
        roastLevel: 'City',
        fragranceDry: 7.5,
        fragranceBreak: 7.5,
        flavor: 7.5, 
        aftertaste: 7.5, 
        acidity: 7.5, 
        body: 7.5, 
        balance: 7.5, 
        sweetness: 10,
        cleanliness: 10,
        uniformity: 10,
        defects: {
            numberOfCups: 0,
            taints: 0,
            faults: 0,
        },
        notes: '',
    });

    const finalScore = useMemo(() => {
        const scoreFields: (keyof Omit<CuppingSession, 'id' | 'roastProfileId' | 'sessionDate' | 'roastLevel' | 'defects' | 'finalScore' | 'notes'>)[] = ['fragranceDry', 'fragranceBreak', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity'];
        const baseScore = scoreFields.reduce((sum, key) => sum + formData[key], 0);
        const defectDeductions = (formData.defects.taints * 2) + (formData.defects.faults * 4);
        return baseScore - defectDeductions;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.roastProfileId) {
            alert("Please select a roast profile.");
            return;
        }
        await onSave({ ...formData, finalScore });
    };

    const handleScoreChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: parseFloat(value) }));
    };

    const handleDefectChange = (field: keyof typeof formData.defects, value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setFormData(prev => ({
            ...prev,
            defects: {
                ...prev.defects,
                [field]: numValue
            }
        }))
    };

    const scoreFields: (keyof typeof formData)[] = ['fragranceDry', 'fragranceBreak', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity'];
    const roastLevels: CuppingSession['roastLevel'][] = ['Cinnamon', 'Light', 'City', 'Full City', 'Dark'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{t('cupping.modal_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={formData.roastProfileId} onChange={e => setFormData(prev => ({ ...prev, roastProfileId: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md" required>
                            <option value="">{t('cupping.modal_selectRoast')}</option>
                            {roasts.map(r => <option key={r.id} value={r.id}>{r.batchId} - {r.greenBeanVariety}</option>)}
                        </select>
                         <select value={formData.roastLevel} onChange={e => setFormData(prev => ({...prev, roastLevel: e.target.value as CuppingSession['roastLevel']}))} className="w-full p-2 border border-gray-300 rounded-md">
                            {roastLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>

                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('cupping.modal_sensoryScores')}</legend>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {scoreFields.map(key => (
                                <div key={key.toString()}>
                                    <label className="block text-sm font-medium text-gray-700 capitalize text-center">{key.toString().replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <input type="range" min={['sweetness', 'cleanliness', 'uniformity'].includes(key.toString()) ? "0" : "6"} max="10" step="0.25" value={formData[key] as number} onChange={e => handleScoreChange(key, e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                                    <span className="text-center block text-sm font-bold text-brand-brown-800">{(formData[key] as number).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    
                     <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('cupping.modal_defectAnalysis')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div><label className="block text-sm font-medium text-gray-700">{t('cupping.modal_numCups')}</label><input type="number" value={formData.defects.numberOfCups || ''} onChange={e => handleDefectChange('numberOfCups', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                             <div><label className="block text-sm font-medium text-gray-700">{t('cupping.modal_taints')}</label><input type="number" min="0" value={formData.defects.taints || ''} onChange={e => handleDefectChange('taints', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                             <div><label className="block text-sm font-medium text-gray-700">{t('cupping.modal_faults')}</label><input type="number" min="0" value={formData.defects.faults || ''} onChange={e => handleDefectChange('faults', e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" /></div>
                        </div>
                    </fieldset>

                    <div className="border-t pt-4 text-center">
                        <label className="block text-sm font-medium text-gray-600">{t('cupping.modal_finalScore')}</label>
                        <div className="mt-1 p-3 bg-brand-brown-50 rounded-md text-2xl font-bold text-brand-brown-900">{finalScore.toFixed(2)}</div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('cupping.modal_tastingNotes')}</label>
                        <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('cupping.modal_tastingNotesPlaceholder')}></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')} Session</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CuppingForm;
