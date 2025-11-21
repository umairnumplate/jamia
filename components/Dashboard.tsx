
import React, { useState, useMemo } from 'react';
import { Users, Calendar, Bell, Plus, Trash2, ScrollText, Banknote, BookOpen, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Student, Teacher, Announcement, TanzimRecord, MadrasaFeeRecord, AcademicTrack, StudentStatus, AttendanceRecord, AttendanceStatus } from '../types';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  announcements: Announcement[];
  tanzimRecords: TanzimRecord[];
  madrasaFeeRecords: MadrasaFeeRecord[];
  attendanceRecords: AttendanceRecord[];
  addAnnouncement: (a: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, teachers, announcements, tanzimRecords, madrasaFeeRecords, attendanceRecords, addAnnouncement, deleteAnnouncement }) => {
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnTitle,
      content: newAnnContent,
      date: new Date().toISOString().split('T')[0],
      isUrgent: false // Simplified for demo
    };
    
    addAnnouncement(announcement);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  // Calculate current month's pending fees
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const pendingFeeCount = madrasaFeeRecords.filter(r => r.month === currentMonth && r.status === 'Pending').length;

  // Calculate Track Counts (Only Active Students)
  const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);
  const hifzCount = activeStudents.filter(s => s.track === AcademicTrack.HIFZ).length;
  const nizamiCount = activeStudents.filter(s => s.track === AcademicTrack.DARS_E_NIZAMI).length;

  // --- Today's Attendance Stats ---
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(r => r.date === todayDate);
  const presentToday = todayAttendance.filter(r => r.status === AttendanceStatus.PRESENT).length;
  const absentToday = todayAttendance.filter(r => r.status === AttendanceStatus.ABSENT).length;
  const leaveToday = todayAttendance.filter(r => r.status === AttendanceStatus.LEAVE).length;
  const totalMarked = presentToday + absentToday + leaveToday;
  const attendancePercentage = totalMarked > 0 ? Math.round((presentToday / totalMarked) * 100) : 0;

  // --- Today's Schedule Logic ---
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDay = days[new Date().getDay()];
  
  const todayClasses = useMemo(() => {
    const classes: { time: string, endTime: string, subject: string, teacher: string, className: string }[] = [];
    teachers.forEach(t => {
      t.assignments.forEach(a => {
        if (a.dayOfWeek.includes(todayDay)) {
          classes.push({
            time: a.startTime,
            endTime: a.endTime,
            subject: a.subject,
            teacher: t.name,
            className: a.className
          });
        }
      });
    });
    // Sort by start time
    return classes.sort((a, b) => a.time.localeCompare(b.time));
  }, [teachers, todayDay]);


  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-inner`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 font-serif">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back to the management portal.</p>
      </div>

      {/* Stats Row - Updated Grid to 3 columns for better layout of 6 items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={activeStudents.length} 
          icon={Users} 
          color="bg-gradient-to-br from-emerald-500 to-emerald-600" 
        />
        <StatCard 
          title="Total Hifz Students" 
          value={hifzCount} 
          icon={Star} 
          color="bg-gradient-to-br from-amber-400 to-amber-500" 
        />
        <StatCard 
          title="Total Dars-e-Nizami" 
          value={nizamiCount} 
          icon={BookOpen} 
          color="bg-gradient-to-br from-indigo-500 to-indigo-600" 
        />
        <StatCard 
          title="Total Teachers" 
          value={teachers.length} 
          icon={Calendar} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" 
        />
        <StatCard 
          title="Tanzim Admissions" 
          value={tanzimRecords.length} 
          icon={ScrollText} 
          color="bg-gradient-to-br from-purple-500 to-purple-600" 
        />
        <StatCard 
          title="Pending Fees (This Month)" 
          value={pendingFeeCount} 
          icon={Banknote} 
          color="bg-gradient-to-br from-red-500 to-red-600" 
        />
      </div>

      {/* Middle Section: Attendance & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Attendance Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <CheckCircle className="w-5 h-5 text-emerald-600" /> Today's Attendance
           </h3>
           
           <div className="flex items-center justify-center py-4">
              <div className="text-center">
                 <div className="text-5xl font-bold text-slate-800 mb-1">{attendancePercentage}%</div>
                 <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Present Today</p>
              </div>
           </div>

           <div className="space-y-4 mt-4">
              <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-700">Present</span>
                 </div>
                 <span className="font-bold text-slate-800">{presentToday}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-700">Absent</span>
                 </div>
                 <span className="font-bold text-slate-800">{absentToday}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-700">On Leave</span>
                 </div>
                 <span className="font-bold text-slate-800">{leaveToday}</span>
              </div>
           </div>
        </div>

        {/* Today's Class Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Clock className="w-5 h-5 text-blue-600" /> Today's Schedule ({todayDay})
             </h3>
             <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{todayClasses.length} Classes</span>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
             {todayClasses.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Calendar className="w-10 h-10 mb-2 opacity-20" />
                 <p>No classes scheduled for today.</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {todayClasses.map((cls, idx) => (
                   <div key={idx} className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                      <div className="min-w-[80px] text-center border-r border-slate-200 pr-4 mr-4">
                         <p className="font-bold text-slate-700 text-sm">{cls.time}</p>
                         <p className="text-xs text-slate-400">{cls.endTime}</p>
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-slate-800">{cls.subject}</h4>
                         <p className="text-xs text-slate-500 flex items-center gap-2">
                           <BookOpen className="w-3 h-3" /> {cls.className}
                         </p>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                           {cls.teacher}
                         </span>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

      </div>

      {/* Announcements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" /> Notice Board
            </h3>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No active announcements.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-start group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                        {ann.isUrgent && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Urgent</span>}
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>
                      <p className="text-xs text-slate-400 mt-2">{ann.date}</p>
                    </div>
                    <button 
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Announcement */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <h3 className="font-bold text-emerald-900 mb-4">Add Announcement</h3>
          <form onSubmit={handleAddAnnouncement} className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={newAnnTitle}
              onChange={e => setNewAnnTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <textarea
              placeholder="Message..."
              value={newAnnContent}
              onChange={e => setNewAnnContent(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
              required
            />
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" /> Post Notice
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
