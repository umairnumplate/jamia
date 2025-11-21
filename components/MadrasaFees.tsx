
import React, { useState } from 'react';
import { Search, Plus, Banknote, Calendar, Filter, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { MadrasaFeeRecord, Student, DARS_E_NIZAMI_CLASSES, HIFZ_LEVELS } from '../types';

interface MadrasaFeesProps {
  students: Student[];
  feeRecords: MadrasaFeeRecord[];
  addFeeRecord: (record: MadrasaFeeRecord) => void;
  deleteFeeRecord: (id: string) => void;
  updateFeeRecord: (record: MadrasaFeeRecord) => void;
}

const MadrasaFees: React.FC<MadrasaFeesProps> = ({ students, feeRecords, addFeeRecord, deleteFeeRecord, updateFeeRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [newFee, setNewFee] = useState<Partial<MadrasaFeeRecord>>({ month: new Date().toISOString().slice(0, 7), amount: 0, status: 'Pending', studentId: '' });

  const filteredRecords = feeRecords.filter(r => r.month === filterMonth && (filterClass === 'All' || r.className === filterClass) && (filterStatus === 'All' || r.status === filterStatus) && r.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFee.studentId && newFee.amount) {
      const student = students.find(s => s.id === newFee.studentId);
      if (student) {
        addFeeRecord({ id: Date.now().toString(), studentId: student.id, studentName: student.fullName, className: student.className, month: newFee.month!, amount: newFee.amount!, status: newFee.status as 'Paid' | 'Pending', receiptNumber: newFee.receiptNumber, paymentDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(false);
        setNewFee({ month: new Date().toISOString().slice(0, 7), amount: 0, status: 'Pending', studentId: '' });
      }
    }
  };

  const handleStatusToggle = (record: MadrasaFeeRecord) => {
    updateFeeRecord({ ...record, status: record.status === 'Paid' ? 'Pending' : 'Paid' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif flex items-center gap-2"><Banknote className="w-7 h-7 text-emerald-600" /> Madrasa Fees</h2><p className="text-slate-500 dark:text-slate-400">Track monthly fees and payment history.</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-medium"><Plus className="w-5 h-5" /> Add Fee Record</button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
         <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Fee Month</label><input type="month" className="w-full p-2 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 font-medium" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} /></div>
         <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Class</label><select className="w-full p-2 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" value={filterClass} onChange={e => setFilterClass(e.target.value)}><option value="All">All Classes</option>{[...HIFZ_LEVELS, ...DARS_E_NIZAMI_CLASSES].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
         <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label><select className="w-full p-2 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="All">All</option><option value="Paid">Paid</option><option value="Pending">Pending</option></select></div>
         <div className="relative"><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Search</label><div className="relative"><input type="text" placeholder="Name..." className="w-full pl-9 p-2 border dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredRecords.length === 0 ? <div className="col-span-3 text-center p-12 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"><Banknote className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>No fee records found.</p></div> : filteredRecords.map(r => (<div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col group relative hover:shadow-md"><div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => deleteFeeRecord(r.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div><div className="flex items-start justify-between mb-4"><div><h3 className="font-bold text-slate-800 dark:text-slate-100">{r.studentName}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{r.className}</p></div><div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>{r.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}{r.status}</div></div><div className="flex-1 space-y-2"><div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Amount</span><span className="font-bold text-slate-800 dark:text-slate-100">Rs. {r.amount}</span></div><div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Month</span><span className="text-slate-800 dark:text-slate-200">{r.month}</span></div>{r.receiptNumber && <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Receipt #</span><span className="text-slate-800 dark:text-slate-200 font-mono bg-slate-50 dark:bg-slate-700 px-1 rounded">{r.receiptNumber}</span></div>}</div><div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700"><button onClick={() => handleStatusToggle(r)} className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${r.status === 'Paid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{r.status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}</button></div></div>))}</div>
      {isModalOpen && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg"><div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Record Fee</h3><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Student</label><select required className="w-full p-2.5 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" value={newFee.studentId} onChange={e => setNewFee({...newFee, studentId: e.target.value})}><option value="">-- Choose Student --</option>{students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.className})</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Fee Month</label><input type="month" required className="w-full p-2.5 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={newFee.month} onChange={e => setNewFee({...newFee, month: e.target.value})} /></div><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Amount</label><input type="number" required className="w-full p-2.5 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={newFee.amount} onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Status</label><select className="w-full p-2.5 border dark:border-slate-600 rounded-lg dark:bg-slate-700" value={newFee.status} onChange={e => setNewFee({...newFee, status: e.target.value as 'Paid' | 'Pending'})}><option value="Paid">Paid</option><option value="Pending">Pending</option></select></div><div><label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Receipt No</label><input type="text" className="w-full p-2.5 border dark:border-slate-600 rounded-lg dark:bg-slate-700" placeholder="Optional" value={newFee.receiptNumber || ''} onChange={e => setNewFee({...newFee, receiptNumber: e.target.value})} /></div></div><button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 mt-4">Save</button></form></div></div>}
    </div>
  );
};

export default MadrasaFees;
