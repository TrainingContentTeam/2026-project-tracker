
CREATE TYPE public.production_stage AS ENUM (
  'SME','Peer Review','Legal/Policy Review','Medical Review','CQO','Outline','Survey','In Development','Testing w/ Peer'
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quarter TEXT,
  vertical TEXT,
  date_assigned DATE,
  due_date DATE,
  sme TEXT,
  voice_over_artist TEXT,
  legal_review_contact TEXT,
  technical_tools TEXT,
  comments TEXT,
  lesson_plan TEXT,
  course_outline TEXT,
  uploaded_to_lms TEXT,
  progress_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.course_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stage_name production_stage NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, stage_name)
);

CREATE INDEX idx_course_stages_course ON public.course_stages(course_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public insert courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update courses" ON public.courses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete courses" ON public.courses FOR DELETE USING (true);

CREATE POLICY "Public read stages" ON public.course_stages FOR SELECT USING (true);
CREATE POLICY "Public insert stages" ON public.course_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update stages" ON public.course_stages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete stages" ON public.course_stages FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER course_stages_updated_at BEFORE UPDATE ON public.course_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create the 9 stage rows when a course is created
CREATE OR REPLACE FUNCTION public.create_course_stages()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.course_stages (course_id, stage_name)
  SELECT NEW.id, s::production_stage
  FROM unnest(ARRAY['SME','Peer Review','Legal/Policy Review','Medical Review','CQO','Outline','Survey','In Development','Testing w/ Peer']) s;
  RETURN NEW;
END; $$;

CREATE TRIGGER courses_create_stages AFTER INSERT ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.create_course_stages();
