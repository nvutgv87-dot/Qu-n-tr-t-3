import React from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_TEAMS } from '../data/defaultConfig';
import { Settings, Shield, Award, Calendar as CalendarIcon, UserCheck } from 'lucide-react';

interface HeaderProps {
  settings: AppSettings;
  onUpdateTeam: (newTeam: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateTeam,
  onOpenSettings,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Main Title & Team switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-200 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  LỚP {settings.className}
                </span>
                <select
                  value={settings.teamName}
                  onChange={(e) => onUpdateTeam(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-300 transition cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  title="Chọn tổ quản lý"
                >
                  {AVAILABLE_TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  {!AVAILABLE_TEAMS.includes(settings.teamName) && (
                    <option value={settings.teamName}>{settings.teamName}</option>
                  )}
                </select>
                <span className="text-xs text-slate-400 hidden sm:inline">&bull;</span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Năm học: {settings.schoolYear}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
                QUẢN LÝ TỔ — THEO DÕI THI ĐUA
              </h1>
            </div>
          </div>

          {/* Quick Context Info & Settings Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs text-slate-600">
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Tổ trưởng:</span>
                <span className="font-semibold text-slate-800">{settings.leaderName}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">GVCN:</span>
                <span className="font-semibold text-slate-800">{settings.teacherName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="capitalize">{dateFormatted}</span>
            </div>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition font-medium hover:border-slate-300 shadow-2xs"
              title="Cài đặt thông tin lớp, tổ trưởng, GVCN và sao lưu"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cài đặt</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
