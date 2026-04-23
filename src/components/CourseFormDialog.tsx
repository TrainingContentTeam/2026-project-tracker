import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Course } from "@/lib/courses";
import { friendlyError } from "@/lib/errors";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSaved?: (id: string) => void;
}

export function CourseFormDialog({ open, onOpenChange, course, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    quarter: "",
    vertical: "",
    date_assigned: "",
    start_date: "",
    due_date: "",
    sme: "",
    sme_email: "",
    voice_over_artist: "",
    legal_review_contact: "",
    technical_tools: "",
    sharepoint_link: "",
    comments: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) {
      setForm({
        name: course.name ?? "",
        quarter: course.quarter ?? "",
        vertical: course.vertical ?? "",
        date_assigned: course.date_assigned ?? "",
        start_date: course.start_date ?? "",
        due_date: course.due_date ?? "",
        sme: course.sme ?? "",
        sme_email: course.sme_email ?? "",
        voice_over_artist: course.voice_over_artist ?? "",
        legal_review_contact: course.legal_review_contact ?? "",
        technical_tools: course.technical_tools ?? "",
        sharepoint_link: course.sharepoint_link ?? "",
        comments: course.comments ?? "",
      });
    } else {
      setForm({
        name: "", quarter: "", vertical: "", date_assigned: "", start_date: "", due_date: "",
        sme: "", sme_email: "", voice_over_artist: "", legal_review_contact: "", technical_tools: "", sharepoint_link: "", comments: "",
      });
    }
  }, [course, open]);

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      date_assigned: form.date_assigned || null,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      quarter: form.quarter || null,
      vertical: form.vertical || null,
      sme: form.sme || null,
      sme_email: form.sme_email || null,
      voice_over_artist: form.voice_over_artist || null,
      legal_review_contact: form.legal_review_contact || null,
      technical_tools: form.technical_tools || null,
      sharepoint_link: form.sharepoint_link || null,
      comments: form.comments || null,
    };
    if (course) {
      const { error } = await supabase.from("courses").update(payload).eq("id", course.id);
      setSaving(false);
      if (error) return toast.error(friendlyError(error));
      toast.success("Course updated");
      onSaved?.(course.id);
      onOpenChange(false);
    } else {
      const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
      setSaving(false);
      if (error) return toast.error(friendlyError(error));
      toast.success("Course created");
      onSaved?.(data!.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quarter">Quarter</Label>
              <Input id="quarter" placeholder="Q1 2026" value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vertical">Vertical</Label>
              <Input id="vertical" placeholder="P1A, FireRescue, EMS..." value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date_assigned">Date Assigned</Label>
              <Input id="date_assigned" type="date" value={form.date_assigned} onChange={(e) => setForm({ ...form, date_assigned: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sme">SME(s)</Label>
              <Input id="sme" value={form.sme} onChange={(e) => setForm({ ...form, sme: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sme_email">SME Email</Label>
              <Input id="sme_email" type="email" placeholder="sme@example.com" value={form.sme_email} onChange={(e) => setForm({ ...form, sme_email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="voice_over_artist">Voice Over Artist</Label>
              <Input id="voice_over_artist" value={form.voice_over_artist} onChange={(e) => setForm({ ...form, voice_over_artist: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="legal_review_contact">Legal/Policy Review</Label>
              <Input id="legal_review_contact" value={form.legal_review_contact} onChange={(e) => setForm({ ...form, legal_review_contact: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="technical_tools">Technical Tools</Label>
              <Input id="technical_tools" placeholder="RISE, Storyline..." value={form.technical_tools} onChange={(e) => setForm({ ...form, technical_tools: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sharepoint_link">SharePoint Link</Label>
            <Input id="sharepoint_link" type="url" placeholder="https://lexipol.sharepoint.com/..." value={form.sharepoint_link} onChange={(e) => setForm({ ...form, sharepoint_link: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comments">Comments / Tasks</Label>
            <Textarea id="comments" rows={3} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : course ? "Save changes" : "Create course"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}