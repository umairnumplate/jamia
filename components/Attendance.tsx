
import React, { useState, useMemo, useRef } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Save, Users, ChevronLeft, ChevronRight, CalendarDays, ListChecks, BarChart3, Ban, FileSpreadsheet, Upload } from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, DARS_E_NIZAMI_CLASSES, HIFZ_LEVELS, StudentStatus, AcademicTrack } from '../types';
import { exportToExcel, readExcelFile } from '../utils/excel';

interface AttendanceProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  saveAttendance: (records: AttendanceRecord[]) => void;
  deleteAttendance: (id: string) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ students, attendanceRecords, saveAttendance, deleteAttendance }) => {
  // Shared State
  const [viewMode, setViewMode] = useState<'daily' | 'calendar'>('daily');
  const [selectedClass, setSelectedClass] = useState(HIFZ_LEVELS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Daily View State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentChanges, setCurrentChanges] = useState<Record<string, AttendanceStatus>>({});

  // Calendar View State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarStudentId, setCalendarStudentId] = useState<string>(''); // '' implies Class Overview

  // --- Derived Data ---

  // Active students in the selected class or track
  const classStudents = useMemo(() => 
    students.filter(s => {
      if (s.status !== StudentStatus.ACTIVE) return false;

      // Handle "All Track" selections
      if (selectedClass === 'All Hifz') {
        return s.track === AcademicTrack.HIFZ;
      }
      if (selectedClass === 'All Dars-e-Nizami') {
        return s.track === AcademicTrack.DARS_E_NIZAMI;
      }

      // Handle specific class selection
      return s.className === selectedClass;
    }),
    [students, selectedClass]
  );

  // --- Daily View Logic ---

  const getStatus = (studentId: string) => {
    if (currentChanges[studentId]) return currentChanges[studentId];
    const record = attendanceRecords.find(r => r.studentId === studentId && r.date === selectedDate);
    return record ? record.status : null; 
  };

  const handleMark = (studentId: string, status: AttendanceStatus) => {
    setCurrentChanges(prev => ({ ...prev, [studentId]: status }));
  };
  
  const handleClear = (studentId: string) => {
    // Remove from current local changes if exists
    if (currentChanges[studentId]) {
      const newChanges = { ...currentChanges };
      delete newChanges[studentId];
      setCurrentChanges(newChanges);
    }
    
    // Remove from saved records if exists
    const recordId = `${selectedDate}-${studentId}`;
    deleteAttendance(recordId);
  };

  const handleBulkMark = (status: AttendanceStatus) => {
    const changes: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => {
      changes[s.id] = status;
    });
    setCurrentChanges(prev => ({ ...prev, ...changes }));
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = Object.keys(currentChanges).map(studentId => ({
      id: `${selectedDate}-${studentId}`,
      studentId,
      date: selectedDate,
      status: currentChanges[studentId]
    }));
    
    saveAttendance(newRecords);
    setCurrentChanges({});
    alert("Attendance Saved Locally (Will sync when online)");
  };

  // Stats for Daily View
  const dailyStats = useMemo(() => {
    const s = { total: classStudents.length, present: 0, absent: 0, leave: 0 };
    classStudents.forEach(student => {
      const status = getStatus(student.id);
      if (status === AttendanceStatus.PRESENT) s.present++;
      else if (status === AttendanceStatus.ABSENT) s.absent++;
      else if (status === AttendanceStatus.LEAVE) s.leave++;
    });
    return s;
  }, [classStudents, currentChanges, attendanceRecords, selectedDate]);


  // --- Calendar View Logic ---

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (increment: number) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100 rounded-lg opacity-50"></div>);
    }

    // Active Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      let content = null;
      let cardClass = "bg-white border-slate-200 hover:border-emerald-200";

      if (calendarStudentId) {
        // --- INDIVIDUAL STUDENT MODE ---
        const record = attendanceRecords.find(r => r.studentId === calendarStudentId && r.date === dateStr);
        if (record?.status === AttendanceStatus.PRESENT) {
          cardClass = 'bg-emerald-50 border-emerald-200';
          content = (
            <>
              <div className="self-end"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 self-end">Present</span>
            </>
          );
        } else if (record?.status === AttendanceStatus.ABSENT) {
          cardClass = 'bg-red-50 border-red-200';
          content = (
             <>
              <div className="self-end"><XCircle className="w-5 h-5 text-red-600" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 self-end">Absent</span>
            </>
          );
        } else if (record?.status === AttendanceStatus.LEAVE) {
          cardClass = 'bg-amber-50 border-amber-200';
          content = (
             <>
              <div className="self-end"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 self-end">Leave</span>
            </>
          );
        }
      } else {
        // --- CLASS AGGREGATE MODE ---
        const totalStudents = classStudents.length;
        if (totalStudents > 0) {
          const recordsForDay = attendanceRecords.filter(r => r.date === dateStr && classStudents.some(s => s.id === r.studentId));
          const presentCount = recordsForDay.filter(r => r.status === AttendanceStatus.PRESENT).length;
          const absentCount = recordsForDay.filter(r => r.status === AttendanceStatus.ABSENT).length;
          const leaveCount = recordsForDay.filter(r => r.status === AttendanceStatus.LEAVE).length;
          const recordedCount = presentCount + absentCount + leaveCount;

          if (recordedCount > 0) {
            const percentage = Math.round((presentCount / totalStudents) * 100);
            
            // Color coding based on percentage
            if (percentage >= 90) cardClass = 'bg-emerald-50 border-emerald-200';
            else if (percentage >= 75) cardClass = 'bg-yellow-50 border-yellow-200';
            else cardClass = 'bg-red-50 border-red-200';

            content = (
              <div className="flex flex-col items-end justify-end h-full gap-1">
                 <div className="text-2xl font-bold text-slate-700">{percentage}%</div>
                 <div className="flex gap-1 text-[10px]">
                    <span className="text-emerald-600 font-bold" title="Present">{presentCount}P</span>
                    <span className="text-red-500 font-bold" title="Absent">{absentCount}A</span>
                 </div>
              </div>
            );
          } else {
            // No records for this day
            cardClass = 'bg-slate-50 border-slate-100 opacity-70';
          }
        }
      }

      days.push(
        <div key={day} className={`h-24 p-2 rounded-lg border transition-all flex flex-col justify-between ${cardClass}`}>
          <span className="text-sm font-bold text-slate-400">{day}</span>
          {content}
        </div>
      );
    }

    return days;
  };

  // Excel Handlers
  const handleExport = () => {
    // Enhance export with student names
    const exportData = attendanceRecords.map(r => {
      const s = students.find(st => st.id === r.studentId);
      return {
        Date: r.date,
        StudentName: s?.fullName || 'Unknown',
        Status: r.status,
        Class: s?.className || 'Unknown'
      };
    });
    exportToExcel(exportData, 'Attendance_Records');
  };

  const handleImportTrigger = () => {
     fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     try {
       const jsonData = await readExcelFile(file);
       const newRecords: AttendanceRecord[] = [];

       jsonData.forEach((row: any) => {
          const name = row["StudentName"] || row["studentName"];
          const date = row["Date"] || row["date"];
          const status = row["Status"] || row["status"];
          
          if (name && date && status) {
             // Try to find student by name (fuzzy)
             const student = students.find(s => s.fullName.toLowerCase() === name.toLowerCase());
             if (student) {
                newRecords.push({
                   id: `${date}-${student.id}`,
                   studentId: student.id,
                   date: date,
                   status: status as AttendanceStatus
                });
             }
          }
       });
       
       if (newRecords.length > 0) {
         saveAttendance(newRecords);
         alert(`Imported ${newRecords.length} attendance records.`);
       } else {
         alert("No valid records found. Ensure columns are Date, StudentName, Status");
       }

     } catch (error) {
       alert("Error importing attendance.");
       console.error(error);
     }
     if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-800 font-serif flex items-center gap-2">
             <Calendar className="w-6 h-6 text-emerald-600" /> Attendance
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track daily presence or view monthly analytics.</p>
          
          {/* Unified Class Selector */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Class Group</label>
            <select 
              className="w-full md:min-w-[250px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setCalendarStudentId(''); // Reset student view when class changes
                setCurrentChanges({});
              }}
            >
              <optgroup label="Hifz Track">
                <option value="All Hifz">All Hifz Students</option>
                {HIFZ_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Dars-e-Nizami Track">
                <option value="All Dars-e-Nizami">All Dars-e-Nizami Students</option>
                {DARS_E_NIZAMI_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
        
        {/* View Toggle & Actions */}
        <div className="flex flex-col items-end gap-2">
             <div className="flex gap-2 mb-2">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleImportFile}
               />
               <button 
                  onClick={handleImportTrigger}
                  className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
               >
                  <Upload className="w-3.5 h-3.5" /> Import
               </button>
               <button 
                  onClick={handleExport}
                  className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
               >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export
               </button>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
              <button 
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'daily' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListChecks className="w-4 h-4" /> Daily Entry
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart3 className="w-4 h-4" /> Calendar & Stats
              </button>
            </div>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Date Selector */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-700">Entry Date:</span>
             </div>
             <input 
                type="date" 
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-700">{dailyStats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Present</p>
                <p className="text-2xl font-bold text-emerald-700">{dailyStats.present}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase mb-1">Absent</p>
                <p className="text-2xl font-bold text-red-700">{dailyStats.absent}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">On Leave</p>
                <p className="text-2xl font-bold text-amber-700">{dailyStats.leave}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>

          {/* Student Table with Bulk Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
               <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <Users className="w-4 h-4" /> Student List ({classStudents.length})
               </h3>
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleBulkMark(AttendanceStatus.PRESENT)}
                   className="text-xs bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1.5"
                 >
                   <CheckCircle className="w-3.5 h-3.5" /> Mark All Present
                 </button>
                 <button 
                   onClick={() => handleBulkMark(AttendanceStatus.ABSENT)}
                   className="text-xs bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center gap-1.5"
                 >
                   <XCircle className="w-3.5 h-3.5" /> Mark All Absent
                 </button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4 text-center w-20">Present</th>
                    <th className="px-6 py-4 text-center w-20">Absent</th>
                    <th className="px-6 py-4 text-center w-20">Leave</th>
                    <th className="px-6 py-4 text-center w-16">Clear</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No active students found in this selection.</td></tr>
                  ) : (
                    classStudents.map(student => {
                      const status = getStatus(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-700">{student.fullName}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">{student.className}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleMark(student.id, AttendanceStatus.PRESENT)}
                              className={`p-2 rounded-full transition-all ${status === AttendanceStatus.PRESENT ? 'bg-emerald-500 text-white shadow-md scale-110' : 'text-slate-300 hover:bg-emerald-50 hover:text-emerald-500'}`}
                            >
                              <CheckCircle className="w-6 h-6" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleMark(student.id, AttendanceStatus.ABSENT)}
                              className={`p-2 rounded-full transition-all ${status === AttendanceStatus.ABSENT ? 'bg-red-500 text-white shadow-md scale-110' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'}`}
                            >
                              <XCircle className="w-6 h-6" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleMark(student.id, AttendanceStatus.LEAVE)}
                              className={`p-2 rounded-full transition-all ${status === AttendanceStatus.LEAVE ? 'bg-amber-500 text-white shadow-md scale-110' : 'text-slate-300 hover:bg-amber-50 hover:text-amber-500'}`}
                            >
                              <Clock className="w-6 h-6" />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <button 
                              onClick={() => handleClear(student.id)}
                              className="p-2 rounded-full text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-all"
                              title="Clear Status"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating Save Button */}
          {Object.keys(currentChanges).length > 0 && (
            <div className="fixed bottom-6 right-6 animate-in fade-in slide-in-from-bottom-4 z-20">
              <button 
                onClick={handleSave}
                className="bg-emerald-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center gap-3 font-bold text-lg hover:scale-105 transition-transform active:scale-95 ring-4 ring-white"
              >
                <Save className="w-6 h-6" /> Save Attendance
              </button>
            </div>
          )}
        </div>
      ) : (
        // --- CALENDAR VIEW CONTENT ---
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {/* Calendar Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <h3 className="text-lg font-bold text-slate-800 min-w-[160px] text-center font-serif">
                    {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
               </div>

               <div className="w-full md:w-72">
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Filter by Student (Optional)</label>
                 <div className="relative">
                   <select 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      value={calendarStudentId}
                      onChange={e => setCalendarStudentId(e.target.value)}
                   >
                     <option value="">Show {selectedClass} Overview</option>
                     {classStudents.map(s => (
                       <option key={s.id} value={s.id}>{s.fullName}</option>
                     ))}
                   </select>
                   <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                 </div>
               </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {renderCalendar()}
            </div>

            {/* Calendar Legend */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Legend</h4>
              {calendarStudentId ? (
                <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Present</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Absent</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Leave</div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200"></div> High Attendance (90%+)</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div> Moderate (75-89%)</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div> Low (&lt;75%)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
