
import React, { useState, useRef } from 'react';
import { Search, Plus, User, Phone, MapPin, X, GraduationCap, Upload, Camera, FileText, BadgeCheck, Pencil, Trash2, MessageCircle, Megaphone, Send, FileSpreadsheet, Download } from 'lucide-react';
import { Student, AcademicTrack, StudentStatus, DARS_E_NIZAMI_CLASSES, HIFZ_LEVELS } from '../types';
import { exportToExcel, readExcelFile } from '../utils/excel';

interface StudentListProps {
  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, addStudent, updateStudent, deleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>({
    track: AcademicTrack.HIFZ,
    status: StudentStatus.ACTIVE,
    className: HIFZ_LEVELS[0],
    photoUrl: ''
  });

  const filteredStudents = students.filter(s => {
    const isNotGraduated = s.status !== StudentStatus.GRADUATED;
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.fatherName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = filterTrack === 'all' || s.track === filterTrack;
    return isNotGraduated && matchesSearch && matchesTrack;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setFormData({ track: AcademicTrack.HIFZ, status: StudentStatus.ACTIVE, className: HIFZ_LEVELS[0], photoUrl: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setFormData(student);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.fatherName) {
      if (isEditing && formData.id) {
        updateStudent(formData as Student);
      } else {
        addStudent({ ...formData, id: Date.now().toString() } as Student);
      }
      setIsModalOpen(false);
      setFormData({ track: AcademicTrack.HIFZ, status: StudentStatus.ACTIVE, className: HIFZ_LEVELS[0], photoUrl: '' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this student? This action cannot be undone.")) {
      deleteStudent(id);
    }
  };

  const handleGraduate = (student: Student) => {
    if (window.confirm(`Are you sure you want to graduate ${student.fullName}? They will be moved to the Alumni section.`)) {
      updateStudent({ ...student, status: StudentStatus.GRADUATED, graduationDate: new Date().toISOString().split('T')[0], completedLevels: [], certificateStatus: undefined });
    }
  };

  const sendWhatsApp = (contactNumber: string, text: string = '') => {
    const cleanNumber = contactNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    const exportData = filteredStudents.map(s => ({ ID: s.id, "Full Name": s.fullName, "Father Name": s.fatherName, "Father CNIC": s.fatherCnic, "B-Form": s.bForm, "Track": s.track, "Class": s.className, "Contact": s.contactNumber, "Address": s.address, "Status": s.status }));
    exportToExcel(exportData, 'Students_List');
  };

  const handleImportTrigger = () => fileInputRef.current?.click();
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const jsonData = await readExcelFile(file);
      let addedCount = 0;
      jsonData.forEach((row: any) => {
        const fullName = row["Full Name"] || row["fullName"] || row["Name"];
        const fatherName = row["Father Name"] || row["fatherName"] || row["Father"];
        if (fullName && fatherName) {
          addStudent({ id: Date.now().toString() + Math.random().toString(36).substr(2, 9), fullName, fatherName, bForm: row["B-Form"] || row["bForm"] || '', fatherCnic: row["Father CNIC"] || row["fatherCnic"] || '', contactNumber: row["Contact"] || row["contactNumber"] || '', address: row["Address"] || row["address"] || '', track: (row["Track"] === 'Hifz' || row["Track"] === 'Dars-e-Nizami') ? row["Track"] : AcademicTrack.HIFZ, className: row["Class"] || row["className"] || HIFZ_LEVELS[0], status: StudentStatus.ACTIVE, photoUrl: '' });
          addedCount++;
        }
      });
      alert(`Successfully imported ${addedCount} students.`);
    } catch (error) {
      alert("Error importing file.");
      console.error(error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">Student Directory</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage active student profiles and admission details.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportFile} />
          <button onClick={handleImportTrigger} className="bg-white dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-slate-600 border border-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm flex items-center gap-2 font-medium" title="Import from Excel"><Upload className="w-5 h-5" /> Import</button>
          <button onClick={handleExport} className="bg-white dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 text-slate-600 border border-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm flex items-center gap-2 font-medium" title="Export to Excel"><FileSpreadsheet className="w-5 h-5" /> Export</button>
          <button onClick={() => setIsBroadcastModalOpen(true)} className="bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 font-medium"><Megaphone className="w-5 h-5" /> Broadcast</button>
          <button onClick={openAddModal} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Admit Student</button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search by name or father's name..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)}>
          <option value="all">All Tracks</option>
          <option value={AcademicTrack.HIFZ}>{AcademicTrack.HIFZ}</option>
          <option value={AcademicTrack.DARS_E_NIZAMI}>{AcademicTrack.DARS_E_NIZAMI}</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                    {student.photoUrl ? <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{student.fullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.className}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.track === AcademicTrack.HIFZ ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'}`}>{student.track === AcademicTrack.HIFZ ? 'Hifz' : 'Nizami'}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>Father: {student.fatherName}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{student.contactNumber}</span></div>
                <div className="flex items-center gap-2 truncate"><MapPin className="w-4 h-4 text-slate-400" /><span className="truncate">{student.address}</span></div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
               <div className="flex gap-2">
                  <button onClick={() => openEditModal(student)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm" title="Edit Student"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm" title="Remove Student"><Trash2 className="w-4 h-4" /></button>
                  {student.contactNumber && (<button onClick={() => sendWhatsApp(student.contactNumber)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#25D366] hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm" title="Chat on WhatsApp"><MessageCircle className="w-4 h-4" /></button>)}
               </div>
               {student.status === StudentStatus.ACTIVE && (<button onClick={() => handleGraduate(student)} className="text-xs flex items-center gap-1 bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/50 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors shadow-sm" title="Mark as Graduated"><GraduationCap className="w-3.5 h-3.5" /> Graduate</button>)}
            </div>
          </div>
        ))}
      </div>
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center"><h3 className="text-xl font-bold font-serif flex items-center gap-2"><Megaphone className="w-6 h-6" /> Broadcast Message</h3><button onClick={() => setIsBroadcastModalOpen(false)}><X className="w-6 h-6 text-amber-100 hover:text-white" /></button></div>
            <div className="p-6 overflow-y-auto flex-1">
               <div className="mb-6"><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Message to {filteredStudents.length} Student(s)</label><textarea className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none bg-slate-50 dark:bg-slate-700" rows={4} placeholder="Type your important announcement here..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} /><p className="text-xs text-slate-400 dark:text-slate-500 mt-2">This will allow you to send the above message to each student in the current list individually via WhatsApp.</p></div>
               <div className="space-y-2"><h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Recipients List</h4>{filteredStudents.map(student => (<div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400"><User className="w-4 h-4" /></div><div><p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{student.fullName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{student.contactNumber}</p></div></div><button onClick={() => sendWhatsApp(student.contactNumber, broadcastMessage)} className="flex items-center gap-1.5 text-xs font-bold bg-[#25D366] text-white px-3 py-1.5 rounded-lg hover:bg-[#20bd5a] transition-colors"><Send className="w-3 h-3" /> Send</button></div>))}</div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 bg-emerald-900 dark:bg-slate-700 text-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3"><div className="bg-emerald-800 dark:bg-slate-600 p-2 rounded-lg"><Plus className="w-5 h-5 text-emerald-200" /></div><h3 className="text-xl font-bold font-serif">{isEditing ? 'Update Student Profile' : 'Admit New Student'}</h3></div>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-emerald-300 dark:text-slate-300 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-100 dark:border-slate-700 pb-2"><Camera className="w-4 h-4" /> Student Picture</h4>
                <div className="flex justify-center"><div className="relative group cursor-pointer"><div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-emerald-200 dark:border-slate-600 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">{formData.photoUrl ? <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500"><Upload className="w-8 h-8 mb-1" /><span className="text-[10px] font-medium uppercase">Upload</span></div>}</div><input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /></div></div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-100 dark:border-slate-700 pb-2"><BadgeCheck className="w-4 h-4" /> Student Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. Muhammad Ali" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">B-Form Number</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. 35202-1234567-1" value={formData.bForm || ''} onChange={e => setFormData({...formData, bForm: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Track</label><select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.track} onChange={e => {const newTrack=e.target.value as AcademicTrack; setFormData({...formData, track:newTrack, className:newTrack === AcademicTrack.HIFZ ? HIFZ_LEVELS[0]:DARS_E_NIZAMI_CLASSES[0]})}}><option value={AcademicTrack.HIFZ}>{AcademicTrack.HIFZ}</option><option value={AcademicTrack.DARS_E_NIZAMI}>{AcademicTrack.DARS_E_NIZAMI}</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class / Level</label><select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>{formData.track === AcademicTrack.HIFZ ? HIFZ_LEVELS.map(c=><option key={c} value={c}>{c}</option>) : DARS_E_NIZAMI_CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-emerald-100 dark:border-slate-700 pb-2"><FileText className="w-4 h-4" /> Guardian & Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Guardian Name" value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's CNIC</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="35202-1234567-9" value={formData.fatherCnic || ''} onChange={e => setFormData({...formData, fatherCnic: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label><input required type="tel" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="0300-1234567" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residential Address</label><textarea required rows={2} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" placeholder="Complete home address..." value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"><User className="w-4 h-4" /> {isEditing ? 'Update Student' : 'Save Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
