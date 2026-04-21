
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.create_course_stages()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.course_stages (course_id, stage_name)
  SELECT NEW.id, s::production_stage
  FROM unnest(ARRAY['SME','Peer Review','Legal/Policy Review','Medical Review','CQO','Outline','Survey','In Development','Testing w/ Peer']) s;
  RETURN NEW;
END; $$;
