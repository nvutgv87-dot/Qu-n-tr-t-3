import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup warning:', e);
}

export interface ParsedStudentCandidate {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  role: string;
  notes?: string;
  originalText?: string;
  isDuplicate?: boolean;
}

/**
 * Normalizes and cleans student name:
 * Removes numbers, bullet points, leading/trailing punctuation.
 */
export const cleanStudentName = (raw: string): string => {
  return raw
    .replace(/^[\s\d\.\-\)\(•*#:>|]+/, '') // Remove leading numbers, dots, dashes
    .replace(/[\d\.\-\)\(•*#:>|]+$/, '') // Remove trailing symbols
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();
};

/**
 * Checks if a string looks like a legitimate person name in Vietnam:
 * Contains at least 2 words, doesn't contain blacklisted table header words.
 */
export const isValidVietnameseName = (name: string): boolean => {
  const trimmed = cleanStudentName(name);
  if (!trimmed || trimmed.length < 3 || trimmed.length > 50) return false;

  const words = trimmed.split(' ');
  if (words.length < 2) return false; // Vietnamese names usually have 2-4 words

  const lower = trimmed.toLowerCase();
  const blacklistedKeywords = [
    'họ và tên',
    'họ tên',
    'danh sách',
    'stt',
    'chức vụ',
    'giới tính',
    'ngày sinh',
    'ghi chú',
    'lớp học',
    'năm học',
    'trường thpt',
    'học sinh',
    'tổ viên',
    'tổng cộng',
    'báo cáo',
    'giáo viên',
    'chủ nhiệm',
    'điểm thi đua',
    'xếp loại',
    'kết quả',
    'cộng hòa',
    'độc lập',
    'tự do',
    'hạnh phúc',
    'tuần',
    'tháng',
    'năm',
    'bảng theo dõi',
    'học kỳ',
    'toán',
    'văn',
    'anh',
    'vật lý',
    'hóa học',
  ];

  if (blacklistedKeywords.some((b) => lower.includes(b))) {
    return false;
  }

  // Name shouldn't be only numbers or symbols
  if (!/[a-zA-Zà-ỹÀ-Ỹ]/.test(trimmed)) return false;

  return true;
};

/**
 * Determines gender from hints in the text.
 */
export const extractGender = (text: string): 'Nam' | 'Nữ' => {
  const lower = text.toLowerCase();
  if (/\b(nữ|nu|gái|female|f)\b/i.test(lower)) {
    return 'Nữ';
  }
  return 'Nam';
};

/**
 * Extracts role if indicated (Tổ trưởng, Tổ phó, etc.)
 */
export const extractRole = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('tổ trưởng') || lower.includes('to truong')) return 'Tổ trưởng';
  if (lower.includes('tổ phó') || lower.includes('to pho')) return 'Tổ phó';
  if (lower.includes('lớp trưởng') || lower.includes('lop truong')) return 'Lớp trưởng';
  if (lower.includes('lớp phó') || lower.includes('lop pho')) return 'Lớp phó';
  if (lower.includes('bí thư') || lower.includes('bi thu')) return 'Bí thư';
  if (lower.includes('cờ đỏ') || lower.includes('co do')) return 'Cờ đỏ';
  if (lower.includes('thủ quỹ') || lower.includes('thu quy')) return 'Thủ quỹ';
  return 'Thành viên';
};

/**
 * Parses raw text lines into structured student candidates.
 */
export const parseRawTextToCandidates = (rawText: string): ParsedStudentCandidate[] => {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const candidates: ParsedStudentCandidate[] = [];
  const seenNames = new Set<string>();

  for (const line of lines) {
    // Check if line contains comma, tab, or pipe delimiters
    const parts = line.split(/[,\t|;]+/).map((p) => p.trim()).filter(Boolean);

    let detectedName = '';
    let detectedGender: 'Nam' | 'Nữ' = 'Nam';
    let detectedRole = 'Thành viên';
    let detectedNote = '';

    if (parts.length >= 2) {
      // Look for the part that best fits a name
      for (let i = 0; i < parts.length; i++) {
        const p = cleanStudentName(parts[i]);
        if (isValidVietnameseName(p) && !detectedName) {
          detectedName = p;
        } else if (/\b(nam|nữ|nu)\b/i.test(parts[i])) {
          detectedGender = extractGender(parts[i]);
        } else if (
          parts[i].toLowerCase().includes('tổ trưởng') ||
          parts[i].toLowerCase().includes('tổ phó') ||
          parts[i].toLowerCase().includes('thành viên')
        ) {
          detectedRole = extractRole(parts[i]);
        } else if (p.length > 1 && !/^\d+$/.test(p)) {
          detectedNote = p;
        }
      }
    } else {
      // Single line text: e.g. "1. Nguyễn Hoàng Nam - Nam - Tổ trưởng"
      // or "Trần Công Minh (Tổ trưởng)"
      const roleFromLine = extractRole(line);
      const genderFromLine = extractGender(line);

      // Clean out role and gender text to extract clean name
      let stripped = line
        .replace(/(tổ trưởng|to truong|tổ phó|to pho|thành viên|thanh vien|lớp trưởng|lớp phó|bí thư|thủ quỹ)/gi, '')
        .replace(/\b(nam|nữ|nu)\b/gi, '')
        .replace(/[\(\)\[\]\-–—:]/g, ' ')
        .trim();

      const candidateName = cleanStudentName(stripped);
      if (isValidVietnameseName(candidateName)) {
        detectedName = candidateName;
        detectedGender = genderFromLine;
        detectedRole = roleFromLine;
      }
    }

    if (detectedName && !seenNames.has(detectedName.toLowerCase())) {
      seenNames.add(detectedName.toLowerCase());
      candidates.push({
        id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: detectedName,
        gender: detectedGender,
        role: detectedRole,
        notes: detectedNote,
        originalText: line,
      });
    }
  }

  return candidates;
};

/**
 * Extracts text and tables from Word (.docx) files.
 */
export const parseWordDocx = async (file: File): Promise<ParsedStudentCandidate[]> => {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // 1. Try HTML conversion to get table rows structured
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const html = htmlResult.value;

    if (html.includes('<table') || html.includes('<tr')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = Array.from(doc.querySelectorAll('tr'));
      const candidates: ParsedStudentCandidate[] = [];
      const seen = new Set<string>();

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td, th')).map((c) => (c.textContent || '').trim());
        if (cells.length === 0) continue;

        let detectedName = '';
        let detectedGender: 'Nam' | 'Nữ' = 'Nam';
        let detectedRole = 'Thành viên';
        let detectedNote = '';

        for (const cell of cells) {
          const cleaned = cleanStudentName(cell);
          if (isValidVietnameseName(cleaned) && !detectedName) {
            detectedName = cleaned;
          } else if (/\b(nam|nữ|nu)\b/i.test(cell)) {
            detectedGender = extractGender(cell);
          } else if (
            cell.toLowerCase().includes('tổ') ||
            cell.toLowerCase().includes('lớp') ||
            cell.toLowerCase().includes('trưởng') ||
            cell.toLowerCase().includes('phó')
          ) {
            detectedRole = extractRole(cell);
          } else if (cleaned.length > 2 && !/^\d+$/.test(cleaned) && !cleaned.toLowerCase().includes('stt')) {
            detectedNote = cleaned;
          }
        }

        if (detectedName && !seen.has(detectedName.toLowerCase())) {
          seen.add(detectedName.toLowerCase());
          candidates.push({
            id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: detectedName,
            gender: detectedGender,
            role: detectedRole,
            notes: detectedNote,
            originalText: cells.join(' | '),
          });
        }
      }

      if (candidates.length > 0) return candidates;
    }

    // 2. Fallback to raw text extraction
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    return parseRawTextToCandidates(rawResult.value);
  } catch (err) {
    console.error('Error parsing docx with mammoth:', err);
    // Fallback: try raw text buffer
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const text = textDecoder.decode(arrayBuffer);
    return parseRawTextToCandidates(text);
  }
};

/**
 * Extracts text from older Word (.doc) files.
 */
export const parseWordDoc = async (file: File): Promise<ParsedStudentCandidate[]> => {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // Try mammoth first (some .doc files are actually docx or rtf)
    const rawResult = await mammoth.extractRawText({ arrayBuffer });
    if (rawResult.value && rawResult.value.trim().length > 10) {
      return parseRawTextToCandidates(rawResult.value);
    }
  } catch {
    // Expected to fail on binary .doc
  }

  // Binary .doc text stream extraction (extract printable strings)
  try {
    const uint8 = new Uint8Array(arrayBuffer);
    // Decode UTF-16LE and UTF-8 chunks
    const utf16Decoder = new TextDecoder('utf-16le', { fatal: false });
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

    const utf16Text = utf16Decoder.decode(uint8);
    const utf8Text = utf8Decoder.decode(uint8);

    const candidates1 = parseRawTextToCandidates(utf16Text);
    if (candidates1.length >= 2) return candidates1;

    const candidates2 = parseRawTextToCandidates(utf8Text);
    if (candidates2.length > 0) return candidates2;

    return candidates1;
  } catch (err) {
    console.error('Error extracting from binary .doc:', err);
    return [];
  }
};

/**
 * Extracts text from PDF files using pdfjs-dist.
 */
export const parsePdf = async (file: File): Promise<ParsedStudentCandidate[]> => {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items as Array<{ str?: string; hasEOL?: boolean }>;

      let lineBuffer = '';
      for (const item of pageItems) {
        if (item.str) {
          lineBuffer += item.str + ' ';
        }
        if (item.hasEOL) {
          fullText += lineBuffer.trim() + '\n';
          lineBuffer = '';
        }
      }
      if (lineBuffer.trim()) {
        fullText += lineBuffer.trim() + '\n';
      }
    }

    if (fullText.trim()) {
      return parseRawTextToCandidates(fullText);
    }
  } catch (err) {
    console.warn('PDF.js parse failed, trying fallback stream text decoder:', err);
  }

  // Fallback: extract visible text stream from PDF buffer
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawPdf = decoder.decode(arrayBuffer);
    // Find text inside parentheses in BT ... ET blocks: (Họ tên) Tj
    const matches: string[] = [];
    const textRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = textRegex.exec(rawPdf)) !== null) {
      if (match[1] && match[1].length > 1) {
        matches.push(match[1]);
      }
    }

    if (matches.length > 0) {
      return parseRawTextToCandidates(matches.join('\n'));
    }
  } catch (e) {
    console.error('Fallback PDF decoding failed:', e);
  }

  return [];
};

/**
 * Master parser that dispatches to the correct extractor based on file extension.
 */
export const parseMembersFile = async (file: File): Promise<ParsedStudentCandidate[]> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'docx') {
    return parseWordDocx(file);
  } else if (ext === 'doc') {
    return parseWordDoc(file);
  } else if (ext === 'pdf') {
    return parsePdf(file);
  } else if (ext === 'txt' || ext === 'csv' || ext === 'tsv') {
    const text = await file.text();
    return parseRawTextToCandidates(text);
  } else {
    // Try word docx or text as generic
    try {
      return await parseWordDocx(file);
    } catch {
      const text = await file.text();
      return parseRawTextToCandidates(text);
    }
  }
};
