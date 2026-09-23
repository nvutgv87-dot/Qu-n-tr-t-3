export type TeamId = 'Tổ 1' | 'Tổ 2' | 'Tổ 3' | 'Tổ 4' | string;

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';

export interface Student {
  id: string;
  name: string;
  gender?: 'Nam' | 'Nữ';
  role?: string; // e.g., "Tổ trưởng", "Tổ phó", "Thành viên"
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export type BehaviorGroup = 
  | 'violation'       // Nhóm ❌ Vi phạm
  | 'reminder'        // Nhóm ⚠️ Nhắc nhở
  | 'positive'        // Nhóm ✅ Tích cực
  | 'creative'        // Nhóm 🌟 Sản phẩm/Hoạt động nổi bật
  | 'individual';     // Nhóm 🎯 Cá nhân

export interface BehaviorCriterion {
  id: string;
  group: BehaviorGroup;
  title: string;
  points: number; // positive or negative, e.g. -0.25 or +0.25
  description?: string;
}

export interface PointRecord {
  id: string;
  studentId: string;
  criterionId?: string;
  group: BehaviorGroup;
  title: string;
  points: number; // e.g. +0.25 or -0.25
  date: string; // YYYY-MM-DD
  note?: string;
  recordedBy: string; // Tên tổ trưởng
  createdAt: string; // ISO string
}

export interface AppSettings {
  className: string;
  teamName: string;
  leaderName: string;
  teacherName: string;
  schoolYear: string;
  schoolName: string;
}

export interface WeeklyScoreSummary {
  studentId: string;
  studentName: string;
  plusPoints: number;
  minusPoints: number;
  netScore: number;
  attendanceCount: {
    present: number;
    absent_excused: number;
    absent_unexcused: number;
    late: number;
  };
  status: 'Tốt' | 'Cần chú ý' | 'Xuất sắc';
}
