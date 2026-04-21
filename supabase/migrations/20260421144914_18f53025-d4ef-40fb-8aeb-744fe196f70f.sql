GRANT ALL ON public.courses TO sandbox_exec;
GRANT ALL ON public.course_stages TO sandbox_exec;
ALTER TABLE public.courses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.course_stages FORCE ROW LEVEL SECURITY;
-- allow sandbox_exec to bypass RLS for seeding by adding a policy
CREATE POLICY "sandbox seed" ON public.courses FOR ALL TO sandbox_exec USING (true) WITH CHECK (true);
CREATE POLICY "sandbox seed" ON public.course_stages FOR ALL TO sandbox_exec USING (true) WITH CHECK (true);