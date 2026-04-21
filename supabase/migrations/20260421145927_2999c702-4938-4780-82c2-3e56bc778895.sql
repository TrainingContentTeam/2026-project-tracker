
CREATE OR REPLACE FUNCTION public.create_course_stages()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.course_stages (course_id, stage_name)
  SELECT NEW.id, s::production_stage
  FROM unnest(ARRAY[
    'SME','Peer Review','Legal/Policy Review','Medical Review','CQO',
    'Outline','Survey','In Development','Testing w/ Peer',
    'Testing w/ LMS Coordinator','Published'
  ]) s;
  RETURN NEW;
END; $function$;
