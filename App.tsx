
import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import TeacherList from './components/TeacherList';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import AlumniList from './components/AlumniList';
import TanzimModule from './components/TanzimModule';
import MadrasaFees from './components/MadrasaFees';
import Login from './components/Login';
import RegistrationList from './components/RegistrationList';
import { Student, Teacher, AttendanceRecord, Announcement, TanzimRecord, MadrasaFeeRecord, Registration, StudentStatus, ApplicationStatus, AcademicTrack, DARS_E_NIZAMI_CLASSES, HIFZ_LEVELS, CertificateStatus } from './types';

// Helper to mock initial data if local storage is empty
const INITIAL_STUDENTS: Student[] = [
  { id: '1', fullName: 'Ahmed Ali', bForm: '12345-1234567-1', fatherName: 'Ali Raza', fatherCnic: '35201-1111111-1', address: 'Main Bazar, Lahore', contactNumber: '923001234567', track: AcademicTrack.HIFZ, className: 'Hifz Ibtidai', status: StudentStatus.ACTIVE, photoUrl: '' },
  { id: '2', fullName: 'Fatima Zahra', bForm: '12345-1234567-2', fatherName: 'Hassan Iqbal', fatherCnic: '35201-2222222-2', address: 'Model Town, Lahore', contactNumber: '923217654321', track: AcademicTrack.DARS_E_NIZAMI, className: 'Aammah Awwal', status: StudentStatus.ACTIVE, photoUrl: '' },
  { id: '3', fullName: 'Usman Ghani', bForm: '12345-1234567-3', fatherName: 'Bashir Ahmed', fatherCnic: '35201-3333333-3', address: 'Johar Town, Lahore', contactNumber: '923339876543', track: AcademicTrack.HIFZ, className: 'Hifz Mukammal', status: StudentStatus.ACTIVE, photoUrl: '' },
  { id: 'g1', fullName: 'Zain Abdullah', bForm: '98765-4321098-1', fatherName: 'Abdullah Khan', fatherCnic: '35201-4444444-4', address: 'Gulberg, Lahore', contactNumber: '923011122334', track: AcademicTrack.DARS_E_NIZAMI, className: 'Graduated', status: StudentStatus.GRADUATED, graduationDate: '2023-05-20', completedLevels: DARS_E_NIZAMI_CLASSES, certificateStatus: CertificateStatus.RECEIVED, certificateDetails: "Excellent performance, Grade A+." },
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Qari Hammad', qualification: 'Qari, Tajweed Expert', contactNumber: '923005556667', assignments: [{ id: 'ta1', className: 'Hifz Ibtidai', subject: 'Hifz', startTime: '08:00', endTime: '10:00', dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }] },
  { id: 't2', name: 'Mufti Tariq', qualification: 'Mufti, Dars-e-Nizami', contactNumber: '923218889990', assignments: [{ id: 'ta2', className: 'Aammah Awwal', subject: 'Fiqh', startTime: '10:00', endTime: '11:30', dayOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }] },
];

const INITIAL_REGISTRATIONS: Registration[] = [
    { id: 'r1', fullName: 'Bilal Khan', bForm: '11111-2222222-3', fatherName: 'Imran Khan', fatherCnic: '35201-5555555-5', address: 'Faisal Town, Lahore', contactNumber: '923451212121', track: AcademicTrack.HIFZ, className: 'Hifz Ibtidai', applicationDate: new Date().toISOString().split('T')[0], status: ApplicationStatus.PENDING },
];


const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('isAuthenticated'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  // Data State
  const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = window.localStorage.getItem(key);
        // Add a check to see if the storage is empty, if so, use initialValue
        if (item === null) {
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          return initialValue;
        }
        return JSON.parse(item);
      } catch (error) {
        console.error(error);
        return initialValue;
      }
    });

    const setValue = (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    };
    return [storedValue, setValue];
  };

  const [students, setStudents] = useLocalStorage<Student[]>('students', INITIAL_STUDENTS);
  const [teachers, setTeachers] = useLocalStorage<Teacher[]>('teachers', INITIAL_TEACHERS);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('announcements', []);
  const [tanzimRecords, setTanzimRecords] = useLocalStorage<TanzimRecord[]>('tanzimRecords', []);
  const [madrasaFeeRecords, setMadrasaFeeRecords] = useLocalStorage<MadrasaFeeRecord[]>('madrasaFeeRecords', []);
  const [registrations, setRegistrations] = useLocalStorage<Registration[]>('registrations', INITIAL_REGISTRATIONS);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth Actions
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Generic Actions
  const addStudent = (s: Student) => setStudents(prev => [...prev, s]);
  const updateStudent = (updated: Student) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const deleteStudent = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));
  
  const addTeacher = (t: Teacher) => setTeachers(prev => [...prev, t]);
  const updateTeacher = (updated: Teacher) => setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTeacher = (id: string) => setTeachers(prev => prev.filter(t => t.id !== id));

  const saveAttendance = (newRecords: AttendanceRecord[]) => setAttendanceRecords(prev => {
    const uniqueNewRecords = new Map<string, AttendanceRecord>();
    [...prev, ...newRecords].forEach(record => uniqueNewRecords.set(record.id, record));
    return Array.from(uniqueNewRecords.values());
  });
  const deleteAttendance = (id: string) => setAttendanceRecords(prev => prev.filter(r => r.id !== id));

  const addAnnouncement = (a: Announcement) => setAnnouncements(prev => [a, ...prev]);
  const deleteAnnouncement = (id: string) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  const addTanzimRecord = (r: TanzimRecord) => setTanzimRecords(prev => [...prev, r]);
  const updateTanzimRecord = (r: TanzimRecord) => setTanzimRecords(prev => prev.map(rec => rec.id === r.id ? r : rec));
  const deleteTanzimRecord = (id: string) => setTanzimRecords(prev => prev.filter(r => r.id !== id));

  const addFeeRecord = (r: MadrasaFeeRecord) => setMadrasaFeeRecords(prev => [...prev, r]);
  const updateFeeRecord = (r: MadrasaFeeRecord) => setMadrasaFeeRecords(prev => prev.map(rec => rec.id === r.id ? r : rec));
  const deleteFeeRecord = (id: string) => setMadrasaFeeRecords(prev => prev.filter(r => r.id !== id));

  // Registration Actions
  const addRegistration = (r: Registration) => setRegistrations(prev => [...prev, r]);
  const approveRegistration = (id: string) => {
    const reg = registrations.find(r => r.id === id);
    if (reg) {
      const newStudent: Student = {
        ...reg,
        status: StudentStatus.ACTIVE
      };
      addStudent(newStudent);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: ApplicationStatus.APPROVED } : r));
    }
  };
  const rejectRegistration = (id: string) => {
    setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: ApplicationStatus.REJECTED } : r));
  };


  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard students={students} teachers={teachers} announcements={announcements} tanzimRecords={tanzimRecords} madrasaFeeRecords={madrasaFeeRecords} attendanceRecords={attendanceRecords} registrations={registrations} addAnnouncement={addAnnouncement} deleteAnnouncement={deleteAnnouncement} />;
      case 'registrations': return <RegistrationList registrations={registrations} addRegistration={addRegistration} approveRegistration={approveRegistration} rejectRegistration={rejectRegistration} />;
      case 'students': return <StudentList students={students} addStudent={addStudent} updateStudent={updateStudent} deleteStudent={deleteStudent} />;
      case 'teachers': return <TeacherList teachers={teachers} addTeacher={addTeacher} updateTeacher={updateTeacher} deleteTeacher={deleteTeacher} />;
      case 'attendance': return <Attendance students={students} attendanceRecords={attendanceRecords} saveAttendance={saveAttendance} deleteAttendance={deleteAttendance} />;
      case 'madrasa-fees': return <MadrasaFees students={students} feeRecords={madrasaFeeRecords} addFeeRecord={addFeeRecord} deleteFeeRecord={deleteFeeRecord} updateFeeRecord={updateFeeRecord} />;
      case 'reports': return <Reports students={students} attendanceRecords={attendanceRecords} />;
      case 'alumni': return <AlumniList students={students} addStudent={addStudent} updateStudent={updateStudent} deleteStudent={deleteStudent} />;
      case 'tanzim': return <TanzimModule records={tanzimRecords} addRecord={addTanzimRecord} updateRecord={updateTanzimRecord} deleteRecord={deleteTanzimRecord} />;
      default: return <Dashboard students={students} teachers={teachers} announcements={announcements} tanzimRecords={tanzimRecords} madrasaFeeRecords={madrasaFeeRecords} attendanceRecords={attendanceRecords} registrations={registrations} addAnnouncement={addAnnouncement} deleteAnnouncement={deleteAnnouncement} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 z-10 flex-shrink-0">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
             <div className="group relative">
                <div className="w-9 h-9 bg-amber-500 dark:bg-amber-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer">A</div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                   <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Admin</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">System Administrator</p>
                   </div>
                   <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <LogOut className="w-4 h-4" />
                      Logout
                   </button>
                </div>
             </div>
          </div>
        </header>
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
