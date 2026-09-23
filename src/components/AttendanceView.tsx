import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Student } from '../types';
import { getTodayStr, getOffsetDateStr } from '../data/defaultConfig';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Save,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (
    records: AttendanceRecord[],
    autoDeductDemerits: boolean,
    demeritCandidates: { studentId: string; status: AttendanceStatus; note: string }[]
  ) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});
  const [autoDeduct, setAutoDeduct] = useState(true);

  // When selectedDate changes, load existing records or initialize to 'present'
  useEffect(() => {
    const existing = attendanceRecords.filter((a) => a.date === selectedDate);
    const newMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    students.forEach((student) => {
      const found = existing.find((a) => a.studentId === student.id);
      if (found) {
        newMap[student.id] = { status: found.status, note: found.note || '' };
      } else {
        // default to present
        newMap[student.id] = { status: 'present', note: '' };
      }
    });

    setAttendanceMap(newMap);
  }, [selectedDate, students, attendanceRecords]);

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSetNote = (studentId: string, note: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], note },
    }));
  };

  const handleMarkAllPresent = () => {
    const newMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    students.forEach((s) => {
      newMap[s.id] = { status: 'present', note: attendanceMap[s.id]?.note || '' };
    });
    setAttendanceMap(newMap);
  };

  // Count summary
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let lateCount = 0;

  Object.values(attendanceMap).forEach((item) => {
    if (item.status === 'present') presentCount++;
    else if (item.status === 'absent_excused') excusedCount++;
    else if (item.status === 'absent_unexcused') unexcusedCount++;
    else if (item.status === 'late') lateCount++;
  });

  // Check how many students would trigger demerit
  const demeritCandidates: { studentId: string; status: AttendanceStatus; note: string }[] = [];
  students.forEach((s) => {
    const rec = attendanceMap[s.id];
    if (rec && (rec.status === 'late' || rec.status === 'absent_unexcused')) {
      demeritCandidates.push({
        studentId: s.id,
        status: rec.status,
        note: rec.note || (rec.status === 'late' ? 'Đi học trễ' : 'Vắng không phép'),
      });
    }
  });

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = students.map((s) => ({
      id: `att_${selectedDate}_${s.id}`,
      date: selectedDate,
      studentId: s.id,
      status: attendanceMap[s.id]?.status || 'present',
      note: attendanceMap[s.id]?.note || '',
    }));

    onSaveAttendance(recordsToSave, autoDeduct, demeritCandidates);
  };

  const isToday = selectedDate === getTodayStr();

  return (
    <div className="space-y-6">
      {/* Date selector & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Điểm danh chuyên cần hằng ngày
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ghi nhận có mặt, vắng, đi trễ trong 15 phút đầu giờ hoặc giờ sinh hoạt lớp
            </p>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDate(getTodayStr())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setSelectedDate(getOffsetDateStr(-1))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedDate === getOffsetDateStr(-1)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hôm qua
            </button>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
              <span className="text-xs text-slate-500">Ngày:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Stats Row & Batch Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Thống kê ngày:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              Có mặt: {presentCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              Vắng phép: {excusedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              Vắng KP: {unexcusedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
              Đi trễ: {lateCount}
            </span>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Tất cả có mặt</span>
          </button>
        </div>
      </div>

      {/* Auto Demerit Suggestion Banner */}
      {demeritCandidates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Đề xuất trừ điểm chuyên cần ({demeritCandidates.length} trường hợp)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Theo nội quy, trường hợp đi trễ hoặc vắng không phép được đề xuất trừ <strong>-0.25đ</strong> vào điểm thi đua tuần.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 shrink-0">
            <input
              type="checkbox"
              checked={autoDeduct}
              onChange={(e) => setAutoDeduct(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-amber-900">
              Tự động tạo lượt trừ điểm (-0.25đ)
            </span>
          </label>
        </div>
      )}

      {/* Attendance List Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Danh sách thành viên ({students.length} bạn)
          </span>
          <span className="text-xs text-slate-400">
            Bấm chọn trạng thái tương ứng cho từng bạn
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student, idx) => {
            const current = attendanceMap[student.id] || { status: 'present', note: '' };

            return (
              <div
                key={student.id}
                className="p-4 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 w-full md:w-64 shrink-0">
                  <span className="w-6 text-xs text-slate-400 font-bold text-center">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {student.role || 'Thành viên'}
                    </div>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                  {/* Có mặt */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'present')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      current.status === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Có mặt</span>
                  </button>

                  {/* Vắng có phép */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'absent_excused')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      current.status === 'absent_excused'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Vắng có phép</span>
                  </button>

                  {/* Vắng không phép */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'absent_unexcused')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      current.status === 'absent_unexcused'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Vắng KP</span>
                  </button>

                  {/* Đi trễ */}
                  <button
                    type="button"
                    onClick={() => handleSetStatus(student.id, 'late')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      current.status === 'late'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đi trễ</span>
                  </button>
                </div>

                {/* Optional Note input */}
                <div className="w-full md:w-56 shrink-0">
                  <input
                    type="text"
                    placeholder="Ghi chú (lý do trễ/vắng)..."
                    value={current.note}
                    onChange={(e) => handleSetNote(student.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer save button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Dữ liệu được lưu vào ngày: <strong>{selectedDate}</strong>
          </div>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh ngày {selectedDate}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
