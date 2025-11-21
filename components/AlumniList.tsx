
import React, { useState, useRef } from 'react';
import { Search, CheckCircle, User, X, FileBadge, Calendar, GraduationCap, Plus, Upload, Camera, BadgeCheck, FileText, Trash2, ScrollText, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { Student, AcademicTrack, StudentStatus, DARS_E_NIZAMI_CLASSES, CertificateStatus, HIFZ_LEVELS } from '../types';
import { exportToExcel, readExcelFile } from '../utils/excel';

interface AlumniListProps {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
}

const AlumniList: React.FC<AlumniListProps> = ({ students, addStudent, updateStudent, deleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAlumniData, setNewAlumniData] = useState<Partial<Student>>({
    status: StudentStatus.GRADUATED, track: AcademicTrack.DARS_E_NIZAMI, certificateStatus: CertificateStatus.RECEIVED, certificateDetails: '', graduationDate: new Date().toISOString().split('T')[0], completedLevels: [], photoUrl: '', className: 'Graduated', fullName: '', fatherName: '', bForm: '', fatherCnic: '', contactNumber: '', address: ''
  });

  const alumni = students.filter(s => s.status === StudentStatus.GRADUATED);
  const filteredAlumni = alumni.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.fatherName.toLowerCase().includes(searchTerm.toLowerCase()));

  const openEditModal = (student: Student) => { setSelectedStudent({ ...student }); setIsModalOpen(true); };
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); if (selectedStudent) { updateStudent(selectedStudent); setIsModalOpen(false); } };
  const handleDelete = (id: string) => { if (window.confirm("Are you sure?")) { deleteStudent(id); } };

  const handleAddAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlumniData.fullName && newAlumniData.fatherName) {
      addStudent({ ...newAlumniData, id: Date.now().toString(), className: 'Graduated', alumniPhotoUrl: newAlumniData.photoUrl } as Student);
      setIsAddModalOpen(false);
      setNewAlumniData({ status: StudentStatus.GRADUATED, track: AcademicTrack.DARS_E_NIZAMI, certificateStatus: CertificateStatus.RECEIVED, certificateDetails: '', graduationDate: new Date().toISOString().split('T')[0], completedLevels: [], photoUrl: '', className: 'Graduated', fullName: '', fatherName: '', bForm: '', fatherCnic: '', contactNumber: '', address: '' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) { 
        const reader = new FileReader(); 
        reader.onloadend = () => {
            if (isEditing && selectedStudent) {
                setSelectedStudent({...selectedStudent, alumniPhotoUrl: reader.result as string});
            } else {
                setNewAlumniData({ ...newAlumniData, photoUrl: reader.result as string }); 
            }
        };
        reader.readAsDataURL(file); 
    }
  };

  const toggleLevelCompletion = (level: string) => {
    if (!selectedStudent) return;
    const current = selectedStudent.completedLevels || [];
    const newLevels = current.includes(level) ? current.filter(l => l !== level) : [...current, level];
    setSelectedStudent({ ...selectedStudent, completedLevels: newLevels });
  };
  
  const toggleNewAlumniLevelCompletion = (level: string) => {
    const current = newAlumniData.completedLevels || [];
    const newLevels = current.includes(level) ? current.filter(l => l !== level) : [...current, level];
    setNewAlumniData({ ...newAlumniData, completedLevels: newLevels });
  };

  const getCertificateBadgeColor = (status?: CertificateStatus) => {
    switch (status) {
      case CertificateStatus.RECEIVED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400';
      case CertificateStatus.PENDING: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400';
      case CertificateStatus.NOT_ISSUED: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const handleExport = () => {
    const exportData = alumni.map(s => ({ ID: s.id, "Full Name": s.fullName, "Father Name": s.fatherName, "Track": s.track, "Graduation Date": s.graduationDate, "Certificate Status": s.certificateStatus, "Contact": s.contactNumber, "Address": s.address }));
    exportToExcel(exportData, 'Past_Graduates');
  };
  const handleImportTrigger = () => fileInputRef.current?.click();
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const jsonData = await readExcelFile(file); let addedCount = 0;
      jsonData.forEach((row: any) => {
        const fullName = row["Full Name"] || row["fullName"]; const fatherName = row["Father Name"] || row["fatherName"];
        if (fullName && fatherName) {
          addStudent({ id: Date.now().toString() + Math.random().toString(36).substr(2, 9), fullName, fatherName, bForm: row["B-Form"] || '', fatherCnic: row["Father CNIC"] || '', contactNumber: row["Contact"] || '', address: row["Address"] || '', track: (row["Track"] === 'Hifz' || row["Track"] === 'Dars-e-Nizami') ? row["Track"] : AcademicTrack.DARS_E_NIZAMI, className: 'Graduated', status: StudentStatus.GRADUATED, graduationDate: row["Graduation Date"] || new Date().toISOString().split('T')[0], certificateStatus: row["Certificate Status"] || CertificateStatus.RECEIVED, photoUrl: '', alumniPhotoUrl: '' });
          addedCount++;
        }
      });
      alert(`Successfully imported ${addedCount} graduates.`);
    } catch (error) { alert("Error importing file."); console.error(error); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-amber-700 dark:text-amber-500 font-serif flex items-center gap-2"><GraduationCap className="w-7 h-7" /> Past Graduates</h2><p className="text-slate-500 dark:text-slate-400">Manage graduates, certificates, and academic records.</p></div>
        <div className="flex flex-wrap gap-3"><input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportFile} /><button onClick={handleImportTrigger} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm flex items-center gap-2 font-medium"><Upload className="w-5 h-5" /> Import</button><button onClick={handleExport} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm flex items-center gap-2 font-medium"><FileSpreadsheet className="w-5 h-5" /> Export</button><button onClick={() => setIsAddModalOpen(true)} className="bg-amber-600 text-white px-6 py-2.5 rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-600/20 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Add Past Graduate</button></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm"><p className="text-amber-800 dark:text-amber-400 text-sm font-medium">Total Graduates</p><p className="text-3xl font-bold text-amber-900 dark:text-amber-200">{alumni.length}</p></div><div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hifz Scholars</p><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{alumni.filter(s => s.track === AcademicTrack.HIFZ).length}</p></div><div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Aalim / Aalimah</p><p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{alumni.filter(s => s.track === AcademicTrack.DARS_E_NIZAMI).length}</p></div></div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"><div className="relative w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Search graduates..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filteredAlumni.length === 0 ? <div className="col-span-2 text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed text-slate-400 dark:text-slate-500"><GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>No graduates found.</p></div> : filteredAlumni.map(s => (<div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-amber-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all relative group">{s.track === AcademicTrack.HIFZ && s.hifzCompletionVerified && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">Hifz Verified</div>}<div className="absolute top-4 right-4 z-20 flex gap-2">{s.contactNumber && <a href={`https://wa.me/${s.contactNumber}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-[#25D366]/90 hover:bg-[#25D366] text-white rounded-lg shadow-sm"><MessageCircle className="w-4 h-4" /></a>}<button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="p-1.5 bg-white/80 dark:bg-slate-700/80 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 dark:border-slate-600 backdrop-blur-sm shadow-sm"><Trash2 className="w-4 h-4" /></button></div><div className="p-5 flex items-start gap-4"><div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-slate-700 border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">{s.alumniPhotoUrl || s.photoUrl ? <img src={s.alumniPhotoUrl || s.photoUrl} alt={s.fullName} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-amber-300 dark:text-amber-500" />}</div><div className="flex-1"><h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">{s.fullName}</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{s.track} Graduate</p><div className="mt-3 flex flex-wrap gap-2"><span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${getCertificateBadgeColor(s.certificateStatus)}`}>Sanad: {s.certificateStatus || 'N/A'}</span></div><div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500" /><span>Graduated: {s.graduationDate || 'N/A'}</span></div>{s.track === AcademicTrack.DARS_E_NIZAMI && <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /><span>Levels: {s.completedLevels?.length || 0} / 9</span></div>}</div><button onClick={() => openEditModal(s)} className="mt-4 w-full py-2 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2">View & Edit</button></div></div></div>))}</div>
      {isAddModalOpen && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"><div className="p-6 bg-amber-800 text-white flex justify-between items-center sticky top-0 z-10"><div className="flex items-center gap-3"><div className="bg-amber-700 p-2 rounded-lg"><Plus className="w-5 h-5 text-amber-100" /></div><h3 className="text-xl font-bold font-serif">Add Past Graduate</h3></div><button onClick={() => setIsAddModalOpen(false)}><X className="w-6 h-6 text-amber-200 hover:text-white" /></button></div>
        <form onSubmit={handleAddAlumni} className="p-6 space-y-8 overflow-y-auto">
        <div><h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 dark:border-slate-700 pb-2"><Camera className="w-4 h-4" /> Graduate Picture</h4><div className="flex justify-center"><div className="relative group cursor-pointer"><div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-amber-200 dark:border-slate-600 flex items-center justify-center group-hover:border-amber-500 transition-colors shadow-sm">{newAlumniData.photoUrl ? <img src={newAlumniData.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-500"><Upload className="w-8 h-8 mb-1" /><span className="text-[10px] font-medium uppercase">Upload</span></div>}</div><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /></div></div></div>
        <div><h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 dark:border-slate-700 pb-2"><BadgeCheck className="w-4 h-4" /> Personal Details</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.fullName || ''} onChange={e => setNewAlumniData({...newAlumniData, fullName: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">B-Form</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.bForm || ''} onChange={e => setNewAlumniData({...newAlumniData, bForm: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.fatherName || ''} onChange={e => setNewAlumniData({...newAlumniData, fatherName: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's CNIC</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.fatherCnic || ''} onChange={e => setNewAlumniData({...newAlumniData, fatherCnic: e.target.value})} /></div><div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.contactNumber || ''} onChange={e => setNewAlumniData({...newAlumniData, contactNumber: e.target.value})} /></div><div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label><textarea required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAlumniData.address || ''} onChange={e => setNewAlumniData({...newAlumniData, address: e.target.value})} /></div></div></div>
        <div><h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 dark:border-slate-700 pb-2"><GraduationCap className="w-4 h-4" /> Graduation Details</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Program</label><select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={newAlumniData.track} onChange={e => setNewAlumniData({...newAlumniData, track: e.target.value as AcademicTrack})}><option value={AcademicTrack.DARS_E_NIZAMI}>Dars-e-Nizami</option><option value={AcademicTrack.HIFZ}>Hifz</option></select></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Graduation Date</label><input type="date" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={newAlumniData.graduationDate} onChange={e => setNewAlumniData({...newAlumniData, graduationDate: e.target.value})} /></div></div>{newAlumniData.track === AcademicTrack.DARS_E_NIZAMI && <div className="mt-5"><h5 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">Completed Levels</h5><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{DARS_E_NIZAMI_CLASSES.map(level => <label key={level} className="flex items-center gap-2 text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700"><input type="checkbox" checked={newAlumniData.completedLevels?.includes(level)} onChange={() => toggleNewAlumniLevelCompletion(level)} className="form-checkbox h-4 w-4 rounded text-amber-600" /><span>{level}</span></label>)}</div></div>}</div>
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700"><button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium shadow-lg shadow-amber-600/20 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Graduate</button></div>
        </form>
      </div></div>}
      {isModalOpen && selectedStudent && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"><div className="p-6 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-amber-100" /></div><div><h3 className="text-xl font-bold font-serif">Graduate Records</h3><p className="text-xs text-amber-200">{selectedStudent.fullName}</p></div></div><button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-amber-200 hover:text-white" /></button></div>
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
          {selectedStudent.track === AcademicTrack.DARS_E_NIZAMI && <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Dars-e-Nizami Completion Status</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{DARS_E_NIZAMI_CLASSES.map(level => <label key={level} className={`flex items-center gap-2 text-sm p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedStudent.completedLevels?.includes(level) ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700'}`}><input type="checkbox" checked={selectedStudent.completedLevels?.includes(level)} onChange={() => toggleLevelCompletion(level)} className="form-checkbox h-5 w-5 rounded-md text-emerald-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-emerald-500" /><span>{level}</span></label>)}</div></div>}
          {selectedStudent.track === AcademicTrack.HIFZ && <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Hifz-ul-Quran Status</h4><label className="flex items-center gap-2 text-sm p-3 rounded-xl border-2 bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 cursor-pointer"><input type="checkbox" checked={selectedStudent.hifzCompletionVerified} onChange={e => setSelectedStudent({...selectedStudent, hifzCompletionVerified: e.target.checked})} className="form-checkbox h-5 w-5 rounded-md text-emerald-600" /><span>Hifz Completion Verified</span></label></div>}
          <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Sanad / Certificate Details</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><select className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={selectedStudent.certificateStatus} onChange={e => setSelectedStudent({...selectedStudent, certificateStatus: e.target.value as CertificateStatus})}>{Object.values(CertificateStatus).map(s => <option key={s} value={s}>{s}</option>)}</select><input type="text" placeholder="Certificate notes (e.g., Grade A+)" className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={selectedStudent.certificateDetails || ''} onChange={e => setSelectedStudent({...selectedStudent, certificateDetails: e.target.value})} /></div></div>
          <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Personal Information</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={selectedStudent.bForm || ''} onChange={e => setSelectedStudent({...selectedStudent, bForm: e.target.value})} placeholder="B-Form" /><input className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={selectedStudent.fatherName || ''} onChange={e => setSelectedStudent({...selectedStudent, fatherName: e.target.value})} placeholder="Father's Name" /><input className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" value={selectedStudent.contactNumber || ''} onChange={e => setSelectedStudent({...selectedStudent, contactNumber: e.target.value})} placeholder="Contact" /><textarea className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 md:col-span-2" value={selectedStudent.address || ''} onChange={e => setSelectedStudent({...selectedStudent, address: e.target.value})} placeholder="Address" /></div></div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium shadow-lg shadow-amber-600/20 flex items-center gap-2">Save Changes</button></div>
        </form>
      </div></div>}
    </div>
  );
};

export default AlumniList;
