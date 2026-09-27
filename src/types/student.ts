import type { Task, TaskReminder } from "./tasks";

export type AcademicType = "exam" | "assignment" | "reading" | "review";
export type StudyOutcome = "difficult" | "progress" | "continue";

export interface StudentSubject {
  id: string;
  name: string;
}

export interface StudentTaskDetails {
  academicType: AcademicType;
  estimatedMinutes: number;
  subjectId: string | null;
  subject: StudentSubject | null;
}

export interface StudentCommitment extends Task {
  studentDetails: StudentTaskDetails;
}

export interface StudentDashboardData {
  subjects: StudentSubject[];
  commitments: StudentCommitment[];
}

export interface CreateStudentCommitmentInput {
  title: string;
  description?: string;
  subjectId?: string;
  newSubjectName?: string;
  academicType: AcademicType;
  date?: string;
  time?: string;
  estimatedMinutes: number;
  reminder: TaskReminder;
}

export interface CompleteStudySessionInput {
  taskId?: string;
  subjectId?: string;
  plannedMinutes: number;
  elapsedSeconds: number;
  outcome?: StudyOutcome;
  startedAt: string;
}
