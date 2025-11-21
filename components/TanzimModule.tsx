
import React, { useState, useRef } from 'react';
import { Search, Plus, ScrollText, Upload, User, FileText, Banknote, CheckCircle, XCircle, X, Pencil, Trash2, MessageCircle, FileSpreadsheet } from 'lucide-react';
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
  
  const [formData, setFormData] = useState<Partial<TanzimRecord>>({
    examYear: new Date().getFullYear().toString(),
    admissionFee: 0,
    isFeePaid: false,
    otherFee: 0,
    isOtherFeePaid: false,
    extraPhotosUrls: [],
    documentsSubmitted: { cnic: false, photos: false, receipt: false }
  });

  const filteredRecords = records.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({
      examYear: new Date().getFullYear().toString(),
      admissionFee: 0,
      isFeePaid: false,
      otherFee: 0,
      isOtherFeePaid: false,
      extraPhotosUrls: [],
      documentsSubmitted: { cnic: false, photos: false, receipt: false }
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (record: TanzimRecord) => {
    setFormData(record);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this admission record?")) {
      deleteRecord(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentName) {
      if (isEditing && formData.id) {
        updateRecord(formData as TanzimRecord);
      } else {
        addRecord({ ...formData, id: Date.now().toString() } as TanzimRecord);
      }
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = (field: keyof TanzimRecord, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Excel Handlers
  const handleExport = () => {
    const exportData = records.map(r => ({
        ID: r.id,
        StudentName: r.studentName,
        FatherName: r.fatherName,
        Contact: r.contactNumber,
        ExamYear: r.examYear,
        FeePaid: r.isFeePaid ? "Yes" : "No",
        AdmissionFee: r.admissionFee,
        ChallanNo: r.challanNumber
    }));
    exportToExcel(exportData, 'Tanzim_Admissions');
  };

  const handleImportTrigger = () => {
      fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const jsonData = await readExcelFile(file);
          let addedCount = 0;
          
          jsonData.forEach((row: any) => {
             const sName = row["StudentName"] || row["studentName"];
             const fName = row["FatherName"] || row["fatherName"];
             
             if (sName && fName) {
                const newRecord: TanzimRecord = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2,9),
                    studentName: sName,
                    fatherName: fName,
                    contactNumber: row["Contact"] || row["contactNumber"] || '',
                    examYear: row["ExamYear"] || row["examYear"] || new Date().getFullYear().toString(),
                    admissionFee: Number(row["AdmissionFee"] || row["admissionFee"] || 0),
                    isFeePaid: (row["FeePaid"] === "Yes" || row["FeePaid"] === true),
                    challanNumber: row["ChallanNo"] || row["challanNumber"] || '',
                    documentsSubmitted: { cnic: false, photos: false, receipt: false }
                };
                addRecord(newRecord);
                addedCount++;
             }
          });
          alert(`Successfully imported ${addedCount} records.`);
      } catch (error) {
          alert("Error importing records.");
          console.error(error);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-serif flex items-center gap-2">
             <ScrollText className="w-7 h-7 text-purple-600" /> Tanzim Admissions
          </h2>
          <p className="text-slate-500">Manage Tanzim-ul-Madaris annual examination admissions & fees.</p>
        </div>
        <div className="flex gap-3">
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleImportFile}
            />
            <button 
              onClick={handleImportTrigger}
              className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-medium"
            >
              <Upload className="w-5 h-5" /> Import
            </button>
            <button 
              onClick={handleExport}
              className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-medium"
            >
              <FileSpreadsheet className="w-5 h-5" /> Export
            </button>
            <button 
              onClick={openAddModal}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" /> New Admission
            </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">Total Applications</p>
            <p className="text-3xl font-bold text-slate-700">{records.length}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
            <p className="text-sm text-emerald-600 font-medium">Admissions Paid</p>
            <p className="text-3xl font-bold text-emerald-700">{records.filter(r => r.isFeePaid).length}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
            <p className="text-sm text-red-600 font-medium">Admissions Pending</p>
            <p className="text-3xl font-bold text-red-700">{records.filter(r => !r.isFeePaid).length}</p>
         </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student or father's name..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.length === 0 ? (
            <div className="col-span-2 text-center p-12 text-slate-400">No admission records found.</div>
        ) : (
            filteredRecords.map(record => (
                <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row relative group">
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        {record.contactNumber && (
                            <a 
                                href={`https://wa.me/${record.contactNumber}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-white/90 rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-[#25D366]"
                                title="Chat on WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        )}
                        <button onClick={() => openEditModal(record)} className="p-2 bg-white/90 rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-purple-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(record.id)} className="p-2 bg-white/90 rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {/* Image Section */}
                    <div className="w-full md:w-40 h-40 md:h-auto bg-slate-50 flex items-center justify-center relative overflow-hidden">
                        {record.studentPhotoUrl ? (
                            <img src={record.studentPhotoUrl} alt={record.studentName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-slate-300" />
                        )}
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs py-1 text-center font-medium">
                          {record.examYear}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h3 className="font-bold text-slate-800 text-lg">{record.studentName}</h3>
                              <p className="text-sm text-slate-500">s/o {record.fatherName}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
                           <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-slate-400" />
                              <span className={record.isFeePaid ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                {record.isFeePaid ? "Fee Paid" : "Fee Pending"}
                              </span>
                           </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-5 bg-purple-700 text-white flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-bold">{isEditing ? 'Edit Admission' : 'New Admission Application'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-purple-200 hover:text-white" /></button>
             </div>

             <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                
                {/* Student Info */}
                <div className="space-y-4">
                   <h4 className="font-bold text-purple-800 text-sm uppercase border-b border-purple-100 pb-2">Applicant Details</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Student Name</label>
                         <input required className="w-full p-2 border rounded-lg" value={formData.studentName || ''} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Father Name</label>
                         <input required className="w-full p-2 border rounded-lg" value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Contact</label>
                         <input required className="w-full p-2 border rounded-lg" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Exam Year</label>
                         <input required className="w-full p-2 border rounded-lg" value={formData.examYear || ''} onChange={e => setFormData({...formData, examYear: e.target.value})} />
                      </div>
                   </div>
                   
                   {/* Photos */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Student Profile Photo</label>
                         <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                               {formData.studentPhotoUrl && <img src={formData.studentPhotoUrl} className="w-full h-full object-cover" />}
                            </div>
                            <label className="cursor-pointer bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100">
                               Upload
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('studentPhotoUrl', e)} />
                            </label>
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">CNIC / B-Form Image</label>
                         <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                               {formData.cnicImageUrl && <img src={formData.cnicImageUrl} className="w-full h-full object-cover" />}
                            </div>
                            <label className="cursor-pointer bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100">
                               Upload
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('cnicImageUrl', e)} />
                            </label>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Fees */}
                <div className="space-y-4">
                   <h4 className="font-bold text-purple-800 text-sm uppercase border-b border-purple-100 pb-2">Fee Information</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Admission Fee</label>
                         <input type="number" className="w-full p-2 border rounded-lg" value={formData.admissionFee} onChange={e => setFormData({...formData, admissionFee: Number(e.target.value)})} />
                      </div>
                      <div className="flex items-center pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={formData.isFeePaid} onChange={e => setFormData({...formData, isFeePaid: e.target.checked})} />
                             <span className="font-bold text-slate-700">Fee Paid?</span>
                          </label>
                      </div>
                      <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 mb-1">Challan Number</label>
                         <input className="w-full p-2 border rounded-lg" value={formData.challanNumber || ''} onChange={e => setFormData({...formData, challanNumber: e.target.value})} />
                      </div>
                   </div>
                </div>
                
                {/* Documents Checklist */}
                <div className="space-y-4">
                   <h4 className="font-bold text-purple-800 text-sm uppercase border-b border-purple-100 pb-2">Document Checklist</h4>
                   <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                         <input type="checkbox" checked={formData.documentsSubmitted?.cnic} onChange={e => setFormData({...formData, documentsSubmitted: {...formData.documentsSubmitted!, cnic: e.target.checked}})} />
                         CNIC/B-Form Copy
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                         <input type="checkbox" checked={formData.documentsSubmitted?.photos} onChange={e => setFormData({...formData, documentsSubmitted: {...formData.documentsSubmitted!, photos: e.target.checked}})} />
                         Passport Photos (2)
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                         <input type="checkbox" checked={formData.documentsSubmitted?.receipt} onChange={e => setFormData({...formData, documentsSubmitted: {...formData.documentsSubmitted!, receipt: e.target.checked}})} />
                         Bank Receipt
                      </label>
                   </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                   <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium shadow-lg shadow-purple-600/20 flex items-center gap-2">
                     <CheckCircle className="w-4 h-4" /> Save Record
                   </button>
                </div>

             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TanzimModule;
