
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

  // State for adding new Alumni manually
  const [newAlumniData, setNewAlumniData] = useState<Partial<Student>>({
    status: StudentStatus.GRADUATED,
    track: AcademicTrack.DARS_E_NIZAMI,
    certificateStatus: CertificateStatus.RECEIVED,
    certificateDetails: '',
    graduationDate: new Date().toISOString().split('T')[0],
    completedLevels: [],
    photoUrl: '',
    className: 'Graduated',
    fullName: '',
    fatherName: '',
    bForm: '',
    fatherCnic: '',
    contactNumber: '',
    address: ''
  });

  const alumni = students.filter(s => s.status === StudentStatus.GRADUATED);

  const filteredAlumni = alumni.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (student: Student) => {
    setSelectedStudent({ ...student });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      updateStudent(selectedStudent);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this graduate record? This action cannot be undone.")) {
      deleteStudent(id);
    }
  };

  const handleAddAlumni = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlumniData.fullName && newAlumniData.fatherName) {
      const student: Student = {
        ...newAlumniData,
        id: Date.now().toString(),
        className: 'Graduated',
        photoUrl: newAlumniData.photoUrl,
        alumniPhotoUrl: newAlumniData.photoUrl
      } as Student;
      
      addStudent(student);
      setIsAddModalOpen(false);
      setNewAlumniData({
        status: StudentStatus.GRADUATED,
        track: AcademicTrack.DARS_E_NIZAMI,
        certificateStatus: CertificateStatus.RECEIVED,
        certificateDetails: '',
        graduationDate: new Date().toISOString().split('T')[0],
        completedLevels: [],
        photoUrl: '',
        className: 'Graduated',
        fullName: '',
        fatherName: '',
        bForm: '',
        fatherCnic: '',
        contactNumber: '',
        address: ''
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAlumniData({ ...newAlumniData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLevelCompletion = (level: string) => {
    if (!selectedStudent) return;
    const currentLevels = selectedStudent.completedLevels || [];
    let newLevels;
    if (currentLevels.includes(level)) {
      newLevels = currentLevels.filter(l => l !== level);
    } else {
      newLevels = [...currentLevels, level];
    }
    setSelectedStudent({ ...selectedStudent, completedLevels: newLevels });
  };

  const toggleNewAlumniLevelCompletion = (level: string) => {
    const currentLevels = newAlumniData.completedLevels || [];
    let newLevels;
    if (currentLevels.includes(level)) {
      newLevels = currentLevels.filter(l => l !== level);
    } else {
      newLevels = [...currentLevels, level];
    }
    setNewAlumniData({ ...newAlumniData, completedLevels: newLevels });
  };

  const getCertificateBadgeColor = (status?: CertificateStatus) => {
    switch (status) {
      case CertificateStatus.RECEIVED: return 'bg-emerald-100 text-emerald-700';
      case CertificateStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case CertificateStatus.NOT_ISSUED: return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  // Excel Handlers
  const handleExport = () => {
    const exportData = alumni.map(s => ({
      ID: s.id,
      "Full Name": s.fullName,
      "Father Name": s.fatherName,
      "Track": s.track,
      "Graduation Date": s.graduationDate,
      "Certificate Status": s.certificateStatus,
      "Contact": s.contactNumber,
      "Address": s.address
    }));
    exportToExcel(exportData, 'Past_Graduates');
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
        const fullName = row["Full Name"] || row["fullName"] || row["Name"];
        const fatherName = row["Father Name"] || row["fatherName"] || row["Father"];
        
        if (fullName && fatherName) {
          const newGraduate: Student = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            fullName: fullName,
            fatherName: fatherName,
            bForm: row["B-Form"] || row["bForm"] || '',
            fatherCnic: row["Father CNIC"] || row["fatherCnic"] || '',
            contactNumber: row["Contact"] || row["contactNumber"] || '',
            address: row["Address"] || row["address"] || '',
            track: (row["Track"] === 'Hifz' || row["Track"] === 'Dars-e-Nizami') ? row["Track"] : AcademicTrack.DARS_E_NIZAMI,
            className: 'Graduated',
            status: StudentStatus.GRADUATED,
            graduationDate: row["Graduation Date"] || new Date().toISOString().split('T')[0],
            certificateStatus: row["Certificate Status"] || CertificateStatus.RECEIVED,
            photoUrl: '',
            alumniPhotoUrl: ''
          };
          addStudent(newGraduate);
          addedCount++;
        }
      });
      alert(`Successfully imported ${addedCount} graduates.`);
    } catch (error) {
      alert("Error importing file. Please ensure it is a valid Excel file.");
      console.error(error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-700 font-serif flex items-center gap-2">
            <GraduationCap className="w-7 h-7" /> Past Graduates
          </h2>
          <p className="text-slate-500">Manage graduates, certificates, and academic records.</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-600 text-white px-6 py-2.5 rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Past Graduate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-amber-800 text-sm font-medium">Total Graduates</p>
          <p className="text-3xl font-bold text-amber-900">{alumni.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Hifz Scholars</p>
          <p className="text-2xl font-bold text-slate-700">{alumni.filter(s => s.track === AcademicTrack.HIFZ).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Aalim / Aalimah</p>
          <p className="text-2xl font-bold text-slate-700">{alumni.filter(s => s.track === AcademicTrack.DARS_E_NIZAMI).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search graduates by name or father's name..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlumni.length === 0 ? (
          <div className="col-span-2 text-center p-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No graduates found matching your criteria.</p>
            <p className="text-sm mt-1">Graduate students from the Student Directory or click Add Past Graduate.</p>
          </div>
        ) : (
          filteredAlumni.map(student => (
            <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden hover:shadow-md transition-all relative group">
              {/* Hifz Verified Badge */}
              {student.track === AcademicTrack.HIFZ && student.hifzCompletionVerified && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                  Hifz Verified
                </div>
              )}

               {/* Always Visible Actions */}
               <div className="absolute top-4 right-4 z-20 flex gap-2">
                 {student.contactNumber && (
                   <a 
                     href={`https://wa.me/${student.contactNumber}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     className="p-1.5 bg-[#25D366]/90 hover:bg-[#25D366] text-white rounded-lg shadow-sm transition-colors"
                     title="Chat on WhatsApp"
                   >
                     <MessageCircle className="w-4 h-4" />
                   </a>
                 )}
                 <button 
                    onClick={(e) => {e.stopPropagation(); handleDelete(student.id);}}
                    className="p-1.5 bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 backdrop-blur-sm shadow-sm"
                    title="Remove Graduate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
              
              <div className="p-5 flex items-start gap-4">
                 <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                    {student.alumniPhotoUrl || student.photoUrl ? (
                      <img src={student.alumniPhotoUrl || student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-amber-300" />
                    )}
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-slate-800 text-lg leading-tight">{student.fullName}</h3>
                       <p className="text-sm text-slate-500 font-medium mt-1">{student.track} Graduate</p>
                     </div>
                   </div>

                   <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${getCertificateBadgeColor(student.certificateStatus)}`}>
                          Sanad: {student.certificateStatus || 'No Status'}
                       </span>
                   </div>
                   
                   <div className="mt-3 space-y-1 text-sm text-slate-600">
                     <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-amber-500" />
                       <span>Graduated: {student.graduationDate || 'Date Not Set'}</span>
                     </div>
                     {student.track === AcademicTrack.DARS_E_NIZAMI && (
                       <div className="flex items-center gap-2">
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                         <span>Levels: {student.completedLevels?.length || 0} / 9 Completed</span>
                       </div>
                     )}
                   </div>

                   <button 
                    onClick={() => openEditModal(student)}
                    className="mt-4 w-full py-2 border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                   >
                     View & Edit Details
                   </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Alumni Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-amber-800 text-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-amber-700 p-2 rounded-lg"><Plus className="w-5 h-5 text-amber-100" /></div>
                <h3 className="text-xl font-bold font-serif">Add Past Graduate</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-6 h-6 text-amber-200 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleAddAlumni} className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
               
              {/* Section: Pictures */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
                  <Camera className="w-4 h-4" /> Graduate Picture
                </h4>
                <div className="flex justify-center">
                  <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 border-2 border-dashed border-amber-200 flex items-center justify-center group-hover:border-amber-500 transition-colors shadow-sm">
                      {newAlumniData.photoUrl ? (
                        <img src={newAlumniData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-500">
                          <Upload className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-medium uppercase">Upload</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Personal Details */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
                  <BadgeCheck className="w-4 h-4" /> Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input required className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                      placeholder="e.g. Muhammad Ahmed" 
                      value={newAlumniData.fullName || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, fullName: e.target.value})} 
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">B-Form Number</label>
                     <input required className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                      placeholder="e.g. 35202-1234567-1" 
                      value={newAlumniData.bForm || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, bForm: e.target.value})} 
                     />
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Completed Track</label>
                     <select 
                      className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      value={newAlumniData.track}
                      onChange={e => setNewAlumniData({...newAlumniData, track: e.target.value as AcademicTrack})}
                     >
                       <option value={AcademicTrack.HIFZ}>{AcademicTrack.HIFZ}</option>
                       <option value={AcademicTrack.DARS_E_NIZAMI}>{AcademicTrack.DARS_E_NIZAMI}</option>
                     </select>
                  </div>
                </div>
              </div>

              {/* Section: Guardian & Contact */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
                  <FileText className="w-4 h-4" /> Guardian & Contact Info
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label>
                    <input required className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                      placeholder="Guardian Name" 
                      value={newAlumniData.fatherName || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, fatherName: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's CNIC</label>
                    <input required className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                      placeholder="35202-1234567-9" 
                      value={newAlumniData.fatherCnic || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, fatherCnic: e.target.value})} 
                    />
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                     <input required type="tel" className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" 
                      placeholder="0300-1234567" 
                      value={newAlumniData.contactNumber || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, contactNumber: e.target.value})} 
                     />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residential Address</label>
                    <textarea required rows={2} className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" 
                      placeholder="Complete home address..." 
                      value={newAlumniData.address || ''} 
                      onChange={e => setNewAlumniData({...newAlumniData, address: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Section: Graduation Details */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
                  <GraduationCap className="w-4 h-4" /> Graduation & Asnad
                </h4>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Graduation</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        required 
                        className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        value={newAlumniData.graduationDate || ''}
                        onChange={e => setNewAlumniData({...newAlumniData, graduationDate: e.target.value})}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  {newAlumniData.track === AcademicTrack.DARS_E_NIZAMI && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asnad / Certificate Details</label>
                       <textarea 
                         rows={3}
                         className="w-full px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none" 
                         placeholder="Enter grades, marks obtained, issuing body, or other notes..." 
                         value={newAlumniData.certificateDetails || ''} 
                         onChange={e => setNewAlumniData({...newAlumniData, certificateDetails: e.target.value})} 
                       />
                     </div>
                  )}
                </div>
              </div>

              {/* Dars-e-Nizami Tracker (Academic Progress) - NEW ADDITION */}
              {newAlumniData.track === AcademicTrack.DARS_E_NIZAMI && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <FileBadge className="w-5 h-5 text-amber-600" /> Completed Classes Tracker
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {DARS_E_NIZAMI_CLASSES.map((level) => {
                       const isCompleted = newAlumniData.completedLevels?.includes(level);
                       return (
                         <div 
                           key={level}
                           onClick={() => toggleNewAlumniLevelCompletion(level)}
                           className={`
                             flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all select-none
                             ${isCompleted ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50'}
                           `}
                         >
                           <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-800' : 'text-slate-600'}`}>
                             {level}
                           </span>
                           <div className={`
                             w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                             ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}
                           `}>
                             {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Add Past Graduate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-200 scale-100">
            <div className="p-6 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                   <GraduationCap className="w-6 h-6 text-amber-100" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold font-serif">Graduate Records</h3>
                   <p className="text-xs text-amber-200">Update details for {selectedStudent.fullName}</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-amber-200 hover:text-white transition-colors" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Basic Graduation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Graduation Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all" 
                    value={selectedStudent.graduationDate || ''} 
                    onChange={e => setSelectedStudent({...selectedStudent, graduationDate: e.target.value})} 
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Sanad / Certificate Status</label>
                   <select 
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    value={selectedStudent.certificateStatus || CertificateStatus.NOT_ISSUED}
                    onChange={e => setSelectedStudent({...selectedStudent, certificateStatus: e.target.value as CertificateStatus})}
                   >
                     <option value={CertificateStatus.NOT_ISSUED}>{CertificateStatus.NOT_ISSUED}</option>
                     <option value={CertificateStatus.PENDING}>{CertificateStatus.PENDING}</option>
                     <option value={CertificateStatus.RECEIVED}>{CertificateStatus.RECEIVED}</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Graduation Photo URL</label>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                         {selectedStudent.alumniPhotoUrl ? <img src={selectedStudent.alumniPhotoUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-300" />}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Paste URL or leave blank to use profile photo"
                        className="flex-1 p-2.5 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                        value={selectedStudent.alumniPhotoUrl || ''}
                        onChange={e => setSelectedStudent({...selectedStudent, alumniPhotoUrl: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              {/* Dars-e-Nizami Tracker (Academic Progress) */}
              {selectedStudent.track === AcademicTrack.DARS_E_NIZAMI && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <FileBadge className="w-5 h-5 text-amber-600" /> Class Completion Tracker
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {DARS_E_NIZAMI_CLASSES.map((level) => {
                       const isCompleted = selectedStudent.completedLevels?.includes(level);
                       return (
                         <div 
                           key={level}
                           onClick={() => toggleLevelCompletion(level)}
                           className={`
                             flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all select-none
                             ${isCompleted ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50'}
                           `}
                         >
                           <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-800' : 'text-slate-600'}`}>
                             {level}
                           </span>
                           <div className={`
                             w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                             ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}
                           `}>
                             {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              )}

              {/* Hifz Tracker (Academic Progress) */}
              {selectedStudent.track === AcademicTrack.HIFZ && (
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <CheckCircle className="w-5 h-5 text-amber-600" /> Hifz Verification
                   </h4>
                   
                   <div className="bg-white p-4 rounded-lg border border-slate-200">
                     <label className="flex items-center gap-4 cursor-pointer">
                       <div className="relative flex items-center">
                         <input 
                           type="checkbox" 
                           className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                           checked={selectedStudent.hifzCompletionVerified || false}
                           onChange={(e) => setSelectedStudent({...selectedStudent, hifzCompletionVerified: e.target.checked})}
                         />
                       </div>
                       <div>
                         <span className="font-bold text-slate-700 block">Full Quran Memorization Verified</span>
                         <span className="text-xs text-slate-500">Check this to confirm the student has successfully recited the entire Quran to the instructor.</span>
                       </div>
                     </label>
                   </div>
                 </div>
              )}

              {/* NEW: Asnad-Related Information (Below Academic Progress) */}
              {selectedStudent.track === AcademicTrack.DARS_E_NIZAMI && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                     <ScrollText className="w-5 h-5 text-amber-600" /> Asnad / Certificate Information
                   </h4>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Additional Notes</label>
                      <textarea 
                        className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                        rows={3}
                        placeholder="Enter detailed notes about the certificate, grades, or issuing body..."
                        value={selectedStudent.certificateDetails || ''}
                        onChange={e => setSelectedStudent({...selectedStudent, certificateDetails: e.target.value})}
                      />
                   </div>
                </div>
              )}

              {/* Personal Information (Moved Below Academic Progress) */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-200 pb-2">
                     <BadgeCheck className="w-5 h-5 text-amber-600" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" value={selectedStudent.fullName} onChange={e => setSelectedStudent({...selectedStudent, fullName: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">B-Form</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" value={selectedStudent.bForm} onChange={e => setSelectedStudent({...selectedStudent, bForm: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" value={selectedStudent.fatherName} onChange={e => setSelectedStudent({...selectedStudent, fatherName: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact No</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" value={selectedStudent.contactNumber} onChange={e => setSelectedStudent({...selectedStudent, contactNumber: e.target.value})} />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" value={selectedStudent.address} onChange={e => setSelectedStudent({...selectedStudent, address: e.target.value})} />
                     </div>
                  </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniList;
