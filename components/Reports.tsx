
import React, { useState } from 'react';
import { Search, FileText, Share2, Sparkles, Loader2 } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { generateStudentReport } from '../services/geminiService';

interface ReportsProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

const Reports: React.FC<ReportsProps> = ({ students, attendanceRecords }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [reportText, setReportText] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  
  const handleGenerate = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    const studentAttendance = attendanceRecords.filter(r => r.studentId === selectedStudent.id);
    const text = await generateStudentReport(selectedStudent, studentAttendance, teacherNotes);
    setReportText(text);
    setIsGenerating(false);
  };

  const shareViaWhatsApp = () => {
    if (!selectedStudent || !reportText) return;
    const encodedText = encodeURIComponent(reportText);
    const whatsappUrl = `https://wa.me/${selectedStudent.contactNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif">Performance Reports</h2>
        <p className="text-slate-500 dark:text-slate-400">Generate and share student progress reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Select Student</label>
          <div className="relative mb-4">
             <select 
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg appearance-none"
              value={selectedStudentId}
              onChange={e => { setSelectedStudentId(e.target.value); setReportText(''); }}
             >
               <option value="">-- Choose Student --</option>
               {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.className})</option>)}
             </select>
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {selectedStudent && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300">{selectedStudent.fullName}</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{selectedStudent.className}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Track: {selectedStudent.track}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Teacher's Remarks (Optional)</label>
                <textarea 
                  className="w-full p-3 border dark:border-slate-600 rounded-lg h-24 text-sm bg-slate-50 dark:bg-slate-700"
                  placeholder="e.g., Excellent improvement in Hifz..."
                  value={teacherNotes}
                  onChange={e => setTeacherNotes(e.target.value)}
                />
              </div>
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate AI Report
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><FileText className="w-5 h-5" /> Report Preview</h3>
            {reportText && !isGenerating && (
              <button onClick={shareViaWhatsApp} className="bg-[#25D366] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-500/20">
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </button>
            )}
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 overflow-y-auto">
             {isGenerating ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                 <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                 <p>AI is analyzing attendance and writing the report...</p>
               </div>
             ) : reportText ? (
               <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-relaxed">{reportText}</div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                 <FileText className="w-12 h-12 mb-2 opacity-20" />
                 <p>Select a student and click generate to see the draft.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
