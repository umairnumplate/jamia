
import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Check, X, User, Phone, MapPin, Upload, Camera, FileText, BadgeCheck } from 'lucide-react';
import { Registration, ApplicationStatus, AcademicTrack, HIFZ_LEVELS, DARS_E_NIZAMI_CLASSES } from '../types';

interface RegistrationListProps {
  registrations: Registration[];
  addRegistration: (registration: Registration) => void;
  approveRegistration: (id: string) => void;
  rejectRegistration: (id: string) => void;
}

const RegistrationList: React.FC<RegistrationListProps> = ({ registrations, addRegistration, approveRegistration, rejectRegistration }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Registration>>({
    track: AcademicTrack.HIFZ,
    status: ApplicationStatus.PENDING,
    className: HIFZ_LEVELS[0],
    photoUrl: ''
  });

  const filteredRegistrations = registrations.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = r.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.fatherName) {
      addRegistration({
        ...formData,
        id: Date.now().toString(),
        applicationDate: new Date().toISOString().split('T')[0],
      } as Registration);
      setIsModalOpen(false);
      setFormData({ track: AcademicTrack.HIFZ, status: ApplicationStatus.PENDING, className: HIFZ_LEVELS[0], photoUrl: '' });
    }
  };
  
  const getStatusChip = (status: ApplicationStatus) => {
    switch(status) {
      case ApplicationStatus.PENDING: return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400";
      case ApplicationStatus.APPROVED: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400";
      case ApplicationStatus.REJECTED: return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-cyan-600" /> Student Registrations
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Review and manage new student applications.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" /> Add Application
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search by name..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegistrations.map(reg => (
          <div key={reg.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                    {reg.photoUrl ? <img src={reg.photoUrl} alt={reg.fullName} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{reg.fullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{reg.className}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusChip(reg.status)}`}>{reg.status}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>Father: {reg.fatherName}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{reg.contactNumber}</span></div>
                <div className="flex items-center gap-2 truncate"><MapPin className="w-4 h-4 text-slate-400" /><span className="truncate">{reg.address}</span></div>
              </div>
            </div>
            {reg.status === ApplicationStatus.PENDING && (
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-end items-center gap-3">
                <button onClick={() => rejectRegistration(reg.id)} className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"><X className="w-4 h-4" /> Reject</button>
                <button onClick={() => approveRegistration(reg.id)} className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"><Check className="w-4 h-4" /> Approve & Admit</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 bg-cyan-800 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif">New Student Application</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-cyan-200 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-cyan-200 flex items-center justify-center group-hover:border-cyan-500 transition-colors shadow-sm">
                    {formData.photoUrl ? <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-400 group-hover:text-cyan-500"><Upload className="w-8 h-8 mb-1" /><span className="text-[10px] font-medium uppercase">Upload</span></div>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-cyan-100 dark:border-slate-700 pb-2"><BadgeCheck className="w-4 h-4" /> Applicant Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">B-Form Number</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.bForm || ''} onChange={e => setFormData({...formData, bForm: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Track</label><select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.track} onChange={e => {const nt=e.target.value as AcademicTrack; setFormData({...formData, track: nt, className: nt === AcademicTrack.HIFZ ? HIFZ_LEVELS[0] : DARS_E_NIZAMI_CLASSES[0]})}}><option value={AcademicTrack.HIFZ}>Hifz</option><option value={AcademicTrack.DARS_E_NIZAMI}>Dars-e-Nizami</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class / Level</label><select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})}>{formData.track===AcademicTrack.HIFZ ? HIFZ_LEVELS.map(c=><option key={c} value={c}>{c}</option>) : DARS_E_NIZAMI_CLASSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-cyan-100 dark:border-slate-700 pb-2"><FileText className="w-4 h-4" /> Guardian & Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's CNIC</label><input required className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.fatherCnic || ''} onChange={e => setFormData({...formData, fatherCnic: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label><input required type="tel" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label><textarea required rows={2} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700"><button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium shadow-lg shadow-cyan-600/20 flex items-center gap-2"><Check className="w-4 h-4" /> Submit Application</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationList;
