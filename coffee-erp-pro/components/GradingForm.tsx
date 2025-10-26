
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMockData } from '../hooks/useMockData';
import { GreenBeanGrade, GradeStatus, BeanVariety, PurchaseOrder } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface GradingFormProps {
    data: ReturnType<typeof useMockData>['dataService'];
}

const getStatusColor = (status: GradeStatus) => {
    switch (status) {
        case GradeStatus.ACCEPTED: return 'bg-green-100 text-green-800';
        case GradeStatus.RETURNED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const GradingForm: React.FC<GradingFormProps> = ({ data }) => {
    const { grades, purchaseOrders } = data;
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<GreenBeanGrade | null>(null);
    const { t } = useTranslation();

    const [gradeList, setGradeList] = useState<GreenBeanGrade[]>([]);
    const [poList, setPoList] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [gradesData, poData] = await Promise.all([
            grades.getAll(),
            purchaseOrders.getAll()
        ]);
        setGradeList(gradesData);
        setPoList(poData.filter(po => po.status !== 'Rejected'));
        setIsLoading(false);
    }, [grades, purchaseOrders]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleAddNew = () => {
        setSelectedGrade(null);
        setIsFormModalOpen(true);
    };

    const handleViewDetails = (grade: GreenBeanGrade) => {
        setSelectedGrade(grade);
        setIsDetailsModalOpen(true);
    };

    const handleSave = async (gradeData: Omit<GreenBeanGrade, 'id'>) => {
        if (selectedGrade) {
            await grades.update(selectedGrade.id, gradeData);
        } else {
            await grades.add(gradeData);
        }
        await handleCloseModals();
        await fetchData();
    };

    const handleCloseModals = async () => {
        setIsFormModalOpen(false);
        setIsDetailsModalOpen(false);
        setSelectedGrade(null);
    }

    if (isLoading) {
        return <div className="text-center p-8">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-brown-900">{t('grading.title')}</h1>
                <button onClick={handleAddNew} className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800 transition-colors">
                    {t('grading.addButton')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-brown-200">
                        <thead className="bg-brand-brown-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_poId')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_variety')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_moisture')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_defects')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-brand-brown-700 uppercase">{t('grading.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-brown-200">
                            {gradeList.map((grade) => (
                                <tr key={grade.id} className="hover:bg-brand-brown-50">
                                    <td className="px-6 py-4 text-sm font-medium text-brand-brown-900">#{grade.poId.slice(0, 5)}...</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{grade.variety}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{grade.physicalAnalysis.moistureContent}%</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{grade.physicalAnalysis.defectCount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(grade.status)}`}>
                                            {t(`enums.gradeStatus.${grade.status}` as any)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleViewDetails(grade)} className="text-brand-brown-600 hover:text-brand-brown-900">{t('common.viewDetails')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {gradeList.length === 0 && <p className="p-4 text-center text-gray-500">{t('grading.noRecords')}</p>}
                </div>
            </div>
            
            {isFormModalOpen && <GradeFormModal grade={selectedGrade} purchaseOrders={poList} onSave={handleSave} onClose={handleCloseModals} />}
            {isDetailsModalOpen && selectedGrade && <GradeDetailsModal grade={selectedGrade} onClose={handleCloseModals} />}
        </div>
    );
};

// Details Modal
interface GradeDetailsModalProps {
    grade: GreenBeanGrade;
    onClose: () => void;
}
const GradeDetailsModal: React.FC<GradeDetailsModalProps> = ({ grade, onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-brown-900">{t('grading.details_title', { batchId: grade.batchId })}</h2>
                        <p className="text-sm text-gray-500">{grade.gradingDate} - {grade.variety}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 -m-2 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('grading.details_physicalAnalysis')}</h3>
                        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('grading.details_screenSize')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{grade.physicalAnalysis.screenSize}</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('grading.details_moisture')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{grade.physicalAnalysis.moistureContent}%</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('grading.details_density')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{grade.physicalAnalysis.density} g/L</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('grading.details_defects')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{grade.physicalAnalysis.defectCount}</dd></div>
                            <div className="p-3 bg-gray-100 rounded-lg"><dt className="text-xs font-medium text-gray-500">{t('grading.details_waterActivity')}</dt><dd className="mt-1 font-semibold text-brand-brown-800">{grade.physicalAnalysis.waterActivity} aw</dd></div>
                        </dl>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-brand-brown-800 mb-2">{t('grading.details_notes')}</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{grade.notes || t('grading.details_noNotes')}</p>
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
interface GradeFormModalProps {
    grade: GreenBeanGrade | null;
    purchaseOrders: PurchaseOrder[];
    onSave: (data: Omit<GreenBeanGrade, 'id'>) => Promise<void>;
    onClose: () => void;
}
const GradeFormModal: React.FC<GradeFormModalProps> = ({ grade, purchaseOrders, onSave, onClose }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<GreenBeanGrade, 'id'>>({
        poId: grade?.poId || '',
        batchId: grade?.batchId || `B-${Date.now()}`,
        variety: grade?.variety || BeanVariety.ARABICA,
        gradingDate: grade?.gradingDate || new Date().toISOString().split('T')[0],
        status: grade?.status || GradeStatus.ACCEPTED,
        physicalAnalysis: grade?.physicalAnalysis || { screenSize: '', moistureContent: 11.0, density: 680, defectCount: 0, waterActivity: 0.55 },
        notes: grade?.notes || '',
    });

    const handlePOChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPoId = e.target.value;
        const selectedPO = purchaseOrders.find(po => po.id === selectedPoId);
        setFormData(prev => ({
            ...prev,
            poId: selectedPoId,
            variety: selectedPO?.items[0]?.variety || BeanVariety.ARABICA,
        }));
    };

    const handlePhysicalChange = (field: keyof typeof formData.physicalAnalysis, value: string | number) => {
        setFormData(prev => ({...prev, physicalAnalysis: { ...prev.physicalAnalysis, [field]: value }}));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-brand-brown-900 mb-6">{grade ? t('grading.modal_title_edit') : t('grading.modal_title_create')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <select value={formData.poId} onChange={handlePOChange} className="w-full p-2 border border-gray-300 rounded-md" required>
                       <option value="">{t('grading.modal_selectPO')}</option>
                       {purchaseOrders.map(po => <option key={po.id} value={po.id}>PO #{po.id.slice(0,5)} - {po.items[0].variety}</option>)}
                    </select>

                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-brand-brown-800">{t('grading.modal_physicalAnalysis')}</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">{t('grading.modal_screenSize')}</label><input type="text" value={formData.physicalAnalysis.screenSize} onChange={e => handlePhysicalChange('screenSize', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder={t('grading.modal_screenSizePlaceholder')} /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('grading.modal_moisture')}</label><input type="number" step="0.1" value={formData.physicalAnalysis.moistureContent} onChange={e => handlePhysicalChange('moistureContent', parseFloat(e.target.value))} className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('grading.modal_density')}</label><input type="number" value={formData.physicalAnalysis.density} onChange={e => handlePhysicalChange('density', parseInt(e.target.value))} className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('grading.modal_defectCount')}</label><input type="number" value={formData.physicalAnalysis.defectCount} onChange={e => handlePhysicalChange('defectCount', parseInt(e.target.value))} className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700">{t('grading.modal_waterActivity')}</label><input type="number" step="0.01" value={formData.physicalAnalysis.waterActivity} onChange={e => handlePhysicalChange('waterActivity', parseFloat(e.target.value))} className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                        </div>
                    </fieldset>
                                        
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('grading.modal_notes')}</label>
                        <textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder={t('grading.modal_notesPlaceholder')}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('grading.modal_qcStatus')}</label>
                         <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as GradeStatus})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            {Object.values(GradeStatus).map(s => <option key={s} value={s}>{t(`enums.gradeStatus.${s}` as any)}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-5 py-2 bg-brand-brown-700 text-white font-semibold rounded-lg shadow-md hover:bg-brand-brown-800">{t('common.save')} Grade</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GradingForm;
