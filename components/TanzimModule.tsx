
import React, { useState, useRef } from 'react';
import { Search, Plus, ScrollText, Upload, User, FileText, Banknote, CheckCircle, XCircle, X, Pencil, Trash2, MessageCircle, FileSpreadsheet, Image as ImageIcon, Copy, Wallet } from 'lucide-react';
import { TanzimRecord } from '../types';
import { exportToExcel, readExcelFile } from '../utils/excel';

interface TanzimModuleProps {
  records: TanzimRecord[];
  addRecord: (record: TanzimRecord) => void;
  updateRecord: (record: TanzimRecord) => void;
  deleteRecord: (id: string) => void;
}

const TanzimModule: React.FC<TanzimModuleProps> = ({ records, addRecord, updateRecord, deleteRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<TanzimRecord>>({ examYear: new Date().getFullYear().toString(), admissionFee: 0, isFeePaid: false, otherFee: 0, isOtherFeePaid: false, extraPhotosUrls: [], documentsSubmitted: { cnic: false, photos: false, receipt: false } });

  const filteredRecords = records.filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.fatherName.toLowerCase().includes(searchTerm.toLowerCase()));

  const openAddModal = () => { setFormData({ examYear: new Date().getFullYear().toString(), admissionFee: 0, isFeePaid: false, otherFee: 0, isOtherFeePaid: false, extraPhotosUrls: [], documentsSubmitted: { cnic: false, photos: false, receipt: false } }); setIsEditing(false); setIsModalOpen(true); };
  const openEditModal = (record: TanzimRecord) => { setFormData(record); setIsEditing(true); setIsModalOpen(true); };
  const handleDelete = (id: string) => { if(confirm("Are you sure?")) { deleteRecord(id); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentName) {
      if (isEditing && formData.id) updateRecord(formData as TanzimRecord); else addRecord({ ...formData, id: Date.now().toString() } as TanzimRecord);
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = (field: keyof TanzimRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string })); reader.readAsDataURL(file); }
  };
  
  const FileUploadPreview = ({ label, currentImage, onUpload }: { label: string, currentImage?: string, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 relative group">
        <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center mb-2 shadow-inner">
            {currentImage ? <img src={currentImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-500" />}
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
        <input type="file" accept="image/*" onChange={onUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
  );

  const handleExport = () => { const exportData = records.map(r => ({ ID: r.id, StudentName: r.studentName, FatherName: r.fatherName, Contact: r.contactNumber, ExamYear: r.examYear, FeePaid: r.isFeePaid ? "Yes" : "No", AdmissionFee: r.admissionFee, ChallanNo: r.challanNumber })); exportToExcel(exportData, 'Tanzim_Admissions'); };
  const handleImportTrigger = () => fileInputRef.current?.click();
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const jsonData = await readExcelFile(file); let addedCount = 0;
      jsonData.forEach((row: any) => {
         const sName = row["StudentName"], fName = row["FatherName"];
         if (sName && fName) {
            addRecord({ id: Date.now().toString() + Math.random().toString(36).substr(2,9), studentName: sName, fatherName: fName, contactNumber: row["Contact"] || '', examYear: row["ExamYear"] || new Date().getFullYear().toString(), admissionFee: Number(row["AdmissionFee"] || 0), isFeePaid: (row["FeePaid"] === "Yes"), challanNumber: row["ChallanNo"] || '', documentsSubmitted: { cnic: false, photos: false, receipt: false } });
            addedCount++;
         }
      });
      alert(`Imported ${addedCount} records.`);
    } catch (error) { alert("Error importing file."); console.error(error); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif flex items-center gap-2"><ScrollText className="w-7 h-7 text-purple-600" /> Tanzim Admissions</h2><p className="text-slate-500 dark:text-slate-400">Manage Tanzim-ul-Madaris annual examination admissions & fees.</p></div>
        <div className="flex gap-3"><input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportFile} /><button onClick={handleImportTrigger} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm flex items-center gap-2 font-medium"><Upload className="w-5 h-5" /> Import</button><button onClick={handleExport} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm flex items-center gap-2 font-medium"><FileSpreadsheet className="w-5 h-5" /> Export</button><button onClick={openAddModal} className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-600/20 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> New Admission</button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Applications</p><p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{records.length}</p></div><div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm"><p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Admissions Paid</p><p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{records.filter(r => r.isFeePaid).length}</p></div><div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-red-100 dark:border-red-900 shadow-sm"><p className="text-sm text-red-600 dark:text-red-400 font-medium">Admissions Pending</p><p className="text-3xl font-bold text-red-700 dark:text-red-300">{records.filter(r => !r.isFeePaid).length}</p></div></div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="relative w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Search by student or father's name..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{filteredRecords.length === 0 ? <div className="col-span-2 text-center p-12 text-slate-400 dark:text-slate-500">No admission records found.</div> : filteredRecords.map(r => (<div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row relative group"><div className="absolute top-4 right-4 flex gap-2 z-10">{r.contactNumber && <a href={`https://wa.me/${r.contactNumber}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 dark:bg-slate-700/80 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-[#25D366]"><MessageCircle className="w-4 h-4" /></a>}<button onClick={() => openEditModal(r)} className="p-2 bg-white/90 dark:bg-slate-700/80 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-purple-600"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(r.id)} className="p-2 bg-white/90 dark:bg-slate-700/80 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div><div className="w-full md:w-40 h-40 md:h-auto bg-slate-50 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">{r.studentPhotoUrl ? <img src={r.studentPhotoUrl} alt={r.studentName} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-300 dark:text-slate-500" />}<div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs py-1 text-center font-medium">{r.examYear}</div></div><div className="p-5 flex-1"><h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{r.studentName}</h3><p className="text-sm text-slate-500 dark:text-slate-400">s/o {r.fatherName}</p><div className="grid grid-cols-2 gap-y-2 text-sm mt-4"><div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-slate-400" /><span className={r.isFeePaid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-red-500 dark:text-red-400 font-bold"}>{r.isFeePaid ? "Paid" : "Pending"}</span></div></div></div></div>))}</div>
      {isModalOpen && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"><div className="p-5 bg-purple-700 text-white flex justify-between items-center sticky top-0 z-10"><h3 className="text-lg font-bold">{isEditing ? 'Edit Admission' : 'New Admission'}</h3><button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-purple-200 hover:text-white" /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div><h4 className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-100 dark:border-slate-700 pb-2 flex items-center gap-2"><User className="w-4 h-4" /> Student Info</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Student Name</label><input required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.studentName || ''} onChange={e => setFormData({...formData, studentName: e.target.value})} /></div><div><label className="block text-sm font-medium mb-1">Father's Name</label><input required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} /></div><div><label className="block text-sm font-medium mb-1">Contact</label><input required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div><div><label className="block text-sm font-medium mb-1">Exam Year</label><input required type="number" className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.examYear || ''} onChange={e => setFormData({...formData, examYear: e.target.value})} /></div></div></div>
          <div><h4 className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-100 dark:border-slate-700 pb-2 flex items-center gap-2"><Wallet className="w-4 h-4" /> Fee Details</h4><div className="space-y-4"><div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700"><h5 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Admission Fee</h5><div className="grid grid-cols-2 gap-4"><div><label>Amount</label><input type="number" className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.admissionFee || ''} onChange={e => setFormData({...formData, admissionFee: Number(e.target.value)})} /></div><div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox h-5 w-5 rounded text-purple-600" checked={formData.isFeePaid} onChange={e => setFormData({...formData, isFeePaid: e.target.checked})} /> Paid</label></div></div><div className="mt-2"><label>Challan #</label><input className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.challanNumber || ''} onChange={e => setFormData({...formData, challanNumber: e.target.value})} /></div></div><div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700"><h5 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Other Fee (Optional)</h5><div className="grid grid-cols-2 gap-4"><div><label>Amount</label><input type="number" className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.otherFee || ''} onChange={e => setFormData({...formData, otherFee: Number(e.target.value)})} /></div><div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" className="form-checkbox h-5 w-5 rounded text-purple-600" checked={formData.isOtherFeePaid} onChange={e => setFormData({...formData, isOtherFeePaid: e.target.checked})} /> Paid</label></div></div><div className="mt-2"><label>Challan #</label><input className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={formData.otherFeeChallanNumber || ''} onChange={e => setFormData({...formData, otherFeeChallanNumber: e.target.value})} /></div></div></div></div>
          <div><h4 className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-100 dark:border-slate-700 pb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Document Uploads</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><FileUploadPreview label="Student Photo" currentImage={formData.studentPhotoUrl} onUpload={(e) => handleFileUpload('studentPhotoUrl', e)} /><FileUploadPreview label="CNIC Copy" currentImage={formData.cnicImageUrl} onUpload={(e) => handleFileUpload('cnicImageUrl', e)} /><FileUploadPreview label="Challan Copy" currentImage={formData.challanImageUrl} onUpload={(e) => handleFileUpload('challanImageUrl', e)} /></div></div>
          <div><h4 className="text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-100 dark:border-slate-700 pb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Physical Documents Checklist</h4><div className="flex flex-wrap gap-4">{['cnic', 'photos', 'receipt'].map(doc => <label key={doc} className="flex items-center gap-2 capitalize"><input type="checkbox" className="form-checkbox h-5 w-5 rounded text-purple-600" checked={formData.documentsSubmitted?.[doc as keyof typeof formData.documentsSubmitted]} onChange={e => setFormData(prev => ({...prev, documentsSubmitted: {...prev.documentsSubmitted, [doc]: e.target.checked } as any}))} /> {doc}</label>)}</div></div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg shadow-purple-600/20">{isEditing ? 'Save Changes' : 'Add Record'}</button></div>
        </form>
      </div></div>}
    </div>
  );
};

export default TanzimModule;
