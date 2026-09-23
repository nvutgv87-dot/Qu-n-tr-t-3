import React, { useState } from 'react';
import { Student, WeeklyScoreSummary } from '../types';
import { ImportMembersModal } from './ImportMembersModal';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Award,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Shield,
  User,
  FileUp,
  FileText,
  Sparkles,
} from 'lucide-react';

interface MembersViewProps {
  students: Student[];
  scoreSummaries: WeeklyScoreSummary[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onImportStudents?: (newStudents: Omit<Student, 'id'>[], replaceAll: boolean) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  students,
  scoreSummaries,
  onAddStudent,
  onImportStudents,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formRole, setFormRole] = useState('Thành viên');
  const [formNotes, setFormNotes] = useState('');

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleOpenAdd = () => {
    setFormName('');
    setFormGender('Nam');
    setFormRole('Thành viên');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    onAddStudent({
      name: formName.trim(),
      gender: formGender,
      role: formRole,
      notes: formNotes.trim(),
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormGender(student.gender || 'Nam');
    setFormRole(student.role || 'Thành viên');
    setFormNotes(student.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formName.trim()) return;
    onUpdateStudent({
      ...editingStudent,
      name: formName.trim(),
      gender: formGender,
      role: formRole,
      notes: formNotes.trim(),
    });
    setEditingStudent(null);
  };

  const handleConfirmDelete = () => {
    if (deletingStudent) {
      onDeleteStudent(deletingStudent.id);
      setDeletingStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Danh sách thành viên tổ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý học sinh, chức danh trong tổ và theo dõi tình hình rèn luyện tuần này
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer"
              title="Nhập danh sách học sinh từ file Word (.docx, .doc) hoặc PDF (.pdf)"
            >
              <FileUp className="w-4 h-4 text-blue-600" />
              <span>Nhập từ Word / PDF</span>
              <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-blue-200/70 text-blue-800 font-extrabold">
                .docx &bull; .pdf
              </span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm thủ công</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên học sinh..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span>Hiển thị: <strong>{filteredStudents.length}</strong> / {students.length} bạn</span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[12px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 text-center w-14">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Chức vụ</th>
                <th className="py-3 px-4 text-center text-emerald-700">Điểm cộng (+)</th>
                <th className="py-3 px-4 text-center text-rose-700">Điểm trừ (−)</th>
                <th className="py-3 px-4 text-center">Điểm tổng</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Không tìm thấy thành viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const summary = scoreSummaries.find((s) => s.studentId === student.id) || {
                    plusPoints: 0,
                    minusPoints: 0,
                    netScore: 0,
                    status: 'Tốt' as const,
                  };

                  const isAttention = summary.status === 'Cần chú ý';
                  const isExcellent = summary.status === 'Xuất sắc';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-xs font-semibold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span>{student.gender || 'Nam'}</span>
                              <span className="md:hidden">• {student.role || 'Thành viên'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            student.role === 'Tổ trưởng'
                              ? 'bg-amber-100 text-amber-800 font-bold'
                              : student.role === 'Tổ phó'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {student.role || 'Thành viên'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {summary.plusPoints > 0 ? `+${summary.plusPoints.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">
                        {summary.minusPoints > 0 ? `-${summary.minusPoints.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold">
                        <span
                          className={`text-sm ${
                            summary.netScore > 0
                              ? 'text-emerald-700'
                              : summary.netScore < 0
                              ? 'text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {summary.netScore > 0
                            ? `+${summary.netScore.toFixed(2)}`
                            : summary.netScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${
                            isExcellent
                              ? 'bg-blue-100 text-blue-800'
                              : isAttention
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExcellent && <Award className="w-3 h-3" />}
                          {isAttention && <AlertTriangle className="w-3 h-3" />}
                          {!isExcellent && !isAttention && <CheckCircle2 className="w-3 h-3" />}
                          {summary.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Thêm học sinh vào tổ
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Word/PDF import suggestion */}
            <div className="mt-3 bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">Có sẵn file Word hoặc PDF danh sách tổ?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsImportModalOpen(true);
                }}
                className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 font-bold rounded-lg shrink-0 cursor-pointer shadow-2xs"
              >
                Tải file lên
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-3 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Minh Hoàng"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ trong tổ
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Tổ phó">Tổ phó</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú thêm (không bắt buộc)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ngồi bàn 3 dãy trong"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
                >
                  Lưu thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Chỉnh sửa thành viên
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chức vụ trong tổ
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Tổ phó">Tổ phó</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Delete */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa thành viên?</h3>
            <p className="text-sm text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa học sinh{' '}
              <strong className="text-slate-900">{deletingStudent.name}</strong> khỏi danh sách tổ?
            </p>
            <p className="text-xs text-rose-500 mt-1">
              Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Members from Word / PDF */}
      {isImportModalOpen && onImportStudents && (
        <ImportMembersModal
          existingStudents={students}
          onImport={(newStudents, replaceAll) => {
            onImportStudents(newStudents, replaceAll);
            setIsImportModalOpen(false);
          }}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </div>
  );
};
