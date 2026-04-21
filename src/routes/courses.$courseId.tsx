import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCourse, progressOf, formatDate, STAGES, type CourseWithStages, type CourseStage } from "@/lib/courses";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CourseFormDialog } from "@/components/CourseFormDialog";
import { ArrowLeft, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetail,
  head: () => ({
    meta: [{ title: "Course Detail — Course Production Tracker" }],
  }),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center">
      <p className="text-destructive">Error loading course: {error.message}</p>
      <Link to="/" className="text-primary hover:underline mt-4 inline-block">← Back to dashboard</Link>
    </div>
  ),
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseWithStages | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  async function load() {
    setLoading(true);
    const c = await fetchCourse(courseId);
    setCourse(c);
    setLoading(false);
  }

  useEffect(() => { load(); }, [courseId]);

  async function toggleStage(stage: CourseStage, completed: boolean) {
    const { error } = await supabase
      .from("course_stages")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", stage.id);
    if (error) return toast.error(error.message);
    setCourse((c) => c ? {
      ...c,
      stages: c.stages.map((s) => s.id === stage.id ? { ...s, completed, completed_at: completed ? new Date().toISOString() : null } : s),
    } : c);
  }

  async function updateNotes(stage: CourseStage, notes: string) {
    const { error } = await supabase.from("course_stages").update({ notes }).eq("id", stage.id);
    if (error) return toast.error(error.message);
    setCourse((c) => c ? {
      ...c,
      stages: c.stages.map((s) => s.id === stage.id ? { ...s, notes } : s),
    } : c);
  }

  async function handleDelete() {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) return toast.error(error.message);
    toast.success("Course deleted");
    navigate({ to: "/" });
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }
  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  const p = progressOf(course.stages);
  // Order stages by STAGES array
  const orderedStages = STAGES.map((name) => course.stages.find((s) => s.stage_name === name)).filter(Boolean) as CourseStage[];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to all courses
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground break-words">{course.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {course.quarter && <Badge variant="secondary">{course.quarter}</Badge>}
                {course.vertical && <Badge variant="outline">{course.vertical}</Badge>}
                <span className="text-sm text-muted-foreground">Due {formatDate(course.due_date)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
              <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Production Stages</h2>
              <span className="text-sm text-muted-foreground">{p.done} of {p.total} complete</span>
            </div>
            <Progress value={p.pct} className="mb-6" />
            <div className="space-y-3">
              {orderedStages.map((stage, i) => (
                <StageRow key={stage.id} index={i + 1} stage={stage} onToggle={toggleStage} onNotesChange={updateNotes} />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <Field label="Date Assigned" value={formatDate(course.date_assigned)} />
              <Field label="Start Date" value={formatDate(course.start_date)} />
              <Field label="Due Date" value={formatDate(course.due_date)} />
              <Field label="SME(s)" value={course.sme} />
              <Field label="Voice Over Artist" value={course.voice_over_artist} />
              <Field label="Legal/Policy Review" value={course.legal_review_contact} />
              <Field label="Technical Tools" value={course.technical_tools} />
              <Field label="Lesson Plan" value={course.lesson_plan} />
              <Field label="Course Outline" value={course.course_outline} />
              <Field label="Uploaded to LMS" value={course.uploaded_to_lms} />
            </dl>
          </Card>

          {(course.comments || course.progress_note) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              {course.comments && (
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Comments / Tasks</div>
                  <p className="text-sm whitespace-pre-wrap">{course.comments}</p>
                </div>
              )}
              {course.progress_note && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Progress Note (imported)</div>
                  <p className="text-sm whitespace-pre-wrap">{course.progress_note}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>

      <CourseFormDialog open={editOpen} onOpenChange={setEditOpen} course={course} onSaved={load} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground break-words">{value || "—"}</dd>
    </div>
  );
}

function StageRow({ index, stage, onToggle, onNotesChange }: {
  index: number;
  stage: CourseStage;
  onToggle: (s: CourseStage, completed: boolean) => void;
  onNotesChange: (s: CourseStage, notes: string) => void;
}) {
  const [notes, setNotes] = useState(stage.notes ?? "");
  const [showNotes, setShowNotes] = useState(false);
  useEffect(() => { setNotes(stage.notes ?? ""); }, [stage.notes]);

  return (
    <div className={`rounded-lg border p-3 transition-colors ${stage.completed ? "bg-success-muted border-success/30" : "bg-background"}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={stage.id}
          checked={stage.completed}
          onCheckedChange={(checked) => onToggle(stage, checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={stage.id} className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
            <span className={`font-medium ${stage.completed ? "text-foreground" : "text-foreground"}`}>{stage.stage_name}</span>
            {stage.completed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          </label>
          {stage.completed_at && (
            <div className="text-xs text-muted-foreground mt-1">Completed {formatDate(stage.completed_at)}</div>
          )}
          <button
            type="button"
            onClick={() => setShowNotes((s) => !s)}
            className="text-xs text-primary hover:underline mt-1"
          >
            {showNotes ? "Hide notes" : stage.notes ? "View notes" : "Add notes"}
          </button>
          {showNotes && (
            <div className="mt-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => { if (notes !== (stage.notes ?? "")) onNotesChange(stage, notes); }}
                placeholder="Add notes for this stage..."
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}