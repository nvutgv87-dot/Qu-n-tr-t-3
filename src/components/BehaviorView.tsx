import React, { useState } from 'react';
import {
  BehaviorCriterion,
  BehaviorGroup,
  PointRecord,
  Student,
} from '../types';
import {
  BEHAVIOR_CRITERIA,
  BEHAVIOR_GROUP_META,
  getTodayStr,
} from '../data/defaultConfig';
import {
  Award,
  AlertCircle,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Users,
  Search,
  Check,
  X,
} from 'lucide-react';

interface BehaviorViewProps {
  students: Student[];
  pointRecords: PointRecord[];
  leaderName: string;
  onAddPointRecord: (record: Omit<PointRecord, 'id' | 'createdAt'>) => void;
  onUpdatePointRecord: (record: PointRecord) => void;
  onDeletePointRecord: (id: string) => void;
}

export const BehaviorView: React.FC<BehaviorViewProps> = ({
  students,
  pointRecords,
  leaderName,
  onAddPointRecord,
  onUpdatePointRecord,
  onDeletePointRecord,
}) => {
  // Form state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string>(
    BEHAVIOR_CRITERIA[0].id
  );
  const [recordDate, setRecordDate] = useState<string>(getTodayStr());
  const [customNote, setCustomNote] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number | null>(null);

  // Edit modal
  const [editingRecord, setEditingRecord] = useState<PointRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<PointRecord | null>(null);

  // Filter for recent list
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const selectedCriterion =
    BEHAVIOR_CRITERIA.find((c) => c.id === selectedCriterionId) ||
    BEHAVIOR_CRITERIA[0];

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;

    const pointsToApply =
      customPoints !== null ? customPoints : selectedCriterion.points;

    // Create record for each selected student
    selectedStudentIds.forEach((studentId) => {
      onAddPointRecord({
        studentId,
        criterionId: selectedCriterion.id,
        group: selectedCriterion.group,
        title: selectedCriterion.title,
        points: pointsToApply,
        date: recordDate,
        note: customNote.trim() || undefined,
        recordedBy: leaderName,
      });
    });

    // Reset some form parts
    setSelectedStudentIds([]);
    setCustomNote('');
    setCustomPoints(null);
  };

  // Filtered list
  const sortedRecords = [...pointRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredRecords = sortedRecords.filter((rec) => {
    if (filterStudent !== 'all' && rec.studentId !== filterStudent) return false;
    if (filterGroup !== 'all' && rec.group !== filterGroup) return false;
    return true;
  });

  // Group criteria by their behavior group
  const groupedCriteria = {
    violation: BEHAVIOR_CRITERIA.filter((c) => c.group === 'violation'),
    reminder: BEHAVIOR_CRITERIA.filter((c) => c.group === 'reminder'),
    positive: BEHAVIOR_CRITERIA.filter((c) => c.group === 'positive'),
    creative: BEHAVIOR_CRITERIA.filter((c) => c.group === 'creative'),
    individual: BEHAVIOR_CRITERIA.filter((c) => c.group === 'individual'),
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Ghi nhận vi phạm / tuyên dương hành vi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Áp dụng bảng điểm hành vi đạo đức & nội quy thi đua theo quy định nhà trường
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Người ghi nhận:</span>
            <strong className="text-slate-800 bg-slate-100 px-2 py-1 rounded">
              {leaderName} (Tổ trưởng)
            </strong>
          </div>
        </div>
      </div>

      {/* Recording Form & Criteria Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Select Student & Date & Action */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                1. Chọn học sinh ({selectedStudentIds.length} đã chọn)
              </label>
              <button
                type="button"
                onClick={handleSelectAllStudents}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {selectedStudentIds.length === students.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn cả tổ'}
              </button>
            </div>

            {/* Quick Multi-select chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`p-2 rounded-lg text-xs font-medium text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{student.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Ngày ghi nhận
              </label>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-300 p-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="text-sm font-semibold text-slate-800 bg-transparent outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Selected Criterion Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                3. Tiêu chí đang chọn
              </label>
              <div
                className={`p-3 rounded-xl border ${
                  selectedCriterion.points > 0
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{selectedCriterion.title}</span>
                  <span
                    className={`text-sm font-extrabold px-2 py-0.5 rounded-full ${
                      selectedCriterion.points > 0
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-rose-200 text-rose-800'
                    }`}
                  >
                    {selectedCriterion.points > 0
                      ? `+${selectedCriterion.points}`
                      : selectedCriterion.points}
                    đ
                  </span>
                </div>
                {selectedCriterion.description && (
                  <p className="text-xs opacity-75 mt-1">
                    {selectedCriterion.description}
                  </p>
                )}
              </div>
            </div>

            {/* Note & Custom Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                4. Ghi chú cụ thể (hoặc lý do nếu chọn Khác)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Giờ Toán tiết 2, chuẩn bị video lịch sử..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={selectedStudentIds.length === 0}
              className={`w-full py-3 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedStudentIds.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                Lưu ghi nhận ({selectedStudentIds.length} học sinh)
              </span>
            </button>
          </form>
        </div>

        {/* Right: Quick Selection Grid of All Criteria */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Danh mục tiêu chí thi đua (Chọn nhanh bên dưới)
            </h3>

            <div className="space-y-4">
              {/* Nhóm Vi phạm */}
              <div>
                <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Nhóm ❌ Vi phạm (trừ điểm)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupedCriteria.violation.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedCriterionId(item.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        selectedCriterionId === item.id
                          ? 'bg-rose-100/80 border-rose-400 font-bold text-rose-900 ring-2 ring-rose-400'
                          : 'bg-rose-50/40 border-rose-100 hover:bg-rose-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate mr-2">{item.title}</span>
                      <span className="font-extrabold text-rose-600 shrink-0">
                        {item.points}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhóm Nhắc nhở */}
              <div>
                <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Nhóm ⚠️ Nhắc nhở</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupedCriteria.reminder.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedCriterionId(item.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        selectedCriterionId === item.id
                          ? 'bg-amber-100/80 border-amber-400 font-bold text-amber-900 ring-2 ring-amber-400'
                          : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate mr-2">{item.title}</span>
                      <span className="font-extrabold text-amber-600 shrink-0">
                        {item.points}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhóm Tích cực */}
              <div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Nhóm ✅ Tích cực (cộng điểm)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {groupedCriteria.positive.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedCriterionId(item.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        selectedCriterionId === item.id
                          ? 'bg-emerald-100/80 border-emerald-400 font-bold text-emerald-900 ring-2 ring-emerald-400'
                          : 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate mr-2">{item.title}</span>
                      <span className="font-extrabold text-emerald-600 shrink-0">
                        +{item.points}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhóm Sáng tạo & Cá nhân */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nhóm 🌟 Sản phẩm / Hoạt động</span>
                  </div>
                  <div className="space-y-2">
                    {groupedCriteria.creative.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedCriterionId(item.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                          selectedCriterionId === item.id
                            ? 'bg-indigo-100/80 border-indigo-400 font-bold text-indigo-900 ring-2 ring-indigo-400'
                            : 'bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50 text-slate-800'
                        }`}
                      >
                        <span className="truncate mr-2">{item.title}</span>
                        <span className="font-extrabold text-indigo-600 shrink-0">
                          +{item.points}đ
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>Nhóm 🎯 Cá nhân</span>
                  </div>
                  <div className="space-y-2">
                    {groupedCriteria.individual.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedCriterionId(item.id)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                          selectedCriterionId === item.id
                            ? 'bg-blue-100/80 border-blue-400 font-bold text-blue-900 ring-2 ring-blue-400'
                            : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50 text-slate-800'
                        }`}
                      >
                        <span className="truncate mr-2">{item.title}</span>
                        <span className="font-extrabold text-blue-600 shrink-0">
                          +{item.points}đ
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records List with Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Các lượt ghi nhận gần đây ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Bạn có thể xem lại, sửa đổi hoặc xóa nếu lỡ ghi nhận nhầm
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none"
            >
              <option value="all">Tất cả học sinh</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none"
            >
              <option value="all">Tất cả nhóm</option>
              <option value="violation">❌ Vi phạm</option>
              <option value="reminder">⚠️ Nhắc nhở</option>
              <option value="positive">✅ Tích cực</option>
              <option value="creative">🌟 Sáng tạo</option>
              <option value="individual">🎯 Tuyên dương</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4 w-28">Ngày</th>
                <th className="py-2.5 px-4">Học sinh</th>
                <th className="py-2.5 px-4">Nội dung hành vi</th>
                <th className="py-2.5 px-4 text-center w-24">Điểm</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Ghi chú</th>
                <th className="py-2.5 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có lượt ghi nhận nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 20).map((record) => {
                  const student = students.find((s) => s.id === record.studentId);
                  const isPositive = record.points > 0;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {student ? student.name : 'Chưa rõ'}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-medium text-slate-800">
                            {record.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-extrabold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? `+${record.points}` : record.points}đ
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-500 hidden md:table-cell max-w-xs truncate">
                        {record.note || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa ghi nhận"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa ghi nhận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Chỉnh sửa lượt ghi nhận
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nội dung hành vi
                </label>
                <input
                  type="text"
                  value={editingRecord.title}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Điểm (+ hoặc -)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={editingRecord.points}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        points: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngày ghi nhận
                  </label>
                  <input
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={editingRecord.note || ''}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, note: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdatePointRecord(editingRecord);
                    setEditingRecord(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-xs"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xóa lượt ghi nhận?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Bạn có chắc muốn xóa ghi nhận &ldquo;<strong>{deletingRecord.title}</strong>&rdquo; (
              {deletingRecord.points > 0
                ? `+${deletingRecord.points}`
                : deletingRecord.points}
              đ) của ngày {deletingRecord.date}?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeletePointRecord(deletingRecord.id);
                  setDeletingRecord(null);
                }}
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
