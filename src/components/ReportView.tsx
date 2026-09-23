import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  AttendanceRecord,
  PointRecord,
  Student,
} from '../types';
import {
  calculateScoreSummary,
  getCurrentWeekRange,
  getLastWeekRange,
} from '../services/storage';
import { generateStandaloneHTML } from '../services/htmlExporter';
import {
  FileText,
  Printer,
  Copy,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Edit3,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface ReportViewProps {
  settings: AppSettings;
  students: Student[];
  pointRecords: PointRecord[];
  attendanceRecords: AttendanceRecord[];
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  settings,
  students,
  pointRecords,
  attendanceRecords,
  onShowToast,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current');
  const [reportWeekNumber, setReportWeekNumber] = useState('Tuần 03');

  // Custom remarks notes
  const [praiseNote, setPraiseNote] = useState<string>(() => {
    return (
      localStorage.getItem('report_praise_note_current') ||
      'Tuyên dương các thành viên tích cực phát biểu xây dựng bài, đi học đúng giờ và hỗ trợ bạn bè trong học tập.'
    );
  });

  const [remindNote, setRemindNote] = useState<string>(() => {
    return (
      localStorage.getItem('report_remind_note_current') ||
      'Kính đề nghị GVCN nhắc nhở thành viên còn đi học muộn, chưa tập trung nghe giảng và cần chuẩn bị bài chu đáo trước khi đến lớp.'
    );
  });

  useEffect(() => {
    const keyPraise = `report_praise_note_${selectedPeriod}`;
    const keyRemind = `report_remind_note_${selectedPeriod}`;
    const savedPraise = localStorage.getItem(keyPraise);
    const savedRemind = localStorage.getItem(keyRemind);

    if (savedPraise !== null) {
      setPraiseNote(savedPraise);
    } else {
      setPraiseNote(
        selectedPeriod === 'current'
          ? 'Tuyên dương các thành viên tích cực phát biểu xây dựng bài, đi học đúng giờ và hỗ trợ bạn bè trong học tập.'
          : 'Tuyên dương tinh thần đoàn kết và ý thức tự giác rèn luyện của các thành viên trong tổ tuần trước.'
      );
    }

    if (savedRemind !== null) {
      setRemindNote(savedRemind);
    } else {
      setRemindNote(
        selectedPeriod === 'current'
          ? 'Kính đề nghị GVCN nhắc nhở thành viên còn đi học muộn, chưa tập trung nghe giảng và cần chuẩn bị bài chu đáo trước khi đến lớp.'
          : 'Nhắc nhở toàn tổ duy trì nề nếp kỷ luật và không vi phạm quy định đồng phục.'
      );
    }
  }, [selectedPeriod]);

  const handlePraiseChange = (val: string) => {
    setPraiseNote(val);
    localStorage.setItem(`report_praise_note_${selectedPeriod}`, val);
  };

  const handleRemindChange = (val: string) => {
    setRemindNote(val);
    localStorage.setItem(`report_remind_note_${selectedPeriod}`, val);
  };

  const appendPraiseChip = (text: string) => {
    const updated = praiseNote.trim() ? `${praiseNote.trim()} ${text}.` : text + '.';
    handlePraiseChange(updated);
  };

  const appendRemindChip = (text: string) => {
    const updated = remindNote.trim() ? `${remindNote.trim()} ${text}.` : text + '.';
    handleRemindChange(updated);
  };

  const weekRange =
    selectedPeriod === 'current' ? getCurrentWeekRange() : getLastWeekRange();

  const summaries = calculateScoreSummary(
    students,
    pointRecords,
    attendanceRecords,
    weekRange.start,
    weekRange.end
  );

  const totalPlus = summaries.reduce((a, b) => a + b.plusPoints, 0);
  const totalMinus = summaries.reduce((a, b) => a + b.minusPoints, 0);
  const netTeamScore = Number((totalPlus - totalMinus).toFixed(2));

  // Attendance aggregates for the week
  const weekAttendance = attendanceRecords.filter(
    (a) => a.date >= weekRange.start && a.date <= weekRange.end
  );
  const totalExcused = weekAttendance.filter((a) => a.status === 'absent_excused').length;
  const totalUnexcused = weekAttendance.filter((a) => a.status === 'absent_unexcused').length;
  const totalLate = weekAttendance.filter((a) => a.status === 'late').length;

  // Outstanding students & need attention
  const commendedStudents = summaries.filter((s) => s.netScore > 0);
  const attentionStudents = summaries.filter(
    (s) => s.status === 'Cần chú ý' || s.minusPoints >= 0.5 || s.netScore < 0
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `📋 BÁO CÁO THI ĐUA ${settings.teamName.toUpperCase()} — LỚP ${settings.className}
📅 Thời gian: ${reportWeekNumber} (${weekRange.start} đến ${weekRange.end})
👤 Tổ trưởng: ${settings.leaderName} | GVCN: ${settings.teacherName}
----------------------------------------
📊 TỔNG QUAN TỔ:
• Sĩ số: ${students.length} học sinh
• Chuyên cần: ${totalLate} lượt trễ, ${totalExcused} vắng phép, ${totalUnexcused} vắng không phép
• Điểm thi đua: +${totalPlus.toFixed(2)}đ | -${totalMinus.toFixed(2)}đ
👉 Điểm tổng cả tổ: ${netTeamScore > 0 ? `+${netTeamScore}` : netTeamScore}đ

🌟 1. ĐỀ XUẤT TUYÊN DƯƠNG TUẦN:
${praiseNote ? `• Nội dung: ${praiseNote}\n` : ''}${commendedStudents.length > 0 ? commendedStudents.map(s => `• ${s.studentName}: +${s.netScore}đ`).join('\n') : '• Cả tổ duy trì nề nếp tốt'}

⚠️ 2. ĐỀ XUẤT GVCN NHẮC NHỞ:
${remindNote ? `• Nội dung: ${remindNote}\n` : ''}${attentionStudents.length > 0 ? attentionStudents.map(s => `• ${s.studentName}: ${s.netScore}đ (bị trừ -${s.minusPoints}đ)`).join('\n') : '• Không có vi phạm nghiêm trọng'}`;

    navigator.clipboard.writeText(text);
    onShowToast('Đã sao chép tóm tắt báo cáo để gửi vào Zalo/nhóm lớp!', 'success');
  };

  const handleDownloadStandaloneHTML = () => {
    const htmlContent = generateStandaloneHTML(
      settings,
      students,
      pointRecords,
      attendanceRecords,
      praiseNote,
      remindNote
    );
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Thi_Dua_${settings.teamName.replace(/\s+/g, '_')}_${settings.className}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Đã tải file HTML báo cáo độc lập!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden on print) */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Báo cáo thi đua tuần nộp GVCN
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Báo cáo được thiết kế theo quy chuẩn văn bản, sẵn sàng in khổ giấy A4 hoặc gửi trực tuyến
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedPeriod('current')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === 'current'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setSelectedPeriod('previous')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === 'previous'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Tuần trước
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo (Ctrl+P)</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Sao chép tóm tắt văn bản để gửi vào Zalo"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Sao chép Zalo</span>
            </button>

            <button
              onClick={handleDownloadStandaloneHTML}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Tải 1 file HTML duy nhất mở độc lập mọi nơi"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Tải file HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Sheet (A4 format styled) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {settings.schoolName}
              </div>
              <div className="text-xs font-semibold text-slate-600">
                LỚP {settings.className} &bull; {settings.teamName.toUpperCase()}
              </div>
            </div>

            <div className="text-right text-xs text-slate-600">
              <div><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></div>
              <div className="italic text-[11px]">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-slate-400 mt-1">
                {new Date().toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              BÁO CÁO KẾT QUẢ THI ĐUA NỀ NẾP TUẦN
            </h1>
            <div className="text-sm font-semibold text-slate-600 mt-1 flex items-center justify-center gap-2">
              <span className="bg-slate-100 px-3 py-0.5 rounded-full border border-slate-200">
                {reportWeekNumber} ({weekRange.start} đến {weekRange.end})
              </span>
            </div>
          </div>
        </div>

        {/* Administrative Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-slate-500 block">Lớp học:</span>
            <strong className="text-slate-800 text-sm">{settings.className}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Đơn vị quản lý:</span>
            <strong className="text-slate-800 text-sm">{settings.teamName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tổ trưởng báo cáo:</span>
            <strong className="text-slate-800 text-sm">{settings.leaderName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Giáo viên chủ nhiệm:</span>
            <strong className="text-slate-800 text-sm">{settings.teacherName}</strong>
          </div>
        </div>

        {/* Aggregate KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500">Sĩ số thành viên</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {students.length}
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500">Vi phạm chuyên cần</div>
            <div className="text-xl font-black text-orange-700 mt-0.5">
              {totalLate + totalUnexcused} <span className="text-xs font-normal">lượt</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500">Tổng điểm tích lũy</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              +{totalPlus.toFixed(2)} / -{totalMinus.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="text-xs text-blue-700 font-semibold">Điểm tổng cả tổ</div>
            <div className={`text-xl font-black mt-0.5 ${netTeamScore >= 0 ? 'text-blue-800' : 'text-rose-700'}`}>
              {netTeamScore > 0 ? `+${netTeamScore.toFixed(2)}` : netTeamScore.toFixed(2)}đ
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            I. BẢNG TỔNG HỢP CHI TIẾT TỪNG THÀNH VIÊN
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300">STT</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Họ và tên</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Chức vụ</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Vắng/Trễ</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300 text-emerald-700">Điểm (+)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300 text-rose-700">Điểm (−)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Điểm tổng</th>
                  <th className="py-2.5 px-3 text-center">Xếp loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summaries.map((item, idx) => {
                  const student = students.find((s) => s.id === item.studentId);
                  const attInfo = [];
                  if (item.attendanceCount.late > 0) attInfo.push(`${item.attendanceCount.late} trễ`);
                  if (item.attendanceCount.absent_excused > 0) attInfo.push(`${item.attendanceCount.absent_excused} phép`);
                  if (item.attendanceCount.absent_unexcused > 0) attInfo.push(`${item.attendanceCount.absent_unexcused} KP`);

                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {item.studentName}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 text-slate-600">
                        {student?.role || 'Thành viên'}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 text-slate-600">
                        {attInfo.length > 0 ? attInfo.join(', ') : 'Tốt'}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-semibold text-emerald-700">
                        {item.plusPoints > 0 ? `+${item.plusPoints.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-semibold text-rose-700">
                        {item.minusPoints > 0 ? `-${item.minusPoints.toFixed(2)}` : '0'}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-black">
                        {item.netScore > 0 ? `+${item.netScore.toFixed(2)}` : item.netScore.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            item.status === 'Xuất sắc'
                              ? 'text-blue-800'
                              : item.status === 'Cần chú ý'
                              ? 'text-rose-800'
                              : 'text-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 text-xs page-break-inside-avoid">
          {/* Mục 1: Đề xuất tuyên dương tuần */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  1. Đề xuất tuyên dương tuần
                </h4>
                <span className="text-[10px] text-slate-400 font-medium print:hidden flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-blue-500" />
                  Ghi chú trực tiếp
                </span>
              </div>

              {/* Danh sách thành viên tích cực tự động */}
              {commendedStudents.length > 0 && (
                <div className="mb-3 p-2 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">
                    Thành viên đạt điểm cộng cao trong tuần:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {commendedStudents.slice(0, 4).map((s) => (
                      <li key={s.studentId}>
                        <strong>{s.studentName}</strong> (+{s.netScore}đ) — Hăng hái học tập, tích cực đóng góp cho tổ.
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ô nhập nội dung ghi chú tuyên dương */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Nội dung ghi chú đề xuất của tổ trưởng:
                </label>
                
                {/* On Screen: Textarea */}
                <div className="print:hidden">
                  <textarea
                    rows={3}
                    value={praiseNote}
                    onChange={(e) => handlePraiseChange(e.target.value)}
                    placeholder="Nhập nội dung đề xuất tuyên dương (ví dụ: Tuyên dương bạn Minh và bạn Hà tích cực phát biểu xây dựng bài, bạn Khôi trực nhật sạch sẽ)..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed transition"
                  />
                  
                  {/* Quick suggestion chips */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                    <button
                      type="button"
                      onClick={() => appendPraiseChip('Tích cực phát biểu xây dựng bài')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[10px] text-blue-700 transition cursor-pointer"
                    >
                      + Phát biểu xây dựng bài
                    </button>
                    <button
                      type="button"
                      onClick={() => appendPraiseChip('Đạt điểm 9, 10 trong các giờ học')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[10px] text-blue-700 transition cursor-pointer"
                    >
                      + Đạt điểm tốt
                    </button>
                    <button
                      type="button"
                      onClick={() => appendPraiseChip('Trực nhật tổ sạch sẽ và đúng giờ')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[10px] text-blue-700 transition cursor-pointer"
                    >
                      + Trực nhật sạch sẽ
                    </button>
                    <button
                      type="button"
                      onClick={() => appendPraiseChip('Gương mẫu chấp hành tốt nội quy trường lớp')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-[10px] text-blue-700 transition cursor-pointer"
                    >
                      + Gương mẫu nội quy
                    </button>
                  </div>
                </div>

                {/* When Printing: Clean formatted text */}
                <div className="hidden print:block text-slate-800 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {praiseNote || 'Tuyên dương các thành viên tích cực phát biểu xây dựng bài và duy trì tốt nề nếp kỷ luật.'}
                </div>
              </div>
            </div>
          </div>

          {/* Mục 2: Đề xuất GVCN nhắc nhở */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  2. Đề xuất GVCN nhắc nhở
                </h4>
                <span className="text-[10px] text-slate-400 font-medium print:hidden flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-rose-500" />
                  Ghi chú trực tiếp
                </span>
              </div>

              {/* Danh sách thành viên vi phạm / cần lưu ý tự động */}
              {attentionStudents.length > 0 ? (
                <div className="mb-3 p-2 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-rose-700 mb-1">
                    Thành viên có lỗi vi phạm hoặc điểm thi đua thấp:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    {attentionStudents.map((s) => (
                      <li key={s.studentId}>
                        <strong>{s.studentName}</strong> (Bị trừ: -{s.minusPoints}đ) — Cần nghiêm túc khắc phục nề nếp.
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mb-3 p-2 bg-white rounded-xl border border-slate-200/80 text-emerald-700 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tuần này cả tổ thực hiện tốt nội quy, không có học sinh bị trừ điểm lớn.</span>
                </div>
              )}

              {/* Ô nhập nội dung ghi chú đề xuất GVCN nhắc nhở */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Nội dung ghi chú đề xuất GVCN nhắc nhở:
                </label>
                
                {/* On Screen: Textarea */}
                <div className="print:hidden">
                  <textarea
                    rows={3}
                    value={remindNote}
                    onChange={(e) => handleRemindChange(e.target.value)}
                    placeholder="Nhập nội dung đề xuất GVCN nhắc nhở (ví dụ: Kính đề nghị GVCN nhắc nhở các bạn còn đi học muộn, chưa tập trung nghe giảng môn Toán)..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none leading-relaxed transition"
                  />
                  
                  {/* Quick suggestion chips */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                    <button
                      type="button"
                      onClick={() => appendRemindChip('Nhắc nhở đi học đúng giờ, không đi học muộn')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-[10px] text-rose-700 transition cursor-pointer"
                    >
                      - Đi học muộn
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRemindChip('Nhắc nhở tập trung nghe giảng, không nói chuyện riêng')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-[10px] text-rose-700 transition cursor-pointer"
                    >
                      - Mất trật tự
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRemindChip('Nhắc nhở chuẩn bị bài và làm bài tập đầy đủ trước khi đến lớp')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-[10px] text-rose-700 transition cursor-pointer"
                    >
                      - Chưa soạn bài
                    </button>
                    <button
                      type="button"
                      onClick={() => appendRemindChip('Nhắc nhở thực hiện nghiêm túc quy định đồng phục')}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-[10px] text-rose-700 transition cursor-pointer"
                    >
                      - Sai đồng phục
                    </button>
                  </div>
                </div>

                {/* When Printing: Clean formatted text */}
                <div className="hidden print:block text-slate-800 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {remindNote || 'Kính đề nghị GVCN nhắc nhở thành viên còn đi học muộn, chưa tập trung nghe giảng và cần chuẩn bị bài chu đáo trước khi đến lớp.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 text-center text-xs mt-10 pt-6 border-t border-slate-200 page-break-inside-avoid">
          <div>
            <div className="font-bold text-slate-800 uppercase">
              Ý KIẾN CỦA GIÁO VIÊN CHỦ NHIỆM
            </div>
            <div className="italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-20" />
            <div className="font-bold text-sm text-slate-900">{settings.teacherName}</div>
          </div>

          <div>
            <div className="font-bold text-slate-800 uppercase">
              TỔ TRƯỞNG LẬP BÁO CÁO
            </div>
            <div className="italic text-slate-500 mt-1">(Ký và ghi rõ họ tên)</div>
            <div className="h-20" />
            <div className="font-bold text-sm text-slate-900">{settings.leaderName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
