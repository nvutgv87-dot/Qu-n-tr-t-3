import { AppSettings, AttendanceRecord, PointRecord, Student, WeeklyScoreSummary } from '../types';
import {
  DEFAULT_SETTINGS,
  DEMO_STUDENTS,
  getDemoAttendanceRecords,
  getDemoPointRecords,
  getTodayStr,
} from '../data/defaultConfig';

const STORAGE_KEYS = {
  SETTINGS: 'quanlyto_settings_v1',
  STUDENTS: 'quanlyto_students_v1',
  POINTS: 'quanlyto_points_v1',
  ATTENDANCE: 'quanlyto_attendance_v1',
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old defaults if present
      if (
        parsed.teamName === 'Tổ 2' ||
        parsed.leaderName === 'Nguyễn Hoàng Nam' ||
        parsed.teacherName === 'Cô Trần Thị Mai Phương' ||
        parsed.teacherName === 'Thầy Nguyễn Văn Út' ||
        parsed.schoolYear === '2025 - 2026'
      ) {
        if (parsed.teamName === 'Tổ 2') parsed.teamName = 'Tổ 3';
        if (parsed.leaderName === 'Nguyễn Hoàng Nam') parsed.leaderName = 'Trần Công Minh';
        if (
          parsed.teacherName === 'Cô Trần Thị Mai Phương' ||
          parsed.teacherName === 'Thầy Nguyễn Văn Út'
        ) {
          parsed.teacherName = 'Nguyễn Văn Út';
        }
        if (parsed.schoolYear === '2025 - 2026') parsed.schoolYear = '2026 - 2027';
        saveSettings(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const loadStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let changed = false;
        const updated = parsed.map((s: Student) => {
          if (s.id === 'hs_01' && s.name === 'Nguyễn Hoàng Nam') {
            changed = true;
            return { ...s, name: 'Trần Công Minh' };
          }
          return s;
        });
        if (changed) {
          saveStudents(updated);
          return updated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading students', e);
  }
  // Initialize default
  saveStudents(DEMO_STUDENTS);
  return DEMO_STUDENTS;
};

export const saveStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students', e);
  }
};

export const loadPointRecords = (): PointRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POINTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        const updated = parsed.map((p: PointRecord) => {
          if (p.recordedBy === 'Nguyễn Hoàng Nam') {
            changed = true;
            return { ...p, recordedBy: 'Trần Công Minh' };
          }
          return p;
        });
        if (changed) {
          savePointRecords(updated);
          return updated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading points', e);
  }
  // Initialize default demo points
  const demoPts = getDemoPointRecords();
  savePointRecords(demoPts);
  return demoPts;
};

export const savePointRecords = (records: PointRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving points', e);
  }
};

export const loadAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading attendance', e);
  }
  const demoAtt = getDemoAttendanceRecords();
  saveAttendanceRecords(demoAtt);
  return demoAtt;
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving attendance', e);
  }
};

export const resetAllToDemo = () => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEMO_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(getDemoPointRecords()));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(getDemoAttendanceRecords()));
};

export const exportAllDataJSON = () => {
  return JSON.stringify({
    settings: loadSettings(),
    students: loadStudents(),
    points: loadPointRecords(),
    attendance: loadAttendanceRecords(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  }, null, 2);
};

export const importAllDataJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.students && Array.isArray(data.students)) {
      if (data.settings) saveSettings(data.settings);
      saveStudents(data.students);
      if (Array.isArray(data.points)) savePointRecords(data.points);
      if (Array.isArray(data.attendance)) saveAttendanceRecords(data.attendance);
      return true;
    }
  } catch (e) {
    console.error('Failed to import JSON data', e);
  }
  return false;
};

/**
 * Get date range for "Tuần này" (Monday to Saturday/Sunday)
 */
export const getCurrentWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday
  // In VN schools, week starts on Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
};

export const getLastWeekRange = (): { start: string; end: string } => {
  const currentWeek = getCurrentWeekRange();
  const startD = new Date(currentWeek.start);
  startD.setDate(startD.getDate() - 7);
  const endD = new Date(currentWeek.end);
  endD.setDate(endD.getDate() - 7);

  return {
    start: startD.toISOString().split('T')[0],
    end: endD.toISOString().split('T')[0],
  };
};

/**
 * Summarizes points and attendance for each student in a given date range
 */
export const calculateScoreSummary = (
  students: Student[],
  pointRecords: PointRecord[],
  attendanceRecords: AttendanceRecord[],
  startDate?: string,
  endDate?: string
): WeeklyScoreSummary[] => {
  return students.map((student) => {
    // Filter points in date range if specified
    const studentPoints = pointRecords.filter((rec) => {
      if (rec.studentId !== student.id) return false;
      if (startDate && rec.date < startDate) return false;
      if (endDate && rec.date > endDate) return false;
      return true;
    });

    let plusPoints = 0;
    let minusPoints = 0;

    studentPoints.forEach((p) => {
      if (p.points > 0) {
        plusPoints += p.points;
      } else {
        minusPoints += Math.abs(p.points);
      }
    });

    const netScore = Number((plusPoints - minusPoints).toFixed(2));

    // Attendance stats
    const studentAtt = attendanceRecords.filter((rec) => {
      if (rec.studentId !== student.id) return false;
      if (startDate && rec.date < startDate) return false;
      if (endDate && rec.date > endDate) return false;
      return true;
    });

    const attendanceCount = {
      present: studentAtt.filter((a) => a.status === 'present').length,
      absent_excused: studentAtt.filter((a) => a.status === 'absent_excused').length,
      absent_unexcused: studentAtt.filter((a) => a.status === 'absent_unexcused').length,
      late: studentAtt.filter((a) => a.status === 'late').length,
    };

    let status: 'Tốt' | 'Cần chú ý' | 'Xuất sắc' = 'Tốt';
    if (netScore >= 0.75) {
      status = 'Xuất sắc';
    } else if (netScore < 0 || minusPoints >= 0.5 || attendanceCount.absent_unexcused > 0 || attendanceCount.late > 1) {
      status = 'Cần chú ý';
    }

    return {
      studentId: student.id,
      studentName: student.name,
      plusPoints: Number(plusPoints.toFixed(2)),
      minusPoints: Number(minusPoints.toFixed(2)),
      netScore,
      attendanceCount,
      status,
    };
  });
};
