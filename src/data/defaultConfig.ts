import { AppSettings, BehaviorCriterion, Student, PointRecord, AttendanceRecord } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  className: '11A1',
  teamName: 'Tổ 3',
  leaderName: 'Trần Công Minh',
  teacherName: 'Nguyễn Văn Út',
  schoolYear: '2026 - 2027',
  schoolName: 'Trường THPT Chuyên / THPT Chu Văn An',
};

export const AVAILABLE_TEAMS = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];

export const BEHAVIOR_CRITERIA: BehaviorCriterion[] = [
  // Nhóm ❌ Vi phạm (trừ điểm)
  {
    id: 'v_late',
    group: 'violation',
    title: 'Đi học trễ',
    points: -0.25,
    description: 'Đến lớp sau tiếng trống hoặc trễ sinh hoạt 15 phút đầu giờ',
  },
  {
    id: 'v_homework',
    group: 'violation',
    title: 'Không làm bài',
    points: -0.25,
    description: 'Chưa chuẩn bị bài tập về nhà theo yêu cầu giáo viên',
  },
  {
    id: 'v_talking',
    group: 'violation',
    title: 'Nói chuyện riêng',
    points: -0.25,
    description: 'Mất trật tự trong giờ học hoặc trong tiết sinh hoạt',
  },
  {
    id: 'v_discipline',
    group: 'violation',
    title: 'Vi phạm nội quy lớp',
    points: -0.25,
    description: 'Sai đồng phục, phù hiệu, sử dụng điện thoại khi chưa cho phép',
  },
  {
    id: 'v_language',
    group: 'violation',
    title: 'Ngôn từ tiêu cực',
    points: -0.25,
    description: 'Dùng từ ngữ thiếu chuẩn mực, phát ngôn không phù hợp học sinh',
  },
  {
    id: 'v_other',
    group: 'violation',
    title: 'Khác (tổ trưởng ghi rõ lý do)',
    points: -0.25,
    description: 'Hành vi vi phạm khác được ghi rõ vào phần ghi chú',
  },

  // Nhóm ⚠️ Nhắc nhở
  {
    id: 'r_isolation',
    group: 'reminder',
    title: 'Có dấu hiệu cô lập bạn',
    points: -0.25,
    description: 'Thiếu hòa đồng, có hành vi bài xích hoặc cô lập thành viên trong lớp',
  },

  // Nhóm ✅ Tích cực (cộng điểm)
  {
    id: 'p_participation',
    group: 'positive',
    title: 'Phát biểu xây dựng bài (đủ 5 lần)',
    points: 0.25,
    description: 'Hăng hái đóng góp ý kiến xây dựng bài học đạt chỉ tiêu',
  },
  {
    id: 'p_help',
    group: 'positive',
    title: 'Giúp đỡ bạn học',
    points: 0.25,
    description: 'Hỗ trợ bạn yếu trong học tập, đôi bạn cùng tiến',
  },

  // Nhóm 🌟 Sản phẩm/Hoạt động nổi bật
  {
    id: 'c_product',
    group: 'creative',
    title: 'Làm sản phẩm học tập (video, bài viết...)',
    points: 0.25,
    description: 'Chủ động hoàn thành dự án học tập, infographic, video thuyết trình chất lượng',
  },
  {
    id: 'c_content',
    group: 'creative',
    title: 'Sáng tạo nội dung (âm nhạc, hình ảnh...)',
    points: 0.25,
    description: 'Đóng góp sản phẩm nghệ thuật, trang trí lớp, phong trào văn thể mỹ',
  },

  // Nhóm 🎯 Cá nhân
  {
    id: 'i_commended',
    group: 'individual',
    title: 'Được tuyên dương trong tuần',
    points: 0.25,
    description: 'Được giáo viên bộ môn hoặc GVCN khen ngợi đột xuất',
  },
];

export const DEMO_STUDENTS: Student[] = [
  { id: 'hs_01', name: 'Trần Công Minh', gender: 'Nam', role: 'Tổ trưởng' },
  { id: 'hs_02', name: 'Trần Thị Thu Hà', gender: 'Nữ', role: 'Tổ phó' },
  { id: 'hs_03', name: 'Lê Minh Khôi', gender: 'Nam', role: 'Thành viên' },
  { id: 'hs_04', name: 'Phạm Bảo Ngọc', gender: 'Nữ', role: 'Thành viên' },
  { id: 'hs_05', name: 'Vũ Đức Trọng', gender: 'Nam', role: 'Thành viên' },
  { id: 'hs_06', name: 'Đặng Mai Phương', gender: 'Nữ', role: 'Thành viên' },
  { id: 'hs_07', name: 'Hoàng Anh Tuấn', gender: 'Nam', role: 'Thành viên' },
  { id: 'hs_08', name: 'Bùi Khánh Linh', gender: 'Nữ', role: 'Thành viên' },
  { id: 'hs_09', name: 'Ngô Quốc Huy', gender: 'Nam', role: 'Thành viên' },
];

export const BEHAVIOR_GROUP_META: Record<
  string,
  { label: string; badge: string; color: string; bg: string; border: string; icon: string }
> = {
  violation: {
    label: 'Nhóm ❌ Vi phạm (trừ điểm)',
    badge: 'Vi phạm',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'AlertCircle',
  },
  reminder: {
    label: 'Nhóm ⚠️ Nhắc nhở',
    badge: 'Nhắc nhở',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'AlertTriangle',
  },
  positive: {
    label: 'Nhóm ✅ Tích cực (cộng điểm)',
    badge: 'Tích cực',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'CheckCircle2',
  },
  creative: {
    label: 'Nhóm 🌟 Sản phẩm / Hoạt động',
    badge: 'Sáng tạo',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'Sparkles',
  },
  individual: {
    label: 'Nhóm 🎯 Cá nhân tuyên dương',
    badge: 'Tuyên dương',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'Award',
  },
};

// Generate helper dates around today
export const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getOffsetDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const getDemoPointRecords = (): PointRecord[] => [
  {
    id: 'pt_01',
    studentId: 'hs_04', // Phạm Bảo Ngọc
    criterionId: 'p_participation',
    group: 'positive',
    title: 'Phát biểu xây dựng bài (đủ 5 lần)',
    points: 0.25,
    date: getOffsetDateStr(-1),
    note: 'Tích cực trong tiết Toán & Hóa',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pt_02',
    studentId: 'hs_02', // Trần Thị Thu Hà
    criterionId: 'c_product',
    group: 'creative',
    title: 'Làm sản phẩm học tập (video, bài viết...)',
    points: 0.25,
    date: getOffsetDateStr(-2),
    note: 'Làm poster thuyết trình môn Lịch sử xuất sắc',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'pt_03',
    studentId: 'hs_05', // Vũ Đức Trọng
    criterionId: 'v_talking',
    group: 'violation',
    title: 'Nói chuyện riêng',
    points: -0.25,
    date: getOffsetDateStr(-1),
    note: 'Bị thầy dạy Lý nhắc nhở 2 lần',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date(Date.now() - 86000000).toISOString(),
  },
  {
    id: 'pt_04',
    studentId: 'hs_05', // Vũ Đức Trọng
    criterionId: 'v_homework',
    group: 'violation',
    title: 'Không làm bài',
    points: -0.25,
    date: getOffsetDateStr(0),
    note: 'Quên vở bài tập Ngữ văn',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt_05',
    studentId: 'hs_03', // Lê Minh Khôi
    criterionId: 'p_help',
    group: 'positive',
    title: 'Giúp đỡ bạn học',
    points: 0.25,
    date: getOffsetDateStr(-2),
    note: 'Kèm bạn Huy giải bài tập Toán 15 phút đầu giờ',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date(Date.now() - 170000000).toISOString(),
  },
  {
    id: 'pt_06',
    studentId: 'hs_09', // Ngô Quốc Huy
    criterionId: 'v_late',
    group: 'violation',
    title: 'Đi học trễ',
    points: -0.25,
    date: getOffsetDateStr(0),
    note: 'Trễ sinh hoạt 15 phút đầu giờ',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pt_07',
    studentId: 'hs_08', // Bùi Khánh Linh
    criterionId: 'i_commended',
    group: 'individual',
    title: 'Được tuyên dương trong tuần',
    points: 0.25,
    date: getOffsetDateStr(-1),
    note: 'Đạt điểm 10 kiểm tra miệng môn Tiếng Anh',
    recordedBy: 'Trần Công Minh',
    createdAt: new Date(Date.now() - 80000000).toISOString(),
  },
];

export const getDemoAttendanceRecords = (): AttendanceRecord[] => {
  const today = getTodayStr();
  const yesterday = getOffsetDateStr(-1);

  return [
    // Today
    { id: 'att_1_1', date: today, studentId: 'hs_01', status: 'present' },
    { id: 'att_1_2', date: today, studentId: 'hs_02', status: 'present' },
    { id: 'att_1_3', date: today, studentId: 'hs_03', status: 'present' },
    { id: 'att_1_4', date: today, studentId: 'hs_04', status: 'present' },
    { id: 'att_1_5', date: today, studentId: 'hs_05', status: 'present' },
    { id: 'att_1_6', date: today, studentId: 'hs_06', status: 'absent_excused', note: 'Phụ huynh có gọi điện xin phép' },
    { id: 'att_1_7', date: today, studentId: 'hs_07', status: 'present' },
    { id: 'att_1_8', date: today, studentId: 'hs_08', status: 'present' },
    { id: 'att_1_9', date: today, studentId: 'hs_09', status: 'late', note: 'Trễ 10 phút vì hỏng xe' },

    // Yesterday
    { id: 'att_2_1', date: yesterday, studentId: 'hs_01', status: 'present' },
    { id: 'att_2_2', date: yesterday, studentId: 'hs_02', status: 'present' },
    { id: 'att_2_3', date: yesterday, studentId: 'hs_03', status: 'present' },
    { id: 'att_2_4', date: yesterday, studentId: 'hs_04', status: 'present' },
    { id: 'att_2_5', date: yesterday, studentId: 'hs_05', status: 'present' },
    { id: 'att_2_6', date: yesterday, studentId: 'hs_06', status: 'present' },
    { id: 'att_2_7', date: yesterday, studentId: 'hs_07', status: 'present' },
    { id: 'att_2_8', date: yesterday, studentId: 'hs_08', status: 'present' },
    { id: 'att_2_9', date: yesterday, studentId: 'hs_09', status: 'present' },
  ];
};
