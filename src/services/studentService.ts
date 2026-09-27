import { supabase } from "@/lib/supabaseClient";
import { sortStudentCommitments } from "@/lib/student";
import type {
  AcademicType,
  CompleteStudySessionInput,
  CreateStudentCommitmentInput,
  StudentCommitment,
  StudentDashboardData,
  StudentSubject,
  Task,
} from "@/types";
import { scheduleTaskReminder } from "./taskReminderService";

interface StudentDetailsRow {
  academic_type: AcademicType;
  estimated_minutes: number;
  subject_id: string | null;
  subject: { id: string; name: string } | { id: string; name: string }[] | null;
}

interface StudentTaskRow extends Task {
  student_details: StudentDetailsRow | StudentDetailsRow[] | null;
}

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapCommitment(row: StudentTaskRow): StudentCommitment | null {
  const details = firstRelation(row.student_details);
  if (!details) return null;
  const subject = firstRelation(details.subject);
  return {
    ...row,
    studentDetails: {
      academicType: details.academic_type,
      estimatedMinutes: details.estimated_minutes,
      subjectId: details.subject_id,
      subject,
    },
  };
}

async function authenticatedUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) throw new Error("Usuário não autenticado.");
  return data.session.user.id;
}

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const userId = await authenticatedUserId();
  const [subjectsResult, tasksResult] = await Promise.all([
    supabase
      .from("student_subjects")
      .select("id, name")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("tasks")
      .select(`
        id, title, description, date, time, priority, reminder, module_key, done, completed_at,
        student_details:student_task_details!student_task_details_task_id_fkey(
          academic_type, estimated_minutes, subject_id,
          subject:student_subjects!student_task_details_subject_id_fkey(id, name)
        )
      `)
      .eq("user_id", userId)
      .eq("module_key", "student"),
  ]);

  if (subjectsResult.error) throw subjectsResult.error;
  if (tasksResult.error) throw tasksResult.error;

  const commitments = ((tasksResult.data ?? []) as unknown as StudentTaskRow[])
    .map(mapCommitment)
    .filter((item): item is StudentCommitment => Boolean(item));

  return {
    subjects: (subjectsResult.data ?? []) as StudentSubject[],
    commitments: sortStudentCommitments(commitments),
  };
}

export async function createStudentCommitment(input: CreateStudentCommitmentInput): Promise<StudentCommitment> {
  await authenticatedUserId();
  const { data, error } = await supabase.rpc("create_student_commitment", {
    p_title: input.title.trim(),
    p_description: input.description?.trim() || null,
    p_subject_id: input.subjectId || null,
    p_new_subject_name: input.newSubjectName?.trim() || null,
    p_academic_type: input.academicType,
    p_date: input.date || null,
    p_time: input.time || null,
    p_estimated_minutes: input.estimatedMinutes,
    p_reminder: input.reminder,
    p_priority: "media",
  });
  if (error) throw error;
  const task = (Array.isArray(data) ? data[0] : data) as Task | null;
  if (!task) throw new Error("O compromisso não foi criado.");
  await scheduleTaskReminder(task, Boolean(input.reminder)).catch((scheduleError) => {
    console.error("Não foi possível agendar o lembrete acadêmico:", scheduleError);
  });

  return {
    ...task,
    studentDetails: {
      academicType: input.academicType,
      estimatedMinutes: input.estimatedMinutes,
      subjectId: input.subjectId || null,
      subject: input.subjectId
        ? { id: input.subjectId, name: "" }
        : input.newSubjectName
          ? { id: "", name: input.newSubjectName.trim() }
          : null,
    },
  };
}

export async function completeStudySession(input: CompleteStudySessionInput) {
  const userId = await authenticatedUserId();
  const { error } = await supabase.from("student_study_sessions").insert({
    user_id: userId,
    task_id: input.taskId || null,
    subject_id: input.subjectId || null,
    planned_minutes: input.plannedMinutes,
    elapsed_seconds: input.elapsedSeconds,
    outcome: input.outcome || null,
    started_at: input.startedAt,
    ended_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function createStudyReview(source: StudentCommitment, date: string) {
  const subject = source.studentDetails.subject;
  return createStudentCommitment({
    title: source.title.toLocaleLowerCase("pt-BR").startsWith("revis") ? source.title : `Revisar ${source.title}`,
    description: "Revisão criada após uma sessão de estudo.",
    subjectId: subject?.id || undefined,
    newSubjectName: subject?.id ? undefined : subject?.name,
    academicType: "review",
    date,
    estimatedMinutes: Math.min(25, source.studentDetails.estimatedMinutes),
    reminder: null,
  });
}
