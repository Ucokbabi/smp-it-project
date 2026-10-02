export type UserRole = 'admin' | 'guru' | 'siswa';

export interface UserBiodata {
  fullName: string;
  identifier: string; // NIP for teacher/admin, NISN for student
  email: string;
  phone: string;
  address: string;
  birthPlace: string;
  birthDate: string;
  gender: 'L' | 'P';
  className?: string; // For student
  subject?: string; // For teacher
  position?: string; // For admin/teacher
  photoUrl: string;
  faceRegistered: boolean;
  facePhotoUrl?: string;
  faceRegisteredAt?: string;
  faceEmbeddingHash?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  biodata: UserBiodata;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  type: 'multiple_choice' | 'essay';
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  scoreWeight: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  classGrade: string; // e.g., 'Kelas 7', 'Kelas 8', 'Kelas 9'
  teacherId: string;
  teacherName: string;
  token: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  questions: Question[];
  totalQuestions: number;
  isEncrypted: boolean;
  allowRandomize: boolean;
  maxViolationsAllowed: number;
}

export type ServerStatus = 'online' | 'emergency_stopped' | 'maintenance';

export interface ServerControlState {
  status: ServerStatus;
  stoppedAt?: string;
  stoppedBy?: string;
  reason?: string;
  autoLockSessions: boolean;
}

export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  studentClass: string;
  answers: Record<string, string>; // questionId -> answer
  doubtfulAnswers: Record<string, boolean>; // questionId -> boolean
  startedAt: string;
  submittedAt?: string;
  status: 'ongoing' | 'submitted' | 'locked_cheating' | 'emergency_stopped';
  score?: number;
  violationCount: number;
  lastHeartbeat: string;
  suspiciousLogs: SuspiciousEvent[];
}

export interface SuspiciousEvent {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  type: 'fullscreen_exit' | 'tab_switched' | 'window_blur' | 'face_lost' | 'multiple_faces' | 'devtools_attempt' | 'copy_paste_attempt';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: 'guru' | 'siswa';
  identifier: string; // NIP / NISN
  className?: string; // For siswa
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  type: 'masuk' | 'pulang';
  status: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';
  method: 'face_recognition' | 'manual';
  faceVerified: boolean;
  faceCaptureUrl?: string;
  latitude?: number;
  longitude?: number;
  distanceFromSchoolMeters?: number;
  isWithinRadius?: boolean;
  notes?: string;
}

export interface SchoolCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  maxRadiusMeters: number;
}
