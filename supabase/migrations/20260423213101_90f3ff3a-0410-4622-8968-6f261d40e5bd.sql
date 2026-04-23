
-- Allow public (anonymous) read access to courses and stages
DROP POLICY IF EXISTS "Authenticated users can read courses" ON public.courses;
CREATE POLICY "Anyone can read courses"
ON public.courses
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read stages" ON public.course_stages;
CREATE POLICY "Anyone can read stages"
ON public.course_stages
FOR SELECT
TO anon, authenticated
USING (true);
