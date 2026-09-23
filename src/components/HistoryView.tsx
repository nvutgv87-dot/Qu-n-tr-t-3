import React, { useState } from 'react';
import { AttendanceRecord, PointRecord, Student } from '../types';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface HistoryViewProps {
  students: Student[];
  pointRecords: PointRecord[];
  attendanceRecords: AttendanceRecord[];
  leaderName: string;
  onDeletePointRecord: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  students,
  pointRecords,
  attendanceRecords,
  leaderName,
  onDeletePointRecord,
}) => {
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, positive, negative, attendance
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Combine point records and attendance records into a unified chronological log
  const unifiedLogs: Array<{
    id: string;
    date: string;
    studentId: string;
    studentName: string;
    type: 'positive' | 'negative' | 'attendance';
    typeLabel: string;
    title: string;
    points?: number;
    recordedBy: string;
    note?: string;
    isPointRecord: boolean;
  }> = [];

  // Add Point Records
  pointRecords.forEach((p) => {
    const student = students.find((s) => s.id === p.studentId);
    unifiedLogs.push({
      id: p.id,
      date: p.date,
      studentId: p.studentId,
      studentName: student?.name || 'Chưa rõ',
      type: p.points > 0 ? 'positive' : 'negative',
      typeLabel:
        p.group === 'violation'
          ? '❌ Vi phạm'
          : p.group === 'reminder'
          ? '⚠️ Nhắc nhở'
          : p.group === 'positive'
          ? '✅ Tích cực'
          : p.group === 'creative'
          ? '🌟 Sáng tạo'
          : '🎯 Tuyên dương',
      title: p.title,
      points: p.points,
      recordedBy: p.recordedBy || leaderName,
      note: p.note,
      isPointRecord: true,
    });
  });

  // Add notable attendance records (late or absent)
  attendanceRecords
    .filter((a) => a.status !== 'present')
    .forEach((a) => {
      const student = students.find((s) => s.id === a.studentId);
      unifiedLogs.push({
        id: a.id,
        date: a.date,
        studentId: a.studentId,
        studentName: student?.name || 'Chưa rõ',
        type: 'attendance',
        typeLabel: 'Chuyên cần',
        title:
          a.status === 'late'
            ? 'Đi học trễ'
            : a.status === 'absent_excused'
            ? 'Vắng có phép'
            : 'Vắng không phép',
        points: undefined,
        recordedBy: leaderName,
        note: a.note || 'Ghi nhận từ điểm danh hàng ngày',
        isPointRecord: false,
      });
    });

  // Sort descending by date
  unifiedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter
  const filtered = unifiedLogs.filter((item) => {
    if (filterStudent !== 'all' && item.studentId !== filterStudent) return false;
    if (filterType === 'positive' && item.type !== 'positive') return false;
    if (filterType === 'negative' && item.type !== 'negative') return false;
    if (filterType === 'attendance' && item.type !== 'attendance') return false;

    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNote = (item.note || '').toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchNote) return false;
    }

    return true;
  });

  const handleDelete = () => {
    if (deletingRecordId) {
      onDeletePointRecord(deletingRecordId);
      setDeletingRecordId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Lịch sử ghi nhận thi đua
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nhật ký toàn bộ điểm danh, vi phạm, nhắc nhở và tuyên dương theo trình tự thời gian
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Tổng số bản ghi: <strong>{filtered.length}</strong> / {unifiedLogs.length}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc nội dung..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none"
          >
            <option value="all">Tất cả học sinh</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="positive">✅ Điểm cộng / Khen thưởng</option>
            <option value="negative">❌ Điểm trừ / Vi phạm</option>
            <option value="attendance">🕒 Chuyên cần (Vắng/Trễ)</option>
          </select>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/90 text-[12px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-28">Ngày</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Nội dung ghi nhận</th>
                <th className="py-3 px-4 text-center w-24">Điểm</th>
                <th className="py-3 px-4 hidden md:table-cell">Ghi chú</th>
                <th className="py-3 px-4 text-center w-28 hidden lg:table-cell">Người ghi</th>
                <th className="py-3 px-4 text-center w-20">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi lịch sử nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.studentName}
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full ${
                          item.type === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.type === 'negative'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.typeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.title}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-xs">
                      {item.points !== undefined ? (
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            item.points > 0
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points}đ
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell max-w-xs truncate">
                      {item.note || '—'}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 text-center hidden lg:table-cell">
                      {item.recordedBy}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.isPointRecord ? (
                        <button
                          onClick={() => setDeletingRecordId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa bản ghi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xóa lượt ghi nhận?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa bản ghi này khỏi lịch sử thi đua của tổ?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
