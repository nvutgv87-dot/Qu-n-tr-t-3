import { AppSettings, AttendanceRecord, PointRecord, Student } from '../types';

/**
 * Generates a complete standalone single-file HTML version containing HTML, CSS, and JS
 * that can run offline without any dependencies.
 */
export const generateStandaloneHTML = (
  settings: AppSettings,
  students: Student[],
  points: PointRecord[],
  attendance: AttendanceRecord[],
  praiseNote?: string,
  remindNote?: string
): string => {
  const dataJSON = JSON.stringify({
    settings,
    students,
    points,
    attendance,
    praiseNote,
    remindNote,
  });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BÁO CÁO THI ĐUA - ${settings.teamName} - ${settings.className}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1d4ed8;
      --primary-light: #eff6ff;
      --success: #15803d;
      --success-light: #f0fdf4;
      --danger: #b91c1c;
      --danger-light: #fef2f2;
      --warning: #b45309;
      --warning-light: #fffbeb;
      --text: #1e293b;
      --border: #e2e8f0;
      --bg: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .school-info h1 {
      font-size: 20px;
      color: var(--primary);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .school-info p {
      font-size: 14px;
      color: #64748b;
    }
    .meta-box {
      background: var(--primary-light);
      border: 1px solid #bfdbfe;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.6;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-card .val {
      font-size: 26px;
      font-weight: 700;
      margin-top: 4px;
    }
    .stat-card.plus .val { color: var(--success); }
    .stat-card.minus .val { color: var(--danger); }
    .stat-card.net .val { color: var(--primary); }
    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 24px 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    tr:nth-child(even) { background: #fafafa; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background: var(--success-light); color: var(--success); }
    .badge-danger { background: var(--danger-light); color: var(--danger); }
    .badge-warning { background: var(--warning-light); color: var(--warning); }
    .badge-primary { background: var(--primary-light); color: var(--primary); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-top: 40px;
      padding-top: 24px;
      text-align: center;
      page-break-inside: avoid;
    }
    .sign-col p { margin-bottom: 80px; }
    .sign-name { font-weight: 700; }
    .btn-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }
    .btn:hover { background: #1e40af; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; }
      .btn-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="btn-bar">
      <button class="btn" onclick="window.print()">🖨️ In báo cáo (Print / PDF)</button>
      <button class="btn" style="background:#475569" onclick="window.close()">Đóng</button>
    </div>

    <div class="header">
      <div class="school-info">
        <h1>BÁO CÁO THI ĐUA HÀNG TUẦN</h1>
        <p><strong>Lớp:</strong> ${settings.className} &bull; <strong>Tổ:</strong> ${settings.teamName}</p>
        <p><strong>Năm học:</strong> ${settings.schoolYear}</p>
      </div>
      <div class="meta-box">
        <div><strong>Tổ trưởng:</strong> ${settings.leaderName}</div>
        <div><strong>GVCN:</strong> ${settings.teacherName}</div>
        <div><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
      </div>
    </div>

    <div class="section-title">📊 BẢNG TỔNG HỢP ĐIỂM THI ĐUA THÀNH VIÊN</div>
    <table>
      <thead>
        <tr>
          <th class="text-center" style="width: 50px;">STT</th>
          <th>Họ và tên</th>
          <th class="text-center">Chức vụ</th>
          <th class="text-center" style="color:var(--success);">Điểm cộng (+)</th>
          <th class="text-center" style="color:var(--danger);">Điểm trừ (−)</th>
          <th class="text-center">Điểm tổng</th>
          <th class="text-center">Xếp loại</th>
        </tr>
      </thead>
      <tbody>
        ${students
          .map((s, idx) => {
            const studentPts = points.filter((p) => p.studentId === s.id);
            const plus = studentPts.filter((p) => p.points > 0).reduce((a, b) => a + b.points, 0);
            const minus = studentPts.filter((p) => p.points < 0).reduce((a, b) => a + Math.abs(b.points), 0);
            const net = Number((plus - minus).toFixed(2));
            const status = net >= 0.75 ? 'Xuất sắc' : net < 0 || minus >= 0.5 ? 'Cần chú ý' : 'Tốt';
            const badgeClass = status === 'Xuất sắc' ? 'badge-primary' : status === 'Tốt' ? 'badge-success' : 'badge-danger';
            return `<tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${s.name}</strong></td>
              <td class="text-center">${s.role || 'Thành viên'}</td>
              <td class="text-center" style="color:var(--success); font-weight:600;">+${plus.toFixed(2)}</td>
              <td class="text-center" style="color:var(--danger); font-weight:600;">-${minus.toFixed(2)}</td>
              <td class="text-center" style="font-weight:700; ${net >= 0 ? 'color:var(--success)' : 'color:var(--danger)'}">
                ${net > 0 ? '+' + net.toFixed(2) : net.toFixed(2)}
              </td>
              <td class="text-center"><span class="badge ${badgeClass}">${status}</span></td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>

    <div class="section-title">📝 CHI TIẾT CÁC LƯỢT GHI NHẬN HÀNH VI</div>
    <table>
      <thead>
        <tr>
          <th style="width: 100px;">Ngày</th>
          <th>Học sinh</th>
          <th>Nội dung</th>
          <th class="text-center" style="width: 80px;">Điểm</th>
          <th>Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        ${points.length === 0 ? '<tr><td colspan="5" class="text-center">Chưa có lượt ghi nhận nào</td></tr>' : 
          points.slice(0, 25).map(p => {
            const student = students.find(s => s.id === p.studentId);
            return `<tr>
              <td>${p.date}</td>
              <td><strong>${student?.name || 'Học sinh'}</strong></td>
              <td>${p.title}</td>
              <td class="text-center" style="font-weight:600; ${p.points >= 0 ? 'color:var(--success)' : 'color:var(--danger)'}">
                ${p.points > 0 ? '+' + p.points : p.points}
              </td>
              <td>${p.note || '—'}</td>
            </tr>`;
          }).join('')}
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; page-break-inside: avoid;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
        <h4 style="color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">🌟 1. Đề xuất tuyên dương tuần</h4>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${praiseNote || 'Tuyên dương các thành viên tích cực phát biểu xây dựng bài, đi học đúng giờ và hỗ trợ bạn bè trong học tập.'}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px;">
        <h4 style="color: #0f172a; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">⚠️ 2. Đề xuất GVCN nhắc nhở</h4>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${remindNote || 'Kính đề nghị GVCN nhắc nhở thành viên còn đi học muộn, chưa tập trung nghe giảng và cần chuẩn bị bài chu đáo trước khi đến lớp.'}</p>
      </div>
    </div>

    <div class="signatures">
      <div class="sign-col">
        <p><strong>Ý KIẾN GIÁO VIÊN CHỦ NHIỆM</strong><br><em>(Ký và ghi rõ họ tên)</em></p>
        <div class="sign-name">${settings.teacherName}</div>
      </div>
      <div class="sign-col">
        <p><strong>TỔ TRƯỞNG LẬP BÁO CÁO</strong><br><em>(Ký và ghi rõ họ tên)</em></p>
        <div class="sign-name">${settings.leaderName}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};
