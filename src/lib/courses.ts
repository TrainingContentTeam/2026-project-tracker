import { supabase } from "@/integrations/supabase/client";

export const STAGES = [
  "SME",
  "Peer Review",
  "Legal/Policy Review",
  "Medical Review",
  "CQO",
  "Survey",
  "Outline",
  "In Development",
  "Testing w/ Peer",
  "Testing w/ LMS Coordinator",
  "Published",
] as const;

export type StageName = (typeof STAGES)[number];

export interface Course {
  id: string;
  name: string;
  quarter: string | null;
  vertical: string | null;
  date_assigned: string | null;
  start_date: string | null;
  due_date: string | null;
  sme: string | null;
  sme_email: string | null;
  voice_over_artist: string | null;
  legal_review_contact: string | null;
  technical_tools: string | null;
  comments: string | null;
  lesson_plan: string | null;
  course_outline: string | null;
  uploaded_to_lms: string | null;
  progress_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseStage {
  id: string;
  course_id: string;
  stage_name: StageName;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

export interface CourseWithStages extends Course {
  stages: CourseStage[];
}

export async function fetchCourses(): Promise<CourseWithStages[]> {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*, course_stages(*)")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (courses ?? []).map((c: any) => ({
    ...c,
    stages: (c.course_stages ?? []) as CourseStage[],
  }));
}

export async function fetchCourse(id: string): Promise<CourseWithStages | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_stages(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...(data as any), stages: ((data as any).course_stages ?? []) as CourseStage[] };
}

export function progressOf(stages: CourseStage[]): { done: number; total: number; pct: number } {
  const total = STAGES.length;
  const done = stages.filter((s) => s.completed).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}