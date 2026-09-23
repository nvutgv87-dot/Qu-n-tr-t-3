import React, { useState } from 'react';
import { AttendanceRecord, PointRecord, Student } from '../types';
import {
  getCurrentWeekRange,
  getLastWeekRange,
  calculateScoreSummary,
} from '../services/storage';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowUpDown,
  Search,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface ScoreboardViewProps {
  students: Student[];
  pointRecords: PointRecord[];
  attendanceRecords: AttendanceRecord[];
}

type PeriodFilter = 'this_week' | 'last_week' | 'all';
type SortKey = 'net' | 'plus' | 'minus' | 'name';

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  students,
  pointRecords,
  attendanceRecords,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('this_week');
  const [sortKey, setSortKey] = useState<SortKey>('net');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Compute date bounds based on period
  let startDate: string | undefined;
  let endDate: string | undefined;
  let periodLabel = 'Tuần này';

  if (period === 'this_week') {
    const range = getCurrentWeekRange();
    startDate = range.start;
    endDate = range.end;
    periodLabel = `Tuần này (${range.start} đến ${range.end})`;
  } else if (period === 'last_week') {
    const range = getLastWeekRange();
    startDate = range.start;
    endDate = range.end;
    periodLabel = `Tuần trước (${range.start} đến ${range.end})`;
  } else {
    periodLabel = 'Toàn bộ thời gian';
  }

  const summaries = calculateScoreSummary(
    students,
    pointRecords,
    attendanceRecords,
    startDate,
    endDate
  );

  // Filter & sort
  const filtered = summaries.filter((s) =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'net') cmp = b.netScore - a.netScore;
    else if (sortKey === 'plus') cmp = b.plusPoints - a.plusPoints;
    else if (sortKey === 'minus') cmp = b.minusPoints - a.minusPoints;
    else if (sortKey === 'name') cmp = a.studentName.localeCompare(b.studentName, 'vi');

    return sortAsc ? -cmp : cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const totalPlus = summaries.reduce((acc, s) => acc + s.plusPoints, 0);
  const totalMinus = summaries.reduce((acc, s) => acc + s.minusPoints, 0);
  const totalNet = Number((totalPlus - totalMinus).toFixed(2));

  // Selected student's logs
  const studentLogs = selectedStudentDetail
    ? pointRecords.filter((p) => {
        if (p.studentId !== selectedStudentDetail.id) return false;
        if (startDate && p.date < startDate) return false;
        if (endDate && p.date > endDate) return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Bảng điểm thi đua tổ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Khoảng thời gian: <strong className="text-slate-700">{periodLabel}</strong>
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPeriod('this_week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === 'this_week'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setPeriod('last_week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === 'last_week'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần trước
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-emerald-700">
              Tổng cộng: <strong>+{totalPlus.toFixed(2)}đ</strong>
            </span>
            <span className="text-rose-700">
              Tổng trừ: <strong>-{totalMinus.toFixed(2)}đ</strong>
            </span>
            <span className={`px-2.5 py-1 rounded-lg ${totalNet >= 0 ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-800'}`}>
              Điểm tổng cả tổ: <strong>{totalNet > 0 ? `+${totalNet}` : totalNet}đ</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Scoreboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/90 text-[12px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 text-center w-14">Hạng</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Họ và tên</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('plus')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-emerald-800 select-none text-emerald-700"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Điểm cộng (+)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('minus')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-rose-800 select-none text-rose-700"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Điểm trừ (−)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('net')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-blue-800 select-none text-blue-700"
                >
                  <div className="flex items-center justify-center gap-1 font-extrabold">
                    <span>Điểm tổng</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Chuyên cần</th>
                <th className="py-3 px-4 text-center">Xếp loại</th>
                <th className="py-3 px-4 text-center w-24">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((item, idx) => {
                const student = students.find((s) => s.id === item.studentId);
                const isPositive = item.netScore > 0;
                const isNegative = item.netScore < 0;

                return (
                  <tr
                    key={item.studentId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isNegative ? 'bg-rose-50/25' : isPositive ? 'bg-emerald-50/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold text-xs">
                      {idx === 0 && <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold">#1</span>}
                      {idx === 1 && <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">#2</span>}
                      {idx === 2 && <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">#3</span>}
                      {idx > 2 && <span className="text-slate-400">#{idx + 1}</span>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.studentName}</div>
                      <div className="text-[11px] text-slate-400">
                        {student?.role || 'Thành viên'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                      {item.plusPoints > 0 ? `+${item.plusPoints.toFixed(2)}` : '0'}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-rose-600">
                      {item.minusPoints > 0 ? `-${item.minusPoints.toFixed(2)}` : '0'}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold">
                      <span
                        className={`text-sm px-2.5 py-1 rounded-lg ${
                          isPositive
                            ? 'bg-emerald-100/70 text-emerald-800'
                            : isNegative
                            ? 'bg-rose-100/70 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.netScore > 0 ? `+${item.netScore.toFixed(2)}` : item.netScore.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      <span className="text-emerald-700 font-medium">
                        {item.attendanceCount.present} có mặt
                      </span>
                      {item.attendanceCount.late > 0 && (
                        <span className="text-orange-600 font-semibold ml-1.5">
                          • {item.attendanceCount.late} trễ
                        </span>
                      )}
                      {item.attendanceCount.absent_unexcused > 0 && (
                        <span className="text-rose-600 font-semibold ml-1.5">
                          • {item.attendanceCount.absent_unexcused} vắng KP
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          item.status === 'Xuất sắc'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Cần chú ý'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {student && (
                        <button
                          onClick={() => setSelectedStudentDetail(student)}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition font-medium"
                        >
                          Xem logs
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Log Details Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chi tiết điểm: {selectedStudentDetail.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {periodLabel} &bull; Chức vụ: {selectedStudentDetail.role || 'Thành viên'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-y-auto flex-1 space-y-2 pr-1">
              {studentLogs.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Chưa có ghi nhận vi phạm hay tuyên dương nào trong khoảng thời gian này.
                </p>
              ) : (
                studentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{log.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Ngày {log.date} &bull; {log.note || 'Không có ghi chú'}
                      </div>
                    </div>
                    <span
                      className={`font-extrabold text-sm px-2 py-0.5 rounded-full ${
                        log.points > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.points > 0 ? `+${log.points}` : log.points}đ
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
