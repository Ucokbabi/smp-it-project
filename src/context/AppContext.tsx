import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Exam,
  ExamSession,
  AttendanceRecord,
  SuspiciousEvent,
  SchoolCoordinates,
  ServerControlState,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EXAMS,
  INITIAL_ATTENDANCE,
  INITIAL_SUSPICIOUS_EVENTS,
  SCHOOL_INFO,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  students: User[];
  teachers: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  deleteUserFace: (userId: string) => void;
  registerUserFace: (userId: string, photoUrl: string, embeddingHash: string) => void;
  
  // Exams
  exams: Exam[];
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  
  // Exam Sessions
  examSessions: ExamSession[];
  startExamSession: (examId: string, student: User) => ExamSession;
  updateSessionAnswer: (sessionId: string, questionId: string, answer: string, doubtful?: boolean) => void;
  submitExamSession: (sessionId: string) => void;
  recordViolation: (sessionId: string, type: SuspiciousEvent['type'], description: string, severity: SuspiciousEvent['severity']) => void;
  
  // Suspicious Events & Alerts
  suspiciousEvents: SuspiciousEvent[];
  addSuspiciousEvent: (event: Omit<SuspiciousEvent, 'id' | 'timestamp'>) => void;
  clearSuspiciousEvents: () => void;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  submitAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  
  // Profile modal
  isProfileModalOpen: boolean;
  profileModalTargetUser: User | null;
  openProfileModal: (targetUser?: User) => void;
  closeProfileModal: () => void;
  
  // School Info & Geolocation
  schoolInfo: SchoolCoordinates;
  calculateDistanceFromSchool: (lat: number, lng: number) => number;
  
  // Auth helpers & Security
  urlSecurityAlert: string | null;
  clearUrlSecurityAlert: () => void;
  loginAs: (user: User) => void;
  logout: () => void;

  // Emergency Server Control (Admin Force Stop)
  serverControl: ServerControlState;
  forceStopServer: (reason: string) => void;
  restoreServer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Haversine formula to compute distance in meters
export function getHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage or fallback to INITIAL_USERS
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sispena_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  // Current logged in user (Strict Auth: MUST be null by default unless a valid session token exists in sessionStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const token = sessionStorage.getItem('sispena_session_token');
    const saved = sessionStorage.getItem('sispena_current_user');
    if (token && saved) {
      try {
        const parsed = JSON.parse(saved);
        const usersList: User[] = JSON.parse(localStorage.getItem('sispena_users') || 'null') || INITIAL_USERS;
        const found = usersList.find((u) => u.id === parsed.id && u.role === parsed.role);
        if (found) {
          return found;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Strict default: MUST BE NULL. Mandatory login required for all roles!
    return null;
  });

  // URL Security Guard: Detect attempts to bypass login via URL parameters or hash
  const [urlSecurityAlert, setUrlSecurityAlert] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasSuspiciousParams =
      searchParams.has('role') ||
      searchParams.has('user') ||
      searchParams.has('admin') ||
      searchParams.has('dashboard') ||
      searchParams.has('bypass') ||
      window.location.hash.length > 1;

    if (hasSuspiciousParams) {
      // Clear URL parameters immediately to prevent direct URL access
      window.history.replaceState(null, document.title, window.location.pathname);
      setUrlSecurityAlert(
        'Akses Ditolak (Security Guard): Anda terdeteksi mencoba mengakses sistem melalui manipulasi parameter URL. Semua pengguna wajib melalui autentikasi login terlebih dahulu pada portal resmi SISPENA CBT.'
      );
    }
  }, []);

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('sispena_exams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EXAMS;
  });

  // Exam Sessions
  const [examSessions, setExamSessions] = useState<ExamSession[]>(() => {
    const saved = localStorage.getItem('sispena_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Suspicious events
  const [suspiciousEvents, setSuspiciousEvents] = useState<SuspiciousEvent[]>(() => {
    const saved = localStorage.getItem('sispena_suspicious');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUSPICIOUS_EVENTS;
  });

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sispena_attendance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ATTENDANCE;
  });

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTargetUser, setProfileModalTargetUser] = useState<User | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sispena_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('sispena_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('sispena_current_user');
      sessionStorage.removeItem('sispena_session_token');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sispena_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('sispena_sessions', JSON.stringify(examSessions));
  }, [examSessions]);

  useEffect(() => {
    localStorage.setItem('sispena_suspicious', JSON.stringify(suspiciousEvents));
  }, [suspiciousEvents]);

  useEffect(() => {
    localStorage.setItem('sispena_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // User actions
  const students = users.filter((u) => u.role === 'siswa');
  const teachers = users.filter((u) => u.role === 'guru');

  const addUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
    }
  };

  // Dedicated "Delete / Hapus Wajah" function
  const deleteUserFace = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: User = {
            ...u,
            biodata: {
              ...u.biodata,
              faceRegistered: false,
              facePhotoUrl: undefined,
              faceRegisteredAt: undefined,
              faceEmbeddingHash: undefined,
            },
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const registerUserFace = (userId: string, photoUrl: string, embeddingHash: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated: User = {
            ...u,
            biodata: {
              ...u.biodata,
              faceRegistered: true,
              facePhotoUrl: photoUrl,
              faceRegisteredAt: timestamp,
              faceEmbeddingHash: embeddingHash,
            },
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  // Exam actions
  const addExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const updateExam = (updatedExam: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updatedExam.id ? updatedExam : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Exam session actions
  const startExamSession = (examId: string, student: User): ExamSession => {
    const existing = examSessions.find(
      (s) => s.examId === examId && s.studentId === student.id
    );
    if (existing && existing.status === 'ongoing') {
      return existing;
    }

    const newSession: ExamSession = {
      id: `session-${Date.now()}-${student.id}`,
      examId,
      studentId: student.id,
      studentName: student.biodata.fullName,
      studentNisn: student.biodata.identifier,
      studentClass: student.biodata.className || 'Kelas 9A',
      answers: {},
      doubtfulAnswers: {},
      startedAt: new Date().toISOString(),
      status: 'ongoing',
      violationCount: 0,
      lastHeartbeat: new Date().toISOString(),
      suspiciousLogs: [],
    };

    setExamSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const updateSessionAnswer = (
    sessionId: string,
    questionId: string,
    answer: string,
    doubtful?: boolean
  ) => {
    setExamSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const answers = { ...s.answers, [questionId]: answer };
          const doubtfulAnswers = { ...s.doubtfulAnswers };
          if (doubtful !== undefined) {
            doubtfulAnswers[questionId] = doubtful;
          }
          return {
            ...s,
            answers,
            doubtfulAnswers,
            lastHeartbeat: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const submitExamSession = (sessionId: string) => {
    setExamSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const exam = exams.find((e) => e.id === s.examId);
          let totalScore = 0;
          let maxScore = 0;

          if (exam) {
            exam.questions.forEach((q) => {
              maxScore += q.scoreWeight;
              if (q.type === 'multiple_choice') {
                if (s.answers[q.id] === q.correctAnswer) {
                  totalScore += q.scoreWeight;
                }
              } else {
                // Essay: awarded partial score simulation if answered
                if (s.answers[q.id] && s.answers[q.id].trim().length > 10) {
                  totalScore += q.scoreWeight; // automatic grading simulation
                }
              }
            });
          }

          const calculatedScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 85;

          return {
            ...s,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            score: calculatedScore,
          };
        }
        return s;
      })
    );
  };

  const recordViolation = (
    sessionId: string,
    type: SuspiciousEvent['type'],
    description: string,
    severity: SuspiciousEvent['severity']
  ) => {
    const session = examSessions.find((s) => s.id === sessionId);
    if (!session) return;

    const exam = exams.find((e) => e.id === session.examId);
    const maxViolations = exam?.maxViolationsAllowed || 3;
    const newViolationCount = session.violationCount + 1;

    const timeStr = new Date().toLocaleTimeString('id-ID');
    const newEvent: SuspiciousEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      studentId: session.studentId,
      studentName: session.studentName,
      examId: session.examId,
      examTitle: exam?.title || 'Ujian SISPENA',
      type,
      description: `${description} (Pelanggaran ke-${newViolationCount}/${maxViolations})`,
      severity,
    };

    // Add to suspicious list
    setSuspiciousEvents((prev) => [newEvent, ...prev]);

    // Update session
    setExamSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const isLocked = newViolationCount >= maxViolations;
          return {
            ...s,
            violationCount: newViolationCount,
            status: isLocked ? 'locked_cheating' : s.status,
            suspiciousLogs: [newEvent, ...s.suspiciousLogs],
          };
        }
        return s;
      })
    );
  };

  const addSuspiciousEvent = (eventData: Omit<SuspiciousEvent, 'id' | 'timestamp'>) => {
    const newEvent: SuspiciousEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };
    setSuspiciousEvents((prev) => [newEvent, ...prev]);
  };

  const clearSuspiciousEvents = () => {
    setSuspiciousEvents([]);
  };

  // Attendance actions
  const submitAttendance = (recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  // Profile modal triggers
  const openProfileModal = (targetUser?: User) => {
    setProfileModalTargetUser(targetUser || currentUser);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileModalTargetUser(null);
  };

  const calculateDistanceFromSchool = (lat: number, lng: number): number => {
    return getHaversineDistanceMeters(
      lat,
      lng,
      SCHOOL_INFO.latitude,
      SCHOOL_INFO.longitude
    );
  };

  const loginAs = (user: User) => {
    const sessionToken = `AUTH_${user.role.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('sispena_session_token', sessionToken);
    sessionStorage.setItem('sispena_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setUrlSecurityAlert(null);
  };

  const logout = () => {
    sessionStorage.removeItem('sispena_session_token');
    sessionStorage.removeItem('sispena_current_user');
    localStorage.removeItem('sispena_current_user');
    setCurrentUser(null);
    window.history.replaceState(null, document.title, window.location.pathname);
  };

  const clearUrlSecurityAlert = () => {
    setUrlSecurityAlert(null);
  };

  // Server Control State (Emergency Kill-Switch for Admin)
  const [serverControl, setServerControl] = useState<ServerControlState>(() => {
    const saved = localStorage.getItem('sispena_server_control');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      status: 'online',
      autoLockSessions: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('sispena_server_control', JSON.stringify(serverControl));
  }, [serverControl]);

  const forceStopServer = (reason: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID');
    const fullDate = new Date().toISOString().slice(0, 10) + ' ' + timeStr;

    // 1. Update server control to emergency_stopped
    setServerControl({
      status: 'emergency_stopped',
      stoppedAt: fullDate,
      stoppedBy: currentUser?.biodata.fullName || 'Rifky Ardiansyah, S.Kom. (Admin)',
      reason: reason || 'Penghentian paksa server CBT oleh Administrator Server',
      autoLockSessions: true,
    });

    // 2. Force-freeze all active exams
    setExams((prev) =>
      prev.map((e) => (e.status === 'active' ? { ...e, status: 'completed' } : e))
    );

    // 3. Freeze all ongoing student sessions immediately
    setExamSessions((prev) =>
      prev.map((s) => (s.status === 'ongoing' ? { ...s, status: 'emergency_stopped' } : s))
    );

    // 4. Log critical event to suspiciousEvents/audit log
    const emergencyEvent: SuspiciousEvent = {
      id: `evt-emergency-${Date.now()}`,
      timestamp: timeStr,
      studentId: 'SERVER_ADMIN',
      studentName: 'ADMIN SERVER CBT',
      examId: 'ALL_EXAMS',
      examTitle: 'SEMUA SESI UJIAN SISPENA CBT',
      type: 'fullscreen_exit',
      description: `[KILL-SWITCH AKTIF] Server CBT SMP IT Sindangprabu dihentikan secara paksa oleh ${currentUser?.biodata.fullName || 'Rifky Ardiansyah, S.Kom.'}. Alasan: ${reason}`,
      severity: 'critical',
    };
    setSuspiciousEvents((prev) => [emergencyEvent, ...prev]);
  };

  const restoreServer = () => {
    setServerControl({
      status: 'online',
      autoLockSessions: false,
    });

    const timeStr = new Date().toLocaleTimeString('id-ID');
    const restoreEvent: SuspiciousEvent = {
      id: `evt-restore-${Date.now()}`,
      timestamp: timeStr,
      studentId: 'SERVER_ADMIN',
      studentName: 'ADMIN SERVER CBT',
      examId: 'ALL_EXAMS',
      examTitle: 'SEMUA SESI UJIAN SISPENA CBT',
      type: 'fullscreen_exit',
      description: `[RESTORE SERVER] Server CBT berhasil dihidupkan dan dipulihkan kembali normal oleh Administrator.`,
      severity: 'medium',
    };
    setSuspiciousEvents((prev) => [restoreEvent, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        students,
        teachers,
        addUser,
        updateUser,
        deleteUser,
        deleteUserFace,
        registerUserFace,
        exams,
        addExam,
        updateExam,
        deleteExam,
        examSessions,
        startExamSession,
        updateSessionAnswer,
        submitExamSession,
        recordViolation,
        suspiciousEvents,
        addSuspiciousEvent,
        clearSuspiciousEvents,
        attendanceRecords,
        submitAttendance,
        isProfileModalOpen,
        profileModalTargetUser,
        openProfileModal,
        closeProfileModal,
        schoolInfo: SCHOOL_INFO,
        calculateDistanceFromSchool,
        urlSecurityAlert,
        clearUrlSecurityAlert,
        loginAs,
        logout,
        serverControl,
        forceStopServer,
        restoreServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
