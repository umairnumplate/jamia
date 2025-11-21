
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import TeacherList from './components/TeacherList';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import AlumniList from './components/AlumniList';
import TanzimModule from './components/TanzimModule';
import MadrasaFees from './components/MadrasaFees';
import { Student, Teacher, AttendanceRecord, Announcement, AcademicTrack, StudentStatus, TanzimRecord, MadrasaFeeRecord } from './types';

// Helper to mock initial data if local storage is empty
const INITIAL_STUDENTS: Student[] = [
  { 
    id: '1', 
    fullName: 'Ahmed Ali', 
    bForm: '12345-1234567-1', 
    fatherName: 'Ali Raza', 
    fatherCnic: '345', 
    address: 'Lahore', 
    contactNumber: '923001234567', 
    track: AcademicTrack.HIFZ, 
    className: 'Hifz Ibtidai', 
    status: StudentStatus.ACTIVE 
  },
];

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Data State (Persisted in LocalStorage)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [tanzimRecords, setTanzimRecords] = useState<TanzimRecord[]>(() => {
    const saved = localStorage.getItem('tanzimRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [madrasaFeeRecords, setMadrasaFeeRecords] = useState<MadrasaFeeRecord[]>(() => {
    const saved = localStorage.getItem('madrasaFeeRecords');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('attendance', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('tanzimRecords', JSON.stringify(tanzimRecords)); }, [tanzimRecords]);
  useEffect(() => { localStorage.setItem('madrasaFeeRecords', JSON.stringify(madrasaFeeRecords)); }, [madrasaFeeRecords]);

  // Actions
  const addStudent = (s: Student) => setStudents(prev => [...prev, s]);
  
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addTeacher = (t: Teacher) => setTeachers(prev => [...prev, t]);
  
  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const saveAttendance = (newRecords: AttendanceRecord[]) => {
    // Remove old records for same day/student if exists, then add new
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => !newRecords.some(nr => nr.studentId === r.studentId && nr.date === r.date));
      return [...filtered, ...newRecords];
    });
  };

  const deleteAttendance = (id: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
  };
  
  const addAnnouncement = (a: Announcement) => setAnnouncements(prev => [a, ...prev]);
  const deleteAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  // Tanzim Actions
  const addTanzimRecord = (r: TanzimRecord) => setTanzimRecords(prev => [...prev, r]);
  const updateTanzimRecord = (r: TanzimRecord) => setTanzimRecords(prev => prev.map(rec => rec.id === r.id ? r : rec));
  const deleteTanzimRecord = (id: string) => setTanzimRecords(prev => prev.filter(r => r.id !== id));

  // Fee Actions
  const addFeeRecord = (r: MadrasaFeeRecord) => setMadrasaFeeRecords(prev => [...prev, r]);
  const updateFeeRecord = (r: MadrasaFeeRecord) => setMadrasaFeeRecords(prev => prev.map(rec => rec.id === r.id ? r : rec));
  const deleteFeeRecord = (id: string) => setMadrasaFeeRecords(prev => prev.filter(r => r.id !== id));

  // Render Content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          students={students} 
          teachers={teachers} 
          announcements={announcements}
          tanzimRecords={tanzimRecords}
          madrasaFeeRecords={madrasaFeeRecords}
          attendanceRecords={attendanceRecords}
          addAnnouncement={addAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
        />;
      case 'students':
        return <StudentList 
          students={students} 
          addStudent={addStudent} 
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
        />;
      case 'teachers':
        return <TeacherList 
          teachers={teachers} 
          addTeacher={addTeacher} 
          updateTeacher={updateTeacher}
          deleteTeacher={deleteTeacher}
        />;
      case 'attendance':
        return <Attendance 
          students={students} 
          attendanceRecords={attendanceRecords} 
          saveAttendance={saveAttendance}
          deleteAttendance={deleteAttendance}
        />;
      case 'madrasa-fees':
        return <MadrasaFees
          students={students}
          feeRecords={madrasaFeeRecords}
          addFeeRecord={addFeeRecord}
          deleteFeeRecord={deleteFeeRecord}
          updateFeeRecord={updateFeeRecord}
        />;
      case 'reports':
        return <Reports students={students} attendanceRecords={attendanceRecords} />;
      case 'alumni':
        return <AlumniList 
          students={students} 
          addStudent={addStudent} 
          updateStudent={updateStudent}
          deleteStudent={deleteStudent}
        />;
      case 'tanzim':
        return <TanzimModule 
          records={tanzimRecords}
          addRecord={addTanzimRecord}
          updateRecord={updateTanzimRecord}
          deleteRecord={deleteTanzimRecord}
        />;
      default:
        return <Dashboard 
          students={students} 
          teachers={teachers} 
          announcements={announcements}
          tanzimRecords={tanzimRecords}
          madrasaFeeRecords={madrasaFeeRecords}
          attendanceRecords={attendanceRecords}
          addAnnouncement={addAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
        />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 z-10">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="ml-auto flex items-center gap-4">
             <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
               A
             </div>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
