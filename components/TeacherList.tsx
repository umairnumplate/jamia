
import React, { useState, useRef } from 'react';
import { Plus, User, BookOpen, Clock, Calendar, Pencil, Trash2, MessageCircle, Upload, FileSpreadsheet } from 'lucide-react';
import { Teacher, TeacherAssignment, DARS_E_NIZAMI_CLASSES, HIFZ_LEVELS } from '../types';
import { exportToExcel, readExcelFile } from '../utils/excel';

interface TeacherListProps {
  teachers: Teacher[];
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, addTeacher, updateTeacher, deleteTeacher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [contact, setContact] = useState('');
  
  const [assignClass, setAssignClass] = useState(DARS_E_NIZAMI_CLASSES[0]);
  const [assignSubject, setAssignSubject] = useState('');
  const [assignStart, setAssignStart] = useState('08:00');
  const [assignEnd, setAssignEnd] = useState('09:00');

  const openAddModal = () => {
    setName(''); setQualification(''); setContact(''); setAssignSubject(''); setAssignStart('08:00'); setAssignEnd('09:00');
    setIsEditing(false); setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setName(teacher.name); setQualification(teacher.qualification); setContact(teacher.contactNumber); setCurrentTeacherId(teacher.id);
    if (teacher.assignments && teacher.assignments.length > 0) {
      const assign = teacher.assignments[0];
      setAssignClass(assign.className); setAssignSubject(assign.subject); setAssignStart(assign.startTime); setAssignEnd(assign.endTime);
    }
    setIsEditing(true); setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this teacher record?")) deleteTeacher(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: TeacherAssignment = { id: Date.now().toString() + '_a', className: assignClass, subject: assignSubject, startTime: assignStart, endTime: assignEnd, dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
    const teacher: Teacher = { id: isEditing && currentTeacherId ? currentTeacherId : Date.now().toString(), name, qualification, contactNumber: contact, assignments: [newAssignment] };
    if (isEditing) updateTeacher(teacher); else addTeacher(teacher);
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const exportData = teachers.map(t => ({ ID: t.id, Name: t.name, Qualification: t.qualification, Contact: t.contactNumber, AssignmentClass: t.assignments[0]?.className || '', Subject: t.assignments[0]?.subject || '', StartTime: t.assignments[0]?.startTime || '', EndTime: t.assignments[0]?.endTime || '' }));
    exportToExcel(exportData, 'Teachers_List');
  };

  const handleImportTrigger = () => fileInputRef.current?.click();
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const jsonData = await readExcelFile(file);
      let addedCount = 0;
      jsonData.forEach((row: any) => {
         const tName = row["Name"] || row["name"]; const tQual = row["Qualification"] || row["qualification"];
         if (tName && tQual) {
            const newAssignment: TeacherAssignment = { id: Date.now().toString() + Math.random().toString(36).substr(2,5), className: row["AssignmentClass"] || row["className"] || DARS_E_NIZAMI_CLASSES[0], subject: row["Subject"] || row["subject"] || 'General', startTime: row["StartTime"] || row["startTime"] || '08:00', endTime: row["EndTime"] || row["endTime"] || '09:00', dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
            const newTeacher: Teacher = { id: Date.now().toString() + Math.random().toString(36).substr(2,9), name: tName, qualification: tQual, contactNumber: row["Contact"] || row["contactNumber"] || '', assignments: [newAssignment] };
            addTeacher(newTeacher); addedCount++;
         }
      });
      alert(`Successfully imported ${addedCount} teachers.`);
    } catch (error) { alert("Error importing teachers."); console.error(error); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">Faculty Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Teachers, qualifications and time tables.</p>
        </div>
        <div className="flex gap-3">
           <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportFile} />
           <button onClick={handleImportTrigger} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm flex items-center gap-2 font-medium"><Upload className="w-5 h-5" /> Import</button>
           <button onClick={handleExport} className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm flex items-center gap-2 font-medium"><FileSpreadsheet className="w-5 h-5" /> Export</button>
           <button onClick={openAddModal} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Add Teacher</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {teachers.map(teacher => (
          <div key={teacher.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative group">
             <div className="absolute top-6 right-6 flex gap-2">
                {teacher.contactNumber && <a href={`https://wa.me/${teacher.contactNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-500 dark:text-slate-400 hover:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600" title="Chat on WhatsApp"><MessageCircle className="w-4 h-4" /></a>}
                <button onClick={() => openEditModal(teacher)} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(teacher.id)} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"><Trash2 className="w-4 h-4" /></button>
             </div>
             <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
               <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">{teacher.name.charAt(0)}</div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{teacher.name}</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">{teacher.qualification}</p>
               </div>
               <div className="ml-auto text-sm text-slate-400 dark:text-slate-500 mr-24">{teacher.contactNumber}</div>
             </div>
             <div className="p-6">
               <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Weekly Schedule</h4>
               <div className="space-y-3">
                 {teacher.assignments.map(assign => (
                   <div key={assign.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                         <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200 dark:border-slate-600 shadow-sm">{assign.className}</span>
                         <span className="font-medium text-slate-700 dark:text-slate-200">{assign.subject}</span>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Clock className="w-3 h-3" />{assign.startTime} - {assign.endTime}</div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{isEditing ? 'Edit Teacher' : 'Add Teacher'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <input placeholder="Full Name" required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={name} onChange={e => setName(e.target.value)} />
               <input placeholder="Qualification (e.g., Mufti, Qari)" required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={qualification} onChange={e => setQualification(e.target.value)} />
               <input placeholder="Contact Number" required className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={contact} onChange={e => setContact(e.target.value)} />
               <div className="border-t dark:border-slate-700 pt-4 mt-4">
                 <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Primary Assignment</h4>
                 <div className="grid grid-cols-2 gap-2">
                   <select className="p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={assignClass} onChange={e => setAssignClass(e.target.value)}>{[...DARS_E_NIZAMI_CLASSES, ...HIFZ_LEVELS].map(c => <option key={c} value={c}>{c}</option>)}</select>
                   <input placeholder="Subject (e.g., Fiqh)" className="p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={assignSubject} onChange={e => setAssignSubject(e.target.value)} required />
                   <input type="time" className="p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={assignStart} onChange={e => setAssignStart(e.target.value)} required />
                   <input type="time" className="p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={assignEnd} onChange={e => setAssignEnd(e.target.value)} required />
                 </div>
               </div>
               <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg mt-4">{isEditing ? 'Update Teacher' : 'Save Teacher'}</button>
               <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 dark:text-slate-300 py-2 mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
