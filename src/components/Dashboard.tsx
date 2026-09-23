import React from 'react';
import {
  AppSettings,
  AttendanceRecord,
  PointRecord,
  Student,
  WeeklyScoreSummary,
} from '../types';
import { TabType } from './Navigation';
import {
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { getTodayStr } from '../data/defaultConfig';

interface DashboardProps {
  settings: AppSettings;
  students: Student[];
  scoreSummaries: WeeklyScoreSummary[];
  pointRecords: PointRecord[];
  attendanceRecords: AttendanceRecord[];
  onNavigate: (tab: TabType) => void;
  onOpenQuickRecord: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  students,
  scoreSummaries,
  pointRecords,
  attendanceRecords,
  onNavigate,
  onOpenQuickRecord,
}) => {
  const today = getTodayStr();

  // Today's attendance stats
  const todayAtt = attendanceRecords.filter((a) => a.date === today);
  const presentCount = todayAtt.filter((a) => a.status === 'present').length;
  const absentExcusedCount = todayAtt.filter((a) => a.status === 'absent_excused').length;
  const absentUnexcusedCount = todayAtt.filter((a) => a.status === 'absent_unexcused').length;
  const lateCount = todayAtt.filter((a) => a.status === 'late').length;
  const totalChecked = todayAtt.length;

  // Weekly team score aggregation
  const totalPlus = scoreSummaries.reduce((sum, s) => sum + s.plusPoints, 0);
  const totalMinus = scoreSummaries.reduce((sum, s) => sum + s.minusPoints, 0);
  const netTeamScore = Number((totalPlus - totalMinus).toFixed(2));

  // "Thành viên cần chú ý": either negative net score or has >= 1 demerit or attendance issues
  const attentionStudents = scoreSummaries.filter(
    (s) => s.status === 'Cần chú ý' || s.minusPoints >= 0.5 || s.netScore < 0
  );

  // Top positive students
  const topStudents = [...scoreSummaries]
    .filter((s) => s.netScore > 0)
    .sort((a, b) => b.netScore - a.netScore)
    .slice(0, 3);

  // Day of week net scores for simple visual bar chart (Monday to Saturday)
  const weekDays = [
    { label: 'Thứ 2', offset: -4 },
    { label: 'Thứ 3', offset: -3 },
    { label: 'Thứ 4', offset: -2 },
    { label: 'Thứ 5', offset: -1 },
    { label: 'Thứ 6', offset: 0 },
    { label: 'Thứ 7', offset: 1 },
  ].map((d) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + d.offset);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayPts = pointRecords.filter((p) => p.date === dateStr);
    const plus = dayPts.filter((p) => p.points > 0).reduce((a, b) => a + b.points, 0);
    const minus = dayPts.filter((p) => p.points < 0).reduce((a, b) => a + Math.abs(b.points), 0);
    const net = Number((plus - minus).toFixed(2));
    return {
      day: d.label,
      date: dateStr,
      plus,
      minus,
      net,
      count: dayPts.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner & Greeting */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống thi đua học sinh THPT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, tổ trưởng {settings.leaderName} 👋
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-2 font-medium">
            Theo dõi thi đua <strong className="text-white underline decoration-amber-400 underline-offset-4">{settings.teamName}</strong> — Lớp {settings.className} ({settings.schoolYear})
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs sm:text-sm font-bold shadow-sm hover:bg-blue-50 transition cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Điểm danh ngay</span>
            </button>
            <button
              onClick={onOpenQuickRecord}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 border border-white/20 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ghi nhận điểm cộng / trừ</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <span>Xem báo cáo tuần</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Sĩ số */}
        <div
          onClick={() => onNavigate('members')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Sĩ số tổ</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{students.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Thành viên hoạt động</span>
          </div>
        </div>

        {/* Chuyên cần hôm nay */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Có mặt hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-700">
              {presentCount}
            </span>
            <span className="text-xs text-slate-400">/{students.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            {absentUnexcusedCount > 0 || lateCount > 0 ? (
              <span className="text-rose-600 font-semibold">
                {absentUnexcusedCount > 0 ? `${absentUnexcusedCount} vắng KP` : ''}
                {lateCount > 0 ? ` ${lateCount} trễ` : ''}
              </span>
            ) : totalChecked > 0 ? (
              <span className="text-emerald-600">Đầy đủ / có phép</span>
            ) : (
              <span className="text-amber-600 font-medium">Chưa điểm danh</span>
            )}
          </div>
        </div>

        {/* Điểm cộng tuần */}
        <div
          onClick={() => onNavigate('behavior')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Điểm cộng tuần</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            +{totalPlus.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Phát biểu & thành tích
          </div>
        </div>

        {/* Điểm trừ tuần */}
        <div
          onClick={() => onNavigate('behavior')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Điểm trừ tuần</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            -{totalMinus.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Vi phạm & trễ học
          </div>
        </div>

        {/* Điểm tổng cả tổ */}
        <div
          onClick={() => onNavigate('scoreboard')}
          className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Điểm tổng cả tổ</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                netTeamScore >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold ${
              netTeamScore >= 0 ? 'text-blue-700' : 'text-rose-600'
            }`}
          >
            {netTeamScore > 0 ? `+${netTeamScore.toFixed(2)}` : netTeamScore.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            (Cộng − Trừ toàn tổ)
          </div>
        </div>
      </div>

      {/* Two Column Layout: Attention Students & Simple Weekly Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Thành viên cần chú ý */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Thành viên cần chú ý trong tuần
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {attentionStudents.length} bạn
            </span>
          </div>

          {attentionStudents.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Tổ đang thực hiện nề nếp rất tốt!
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Chưa có thành viên nào bị trừ điểm nhiều hoặc điểm tổng âm trong tuần này.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {attentionStudents.map((item) => (
                <div
                  key={item.studentId}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:border-rose-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center">
                      {item.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.studentName}</h4>
                      <p className="text-xs text-slate-500">
                        Bị trừ: <span className="text-rose-600 font-semibold">-{item.minusPoints.toFixed(2)}đ</span>
                        {item.attendanceCount.late > 0 && ` • Trễ ${item.attendanceCount.late} lần`}
                        {item.attendanceCount.absent_unexcused > 0 && ` • Vắng ${item.attendanceCount.absent_unexcused} buổi`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-rose-100 text-rose-700">
                      Tổng: {item.netScore > 0 ? `+${item.netScore}` : item.netScore}
                    </span>
                    <button
                      onClick={() => onNavigate('behavior')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition"
                    >
                      Nhắc nhở
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Notice */}
          <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Lời khuyên tổ trưởng:</strong> Hãy trực tiếp nhắc nhở riêng các bạn có điểm trừ trước buổi sinh hoạt 15 phút để các bạn kịp thời sửa đổi và bù điểm phát biểu nhé.
            </p>
          </div>
        </div>

        {/* Right: Weekly Score Simple Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Điểm thi đua theo ngày trong tuần
                </h3>
                <p className="text-xs text-slate-500">Ghi nhận các ngày học gần nhất</p>
              </div>
              <span className="text-xs font-medium text-slate-400">Tuần này</span>
            </div>

            {/* Simple CSS Bar Chart */}
            <div className="grid grid-cols-6 gap-2 pt-6 pb-2 items-end h-40 border-b border-slate-100">
              {weekDays.map((d, i) => {
                const maxVal = 2.0; // scale reference
                const heightPct = Math.min(
                  Math.max(Math.abs(d.net) / maxVal * 80, 15),
                  95
                );
                const isPositive = d.net >= 0;

                return (
                  <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span
                      className={`text-[10px] font-bold ${
                        d.net > 0
                          ? 'text-emerald-600'
                          : d.net < 0
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.net !== 0 ? (d.net > 0 ? `+${d.net}` : d.net) : '0'}
                    </span>
                    <div
                      style={{ height: `${d.count === 0 ? 8 : heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        d.count === 0
                          ? 'bg-slate-200'
                          : isPositive
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                      title={`${d.day}: +${d.plus}đ / -${d.minus}đ (Tổng: ${d.net})`}
                    />
                    <span className="text-[11px] font-semibold text-slate-600 mt-1">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top positive students list */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Tuyên dương tiêu biểu tuần
              </span>
              <button
                onClick={() => onNavigate('scoreboard')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Xem tất cả &rarr;
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topStudents.map((s, idx) => (
                <div
                  key={s.studentId}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center"
                >
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    #{idx + 1}
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {s.studentName}
                  </div>
                  <div className="text-xs font-extrabold text-emerald-600 mt-0.5">
                    +{s.netScore.toFixed(2)}đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
