import { Users, Briefcase, TrendingUp, FileText, LogOut, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onSignOut }: SidebarProps) {
  const { user } = useAuth();

  const first = (user?.user_metadata?.first_name ?? '').trim();
  const last = (user?.user_metadata?.last_name ?? '').trim();
  const fullName = `${first} ${last}`.trim();

  // İsim yoksa mailin sol tarafını göster (fallback)
  const fallbackName =
    (user?.email ? user.email.split('@')[0] : '').trim();

  const displayName = fullName || fallbackName;

  const menuItems = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: TrendingUp },
    { id: 'adverts', label: 'Adverts', icon: FileText },
    { id: 'staff', label: 'Staff', icon: Briefcase },
    { id: 'grades', label: 'Staff Grades', icon: Award },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Agency Manager</h1>
        <p className="text-sm text-slate-600 mt-1">Creative Solutions</p>

        {displayName && (
          <p className="text-sm text-slate-700 mt-3">
            Welcome, <span className="font-semibold">{displayName}</span>
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
