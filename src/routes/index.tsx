import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchCourses, progressOf, formatDate, type CourseWithStages } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseFormDialog } from "@/components/CourseFormDialog";
import { Plus, Search, ChevronRight, BookOpen, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "2026 Course Tracker" },
      { name: "description", content: "Dashboard for tracking e-learning course production stages." },
    ],
  }),
});

function Dashboard() {
  const [courses, setCourses] = useState<CourseWithStages[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quarter, setQuarter] = useState<string>("all");
  const [vertical, setVertical] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const courses2026 = useMemo(
    () => courses.filter((c) => (c.quarter ?? "").includes("2026")),
    [courses],
  );

  const quarters = useMemo(() => {
    const set = new Set(courses2026.map((c) => c.quarter).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [courses2026]);
  const verticals = useMemo(() => {
    const set = new Set(courses2026.map((c) => c.vertical).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [courses2026]);

  const filtered = useMemo(() => {
    return courses2026.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (quarter !== "all" && c.quarter !== quarter) return false;
      if (vertical !== "all" && c.vertical !== vertical) return false;
      const p = progressOf(c.stages);
      if (status === "completed" && p.done !== p.total) return false;
      if (status === "in_progress" && (p.done === 0 || p.done === p.total)) return false;
      if (status === "not_started" && p.done !== 0) return false;
      return true;
    });
  }, [courses2026, search, quarter, vertical, status]);

  const stats = useMemo(() => {
    const total = courses2026.length;
    let completed = 0, inProgress = 0;
    courses2026.forEach((c) => {
      const p = progressOf(c.stages);
      if (p.done === p.total) completed++;
      else if (p.done > 0) inProgress++;
    });
    return { total, completed, inProgress, notStarted: total - completed - inProgress };
  }, [courses2026]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">2026 Course Tracker</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track each 2026 course through the 11 production stages.</p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Total Courses" value={stats.total} icon={<BookOpen className="h-5 w-5" />} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5 text-success" />} />
          <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="h-5 w-5 text-warning" />} />
          <StatCard label="Not Started" value={stats.notStarted} icon={<Clock className="h-5 w-5 text-muted-foreground" />} />
        </div>

        <Card className="p-4 mb-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search course name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger><SelectValue placeholder="Quarter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quarters</SelectItem>
                {quarters.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={vertical} onValueChange={setVertical}>
              <SelectTrigger><SelectValue placeholder="Vertical" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All verticals</SelectItem>
                {verticals.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No courses match your filters.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Course Name</th>
                      <th className="px-4 py-3 font-medium">Quarter</th>
                      <th className="px-4 py-3 font-medium">Vertical</th>
                      <th className="px-4 py-3 font-medium">Start</th>
                      <th className="px-4 py-3 font-medium">Due</th>
                      <th className="px-4 py-3 font-medium w-64">Progress</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((c) => {
                      const p = progressOf(c.stages);
                      return (
                        <tr key={c.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <Link to="/courses/$courseId" params={{ courseId: c.id }} className="font-medium text-foreground hover:underline">
                              {c.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{c.quarter ?? "—"}</td>
                          <td className="px-4 py-3"><Badge variant="secondary">{c.vertical ?? "—"}</Badge></td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(c.start_date)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(c.due_date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Progress value={p.pct} className="flex-1" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{p.done} / {p.total}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link to="/courses/$courseId" params={{ courseId: c.id }} className="inline-flex items-center text-sm text-primary hover:underline">
                              Open <ChevronRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {filtered.map((c) => {
                  const p = progressOf(c.stages);
                  return (
                    <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="block p-4 hover:bg-muted/30">
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{c.quarter ?? "—"}</span>
                        <span>•</span>
                        <span>{c.vertical ?? "—"}</span>
                        <span>•</span>
                        <span>Start {formatDate(c.start_date)}</span>
                        <span>•</span>
                        <span>Due {formatDate(c.due_date)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={p.pct} className="flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{p.done} / {p.total}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </main>

      <CourseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </div>
    </Card>
  );
}
