import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  BarChart3,
  History,
  FileText,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'members'
  | 'attendance'
  | 'behavior'
  | 'scoreboard'
  | 'history'
  | 'report';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  memberCount: number;
  recentViolationsCount?: number;
}

export const navItems = [
  {
    id: 'dashboard' as TabType,
    label: 'Tổng quan',
    icon: LayoutDashboard,
    shortLabel: 'Tổng quan',
  },
  {
    id: 'members' as TabType,
    label: 'Thành viên tổ',
    icon: Users,
    shortLabel: 'Thành viên',
  },
  {
    id: 'attendance' as TabType,
    label: 'Điểm danh chuyên cần',
    icon: UserCheck,
    shortLabel: 'Điểm danh',
  },
  {
    id: 'behavior' as TabType,
    label: 'Ghi nhận vi phạm / tuyên dương',
    icon: Award,
    shortLabel: 'Ghi nhận',
  },
  {
    id: 'scoreboard' as TabType,
    label: 'Bảng điểm thi đua',
    icon: BarChart3,
    shortLabel: 'Bảng điểm',
  },
  {
    id: 'history' as TabType,
    label: 'Lịch sử ghi nhận',
    icon: History,
    shortLabel: 'Lịch sử',
  },
  {
    id: 'report' as TabType,
    label: 'Báo cáo tuần',
    icon: FileText,
    shortLabel: 'Báo cáo',
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  memberCount,
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs sticky top-20">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Quản Lý
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-300'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.id === 'members' && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {memberCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-100 px-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-500 mb-1">Nội quy thi đua 11A1</p>
            <p className="leading-relaxed">
              &bull; Cộng/trừ 0.25đ theo bảng tiêu chí chuẩn.<br />
              &bull; Nộp báo cáo cho GVCN vào thứ 7 hàng tuần.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile / Tablet Horizontal Scrollable Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-15 z-20 overflow-x-auto no-scrollbar shadow-2xs">
        <div className="flex items-center gap-1.5 p-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
