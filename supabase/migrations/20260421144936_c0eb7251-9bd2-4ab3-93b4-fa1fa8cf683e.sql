DROP POLICY IF EXISTS "sandbox seed" ON public.courses;
DROP POLICY IF EXISTS "sandbox seed" ON public.course_stages;
ALTER TABLE public.courses NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.course_stages NO FORCE ROW LEVEL SECURITY;