import React, { useState } from 'react';
import { AppSettings, AttendanceRecord, PointRecord, Student } from '../types';
import { AVAILABLE_TEAMS } from '../data/defaultConfig';
import { exportAllDataJSON, importAllDataJSON } from '../services/storage';
import { generateStandaloneHTML } from '../services/htmlExporter';
import {
  Settings,
  X,
  RotateCcw,
  Download,
  Upload,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Shield,
  Info,
  Cloud,
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  students: Student[];
  points: PointRecord[];
  attendance: AttendanceRecord[];
  onSaveSettings: (settings: AppSettings) => void;
  onResetDemo: () => void;
  onDataImported: () => void;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  students,
  points,
  attendance,
  onSaveSettings,
  onResetDemo,
  onDataImported,
  onClose,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onShowToast('Đã lưu thông tin cấu hình tổ & giáo viên!', 'success');
    onClose();
  };

  const handleExportJSON = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Du_Lieu_Thi_Dua_${formData.className}_${formData.teamName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Đã xuất file sao lưu JSON thành công!', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importAllDataJSON(content);
        if (ok) {
          onDataImported();
          onShowToast('Đã khôi phục dữ liệu từ file JSON thành công!', 'success');
          onClose();
        } else {
          onShowToast('File JSON không hợp lệ hoặc sai định dạng!', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadStandaloneHTML = () => {
    const htmlContent = generateStandaloneHTML(formData, students, points, attendance);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuanLyThiDua_${formData.className}_${formData.teamName.replace(/\s+/g, '_')}_Offline.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Đã tải ứng dụng dưới dạng 1 file HTML duy nhất!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cài đặt & Quản lý dữ liệu
              </h3>
              <p className="text-xs text-slate-500">
                Tùy chỉnh thông tin hiển thị và sao lưu dự phòng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1 text-sm">
          {/* Form Settings */}
          <form id="settings-form" onSubmit={handleSave} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: 11A1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tổ phụ trách
                </label>
                <input
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Tổ 3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên tổ trưởng
                </label>
                <input
                  type="text"
                  required
                  value={formData.leaderName}
                  onChange={(e) =>
                    setFormData({ ...formData, leaderName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Trần Công Minh"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Giáo viên chủ nhiệm (GVCN)
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Nguyễn Văn Út"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên trường / Năm học
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Trường THPT..."
                />
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolYear: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="2026 - 2027"
                />
              </div>
            </div>
          </form>

          {/* Standalone HTML Generation Feature */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Xuất dạng 1 File HTML duy nhất (Offline)</span>
            </div>
            <p className="text-xs text-blue-700 mb-2.5 leading-relaxed">
              Tạo file HTML tự thân gồm toàn bộ giao diện, CSS và dữ liệu hiện tại để mở trực tiếp trong bất kỳ trình duyệt nào mà không cần server hay internet.
            </p>
            <button
              type="button"
              onClick={handleDownloadStandaloneHTML}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file HTML độc lập (.html)</span>
            </button>
          </div>

          {/* Backup & Restore Data */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Sao lưu & Khôi phục dữ liệu
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao lưu (JSON)</span>
              </button>

              <label className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Nhập từ JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu demo ban đầu</span>
            </button>
          </div>

          {/* Firebase Realtime Cloud Note */}
          <div className="flex items-start gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80">
            <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Cơ sở dữ liệu Firebase Realtime:</strong> Dữ liệu được đồng bộ hóa tức thì qua đám mây Firebase (Dự án: <code className="font-mono text-[10px] bg-emerald-100/80 px-1 py-0.5 rounded">quan-li-to---3</code>), hỗ trợ truy cập nhiều thiết bị cùng lúc và tự động sao lưu.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="submit"
            form="settings-form"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Khôi phục dữ liệu mẫu ban đầu?
            </h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Toàn bộ dữ liệu điểm danh và ghi nhận hiện tại sẽ được thay thế bằng danh sách 9 học sinh mẫu của Tổ 3 — Lớp 11A1.
            </p>

            <div className="flex justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setIsResetConfirmOpen(false);
                  onClose();
                  onShowToast('Đã khôi phục dữ liệu mẫu thành công!', 'success');
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xs"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
