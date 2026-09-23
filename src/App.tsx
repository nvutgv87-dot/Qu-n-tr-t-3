/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  AttendanceRecord,
  AttendanceStatus,
  PointRecord,
  Student,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadStudents,
  saveStudents,
  loadPointRecords,
  savePointRecords,
  loadAttendanceRecords,
  saveAttendanceRecords,
  resetAllToDemo,
  calculateScoreSummary,
  getCurrentWeekRange,
} from './services/storage';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MembersView } from './components/MembersView';
import { AttendanceView } from './components/AttendanceView';
import { BehaviorView } from './components/BehaviorView';
import { ScoreboardView } from './components/ScoreboardView';
import { HistoryView } from './components/HistoryView';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [pointRecords, setPointRecords] = useState<PointRecord[]>(loadPointRecords);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(loadAttendanceRecords);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to storage
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateTeam = (newTeam: string) => {
    const updated = { ...settings, teamName: newTeam };
    handleUpdateSettings(updated);
    showToast(`Đã chuyển sang ${newTeam}`, 'info');
  };

  // Student handlers
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `hs_${Date.now()}`,
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudents(updated);
    showToast(`Đã thêm học sinh ${studentData.name} vào tổ!`, 'success');
  };

  const handleImportStudents = (newStudentsData: Omit<Student, 'id'>[], replaceAll: boolean) => {
    const timestamp = Date.now();
    const formattedNewStudents: Student[] = newStudentsData.map((data, index) => ({
      ...data,
      id: `hs_${timestamp}_${index}`,
    }));

    let finalStudents: Student[];
    if (replaceAll) {
      finalStudents = formattedNewStudents;
      showToast(`Đã thay thế toàn bộ danh sách tổ bằng ${formattedNewStudents.length} thành viên!`, 'success');
    } else {
      finalStudents = [...students, ...formattedNewStudents];
      showToast(`Đã thêm ${formattedNewStudents.length} thành viên mới vào tổ!`, 'success');
    }

    setStudents(finalStudents);
    saveStudents(finalStudents);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    saveStudents(updated);
    showToast(`Đã cập nhật thông tin học sinh ${updatedStudent.name}`, 'success');
  };

  const handleDeleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);
    showToast(`Đã xóa học sinh ${target?.name || ''}`, 'info');
  };

  // Attendance handlers
  const handleSaveAttendance = (
    records: AttendanceRecord[],
    autoDeductDemerits: boolean,
    demeritCandidates: { studentId: string; status: AttendanceStatus; note: string }[]
  ) => {
    // Replace existing records for these students on this date
    const date = records[0]?.date;
    if (!date) return;

    const filtered = attendanceRecords.filter((a) => a.date !== date);
    const updatedAttendance = [...filtered, ...records];
    setAttendanceRecords(updatedAttendance);
    saveAttendanceRecords(updatedAttendance);

    // Auto deduct demerits if selected and candidates exist
    if (autoDeductDemerits && demeritCandidates.length > 0) {
      const newPoints: PointRecord[] = [];
      demeritCandidates.forEach((cand) => {
        const title = cand.status === 'late' ? 'Đi học trễ' : 'Vắng không phép';
        // Avoid duplicate point record for same student, same date, same reason
        const alreadyExists = pointRecords.some(
          (p) => p.studentId === cand.studentId && p.date === date && p.title === title
        );
        if (!alreadyExists) {
          newPoints.push({
            id: `pt_att_${date}_${cand.studentId}_${Date.now()}`,
            studentId: cand.studentId,
            group: 'violation',
            title,
            points: -0.25,
            date,
            note: cand.note || `Tự động tạo từ điểm danh ngày ${date}`,
            recordedBy: settings.leaderName,
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newPoints.length > 0) {
        const updatedPoints = [...pointRecords, ...newPoints];
        setPointRecords(updatedPoints);
        savePointRecords(updatedPoints);
        showToast(
          `Đã lưu điểm danh và tự động áp dụng ${newPoints.length} lượt trừ điểm chuyên cần (-0.25đ)!`,
          'success'
        );
        return;
      }
    }

    showToast(`Đã lưu điểm danh thành công cho ngày ${date}!`, 'success');
  };

  // Point records handlers
  const handleAddPointRecord = (recordData: Omit<PointRecord, 'id' | 'createdAt'>) => {
    const newRecord: PointRecord = {
      ...recordData,
      id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...pointRecords];
    setPointRecords(updated);
    savePointRecords(updated);
    showToast(
      `Đã ghi nhận: ${recordData.title} (${recordData.points > 0 ? '+' : ''}${recordData.points}đ)`,
      'success'
    );
  };

  const handleUpdatePointRecord = (updatedRecord: PointRecord) => {
    const updated = pointRecords.map((p) => (p.id === updatedRecord.id ? updatedRecord : p));
    setPointRecords(updated);
    savePointRecords(updated);
    showToast(`Đã cập nhật lượt ghi nhận "${updatedRecord.title}"`, 'success');
  };

  const handleDeletePointRecord = (id: string) => {
    const updated = pointRecords.filter((p) => p.id !== id);
    setPointRecords(updated);
    savePointRecords(updated);
    showToast('Đã xóa lượt ghi nhận khỏi danh sách!', 'info');
  };

  // Reset to demo data
  const handleResetDemo = () => {
    resetAllToDemo();
    setSettings(loadSettings());
    setStudents(loadStudents());
    setPointRecords(loadPointRecords());
    setAttendanceRecords(loadAttendanceRecords());
  };

  const handleDataImported = () => {
    setSettings(loadSettings());
    setStudents(loadStudents());
    setPointRecords(loadPointRecords());
    setAttendanceRecords(loadAttendanceRecords());
  };

  // Current week score summaries for dashboard & members
  const weekRange = getCurrentWeekRange();
  const scoreSummaries = calculateScoreSummary(
    students,
    pointRecords,
    attendanceRecords,
    weekRange.start,
    weekRange.end
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* App Header */}
      <Header
        settings={settings}
        onUpdateTeam={handleUpdateTeam}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Navigation (Sidebar on Desktop, Mobile tabs on phone) */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          memberCount={students.length}
        />

        {/* View Router */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              settings={settings}
              students={students}
              scoreSummaries={scoreSummaries}
              pointRecords={pointRecords}
              attendanceRecords={attendanceRecords}
              onNavigate={setActiveTab}
              onOpenQuickRecord={() => setActiveTab('behavior')}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              students={students}
              scoreSummaries={scoreSummaries}
              onAddStudent={handleAddStudent}
              onImportStudents={handleImportStudents}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              students={students}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeTab === 'behavior' && (
            <BehaviorView
              students={students}
              pointRecords={pointRecords}
              leaderName={settings.leaderName}
              onAddPointRecord={handleAddPointRecord}
              onUpdatePointRecord={handleUpdatePointRecord}
              onDeletePointRecord={handleDeletePointRecord}
            />
          )}

          {activeTab === 'scoreboard' && (
            <ScoreboardView
              students={students}
              pointRecords={pointRecords}
              attendanceRecords={attendanceRecords}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              students={students}
              pointRecords={pointRecords}
              attendanceRecords={attendanceRecords}
              leaderName={settings.leaderName}
              onDeletePointRecord={handleDeletePointRecord}
            />
          )}

          {activeTab === 'report' && (
            <ReportView
              settings={settings}
              students={students}
              pointRecords={pointRecords}
              attendanceRecords={attendanceRecords}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>QUẢN LÝ TỔ — THEO DÕI THI ĐUA LỚP {settings.className}</strong> &bull; {settings.teamName} &bull; Tổ trưởng: {settings.leaderName}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Dữ liệu lưu an toàn trong trình duyệt (Offline)</span>
            <span>&bull;</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Cài đặt & Sao lưu
            </button>
          </div>
        </div>
      </footer>

      {/* Settings & Backup Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          students={students}
          points={pointRecords}
          attendance={attendanceRecords}
          onSaveSettings={handleUpdateSettings}
          onResetDemo={handleResetDemo}
          onDataImported={handleDataImported}
          onClose={() => setIsSettingsOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
