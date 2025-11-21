
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  FileText, 
  Moon,
  BookOpen,
  ScrollText,
  Banknote
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'madrasa-fees', label: 'Madrasa Fees', icon: Banknote },
    { id: 'tanzim', label: 'Tanzim Admissions', icon: ScrollText },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'alumni', label: 'Alumni', icon: GraduationCap }, 
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-emerald-900 text-white z-30 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        <div className="p-6 flex items-center gap-3 border-b border-emerald-800">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
             <Moon className="w-6 h-6 text-emerald-900 fill-current" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-amber-400">Noor ul Masajid</h1>
            <p className="text-xs text-emerald-200">Education System</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-emerald-800 text-amber-400 shadow-inner border-l-4 border-amber-400' 
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-md fill-current' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
