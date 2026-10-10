-- Allow viewers to update and delete their own messages and status records
DROP POLICY IF EXISTS record_update ON public.family_records;
CREATE POLICY record_update ON public.family_records FOR UPDATE TO authenticated 
USING (
  public.family_access(family_id, true) OR 
  (author_id = auth.uid() AND kind IN ('message', 'status'))
)
WITH CHECK (
  public.family_access(family_id, true) OR 
  (author_id = auth.uid() AND kind IN ('message', 'status'))
);

DROP POLICY IF EXISTS record_delete ON public.family_records;
CREATE POLICY record_delete ON public.family_records FOR DELETE TO authenticated 
USING (
  public.family_access(family_id, true) OR 
  (author_id = auth.uid() AND kind IN ('message', 'status'))
);

-- Allow family members to see each other's full profiles (e.g. for avatars)
CREATE POLICY family_members_profile_read ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur1
    JOIN public.user_roles ur2 ON ur1.family_id = ur2.family_id
    WHERE ur1.user_id = auth.uid() AND ur2.user_id = public.profiles.id
  )
);

-- Improve join_family to be idempotent if user is already a member
CREATE OR REPLACE FUNCTION public.join_family(code uuid, parent text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE 
  fid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;

  SELECT id INTO fid FROM public.families WHERE invite_code = code;
  IF fid IS NULL THEN RAISE EXCEPTION 'Invalid invitation'; END IF;
  
  -- Check if already a member of THIS family
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE family_id = fid AND user_id = auth.uid()) THEN
    RETURN fid;
  END IF;

  IF (SELECT count(*) FROM public.user_roles WHERE family_id = fid) >= 2 THEN
    RAISE EXCEPTION 'Family already has two parents';
  END IF;
  
  INSERT INTO public.user_roles(family_id, user_id, parent_role, access, display_name)
  SELECT fid, auth.uid(), parent, 'viewer', display_name 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN fid;
END $$;
