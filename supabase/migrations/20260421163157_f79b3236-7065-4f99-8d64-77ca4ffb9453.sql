-- Drop existing fully-open policies on courses
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
DROP POLICY IF EXISTS "Public insert courses" ON public.courses;
DROP POLICY IF EXISTS "Public update courses" ON public.courses;
DROP POLICY IF EXISTS "Public delete courses" ON public.courses;

-- Drop existing fully-open policies on course_stages
DROP POLICY IF EXISTS "Public read stages" ON public.course_stages;
DROP POLICY IF EXISTS "Public insert stages" ON public.course_stages;
DROP POLICY IF EXISTS "Public update stages" ON public.course_stages;
DROP POLICY IF EXISTS "Public delete stages" ON public.course_stages;

-- Authenticated-only policies on courses
CREATE POLICY "Authenticated users can read courses"
  ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert courses"
  ON public.courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update courses"
  ON public.courses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete courses"
  ON public.courses FOR DELETE TO authenticated USING (true);

-- Authenticated-only policies on course_stages
CREATE POLICY "Authenticated users can read stages"
  ON public.course_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert stages"
  ON public.course_stages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update stages"
  ON public.course_stages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete stages"
  ON public.course_stages FOR DELETE TO authenticated USING (true);
