import React, { useState, useRef } from 'react';
import { Student } from '../types';
import {
  parseMembersFile,
  parseRawTextToCandidates,
  ParsedStudentCandidate,
  isValidVietnameseName,
} from '../services/fileParser';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Plus,
  ArrowRight,
  Clipboard,
  Info,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ImportMembersModalProps {
  existingStudents: Student[];
  onImport: (newStudents: Omit<Student, 'id'>[], replaceAll: boolean) => void;
  onClose: () => void;
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({
  existingStudents,
  onImport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [candidates, setCandidates] = useState<ParsedStudentCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [replaceAll, setReplaceAll] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingNameSet = new Set(existingStudents.map((s) => s.name.toLowerCase().trim()));

  const processCandidates = (extracted: ParsedStudentCandidate[], sourceName: string) => {
    if (extracted.length === 0) {
      setErrorMessage(
        `Không tìm thấy tên học sinh nào trong tệp "${sourceName}". Vui lòng kiểm tra lại nội dung tài liệu hoặc chuyển sang tab "Dán văn bản".`
      );
      setCandidates([]);
      setSelectedIds(new Set());
      return;
    }

    // Mark duplicates
    const marked = extracted.map((c) => ({
      ...c,
      isDuplicate: existingNameSet.has(c.name.toLowerCase().trim()),
    }));

    setCandidates(marked);
    setFileName(sourceName);
    setErrorMessage('');

    // Pre-select non-duplicates
    const initialSelected = new Set<string>();
    marked.forEach((c) => {
      if (!c.isDuplicate) {
        initialSelected.add(c.id);
      }
    });

    // If all are duplicates or replaceAll is true, select all
    if (initialSelected.size === 0) {
      marked.forEach((c) => initialSelected.add(c.id));
    }

    setSelectedIds(initialSelected);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleProcessFile(file);
    if (e.target) e.target.value = '';
  };

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const extracted = await parseMembersFile(file);
      processCandidates(extracted, file.name);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(
        `Lỗi khi đọc file "${file.name}": ${err?.message || 'Không thể trích xuất văn bản'}. Vui lòng thử lại hoặc mở tab Dán trực tiếp văn bản.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
  };

  const handleProcessPastedText = () => {
    if (!pasteText.trim()) {
      setErrorMessage('Vui lòng nhập hoặc dán nội dung danh sách học sinh.');
      return;
    }
    setIsProcessing(true);
    try {
      const extracted = parseRawTextToCandidates(pasteText);
      processCandidates(extracted, 'Văn bản sao chép');
    } catch (err: any) {
      setErrorMessage('Lỗi khi phân tích văn bản: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleData = () => {
    const sample = `1. Trần Công Minh - Nam - Tổ trưởng - Nhiệt tình gương mẫu
2. Trần Thị Thu Hà - Nữ - Tổ phó - Học tốt môn Toán
3. Lê Minh Khôi - Nam - Thành viên
4. Phạm Bảo Ngọc - Nữ - Thành viên - Cán sự Văn
5. Vũ Đức Trọng - Nam - Thành viên
6. Đặng Mai Phương - Nữ - Thành viên
7. Hoàng Anh Tuấn - Nam - Thành viên
8. Bùi Khánh Linh - Nữ - Thành viên
9. Ngô Quốc Huy - Nam - Thành viên`;
    setPasteText(sample);
    const extracted = parseRawTextToCandidates(sample);
    processCandidates(extracted, 'Danh sách mẫu lớp 11A1');
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    }
  };

  const selectOnlyNew = () => {
    const next = new Set<string>();
    candidates.forEach((c) => {
      if (!c.isDuplicate) next.add(c.id);
    });
    setSelectedIds(next);
  };

  // Update candidate fields
  const updateCandidate = (id: string, field: keyof ParsedStudentCandidate, value: any) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === 'name') {
          updated.isDuplicate = existingNameSet.has(String(value).toLowerCase().trim());
        }
        return updated;
      })
    );
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const addManualCandidate = () => {
    const newCand: ParsedStudentCandidate = {
      id: `manual_${Date.now()}`,
      name: 'Học sinh mới',
      gender: 'Nam',
      role: 'Thành viên',
      isDuplicate: false,
    };
    setCandidates((prev) => [...prev, newCand]);
    setSelectedIds((prev) => new Set(prev).add(newCand.id));
  };

  // Confirm import
  const handleConfirmImport = () => {
    const toImport = candidates.filter((c) => selectedIds.has(c.id) && c.name.trim().length > 0);
    if (toImport.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một học sinh để thêm vào danh sách.');
      return;
    }

    const payload: Omit<Student, 'id'>[] = toImport.map((c) => ({
      name: c.name.trim(),
      gender: c.gender,
      role: c.role || 'Thành viên',
      notes: c.notes?.trim() || undefined,
    }));

    onImport(payload, replaceAll);
    onClose();
  };

  const selectedCount = selectedIds.size;
  const duplicateCount = candidates.filter((c) => c.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Nhập thành viên từ Word / PDF</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  .docx &bull; .doc &bull; .pdf
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tự động trích xuất bảng danh sách học sinh, phân loại giới tính & chức vụ vào tổ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Top Tabs: Upload File vs Paste Text */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải file Word / PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>Dán trực tiếp văn bản</span>
            </button>
          </div>

          {/* Tab 1: Upload Zone */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.pdf,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Kéo thả file vào đây hoặc <span className="text-blue-600 underline">bấm để chọn file</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Hỗ trợ định dạng: <strong>Word (.docx, .doc)</strong>, <strong>PDF (.pdf)</strong>, hoặc văn bản (.txt)
                </p>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-blue-700 shadow-2xs">
                    📄 Word (.docx, .doc)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-rose-700 shadow-2xs">
                    📑 Acrobat PDF (.pdf)
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
                    📝 Text (.txt)
                  </span>
                </div>
              </div>

              {/* Quick sample loader */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Bạn chưa có sẵn file? Hãy thử nạp danh sách học sinh mẫu:
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-blue-600 font-bold cursor-pointer"
                >
                  Nạp dữ liệu mẫu
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Paste Direct Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Dán danh sách học sinh từ Word, Excel hoặc tin nhắn Zalo vào đây...&#10;Ví dụ:&#10;1. Nguyễn Hoàng Nam - Nam - Tổ trưởng&#10;2. Trần Thị Thu Hà - Nữ - Tổ phó&#10;3. Lê Minh Khôi - Nam - Thành viên`}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="text-xs text-slate-500 hover:text-blue-600 font-medium underline cursor-pointer"
                >
                  Dán ví dụ mẫu lớp 11A1
                </button>

                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trích xuất danh sách</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="p-8 text-center bg-blue-50/50 rounded-2xl border border-blue-200">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <div className="text-sm font-bold text-blue-900">
                Đang đọc và trích xuất danh sách học sinh...
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Hệ thống đang bóc tách bảng biểu, tên và chức vụ từ tài liệu
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Preview Extracted Table */}
          {candidates.length > 0 && !isProcessing && (
            <div className="space-y-3 pt-2">
              {/* Controls bar above table */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">
                    Tìm thấy: <strong className="text-blue-600">{candidates.length}</strong> học sinh
                  </span>
                  {fileName && (
                    <span className="text-slate-400 hidden sm:inline">&bull; Nguồn: {fileName}</span>
                  )}
                  {duplicateCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      {duplicateCount} bạn đã có trong tổ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    {selectedCount === candidates.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                  </button>
                  {duplicateCount > 0 && (
                    <button
                      type="button"
                      onClick={selectOnlyNew}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-blue-700 font-semibold cursor-pointer"
                    >
                      Chỉ chọn bạn mới ({candidates.length - duplicateCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addManualCandidate}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm dòng</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedCount === candidates.length && candidates.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-10 text-center">STT</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3 w-24">Giới tính</th>
                      <th className="py-2.5 px-3 w-32">Chức vụ</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Ghi chú</th>
                      <th className="py-2.5 px-3 text-center w-20">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {candidates.map((c, idx) => {
                      const isChecked = selectedIds.has(c.id);
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-slate-50 transition ${
                            isChecked ? 'bg-blue-50/20' : 'opacity-60 bg-slate-50/40'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(c.id)}
                              className="rounded text-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 text-center text-slate-400 font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={c.name}
                              onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 font-bold text-slate-800 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={c.gender}
                              onChange={(e) =>
                                updateCandidate(c.id, 'gender', e.target.value as 'Nam' | 'Nữ')
                              }
                              className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                            >
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={c.role}
                              onChange={(e) => updateCandidate(c.id, 'role', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none bg-slate-50 focus:bg-white"
                            >
                              <option value="Thành viên">Thành viên</option>
                              <option value="Tổ phó">Tổ phó</option>
                              <option value="Tổ trưởng">Tổ trưởng</option>
                              <option value="Lớp trưởng">Lớp trưởng</option>
                              <option value="Lớp phó">Lớp phó</option>
                              <option value="Bí thư">Bí thư</option>
                              <option value="Thủ quỹ">Thủ quỹ</option>
                              <option value="Cờ đỏ">Cờ đỏ</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 hidden md:table-cell">
                            <input
                              type="text"
                              value={c.notes || ''}
                              placeholder="Ghi chú..."
                              onChange={(e) => updateCandidate(c.id, 'notes', e.target.value)}
                              className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 text-slate-500 text-xs outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {c.isDuplicate ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Đã có
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Mới
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeCandidate(c.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                              title="Xóa học sinh này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mode choice: Append vs Replace */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Phương thức nạp danh sách vào tổ:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      !replaceAll
                        ? 'bg-white border-blue-500 shadow-2xs text-blue-900'
                        : 'border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={!replaceAll}
                      onChange={() => setReplaceAll(false)}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-xs">Thêm vào danh sách hiện có</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Giữ nguyên {existingStudents.length} thành viên hiện tại của tổ và bổ sung thêm các bạn được chọn.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      replaceAll
                        ? 'bg-white border-rose-500 shadow-2xs text-rose-900'
                        : 'border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={replaceAll}
                      onChange={() => setReplaceAll(true)}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="font-bold text-xs text-rose-700">Thay thế toàn bộ danh sách tổ</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Xóa danh sách cũ và thiết lập lại danh sách mới gồm các bạn được chọn.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {candidates.length > 0 && (
              <span>
                Đã chọn: <strong className="text-blue-600">{selectedCount}</strong> / {candidates.length} học sinh
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-xs cursor-pointer ${
                selectedCount > 0
                  ? replaceAll
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {replaceAll
                  ? `Xác nhận thay thế (${selectedCount} bạn)`
                  : `Thêm ${selectedCount} thành viên vào Tổ`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
