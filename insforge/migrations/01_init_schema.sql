
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  business_name TEXT,
  services TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_location TEXT,
  project_type TEXT NOT NULL,
  pages INTEGER DEFAULT 1,
  price NUMERIC DEFAULT 0,
  timeline TEXT,
  description TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'Generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles user select') THEN
    CREATE POLICY "Profiles user select" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles user insert') THEN
    CREATE POLICY "Profiles user insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles user update') THEN
    CREATE POLICY "Profiles user update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Proposals user select') THEN
    CREATE POLICY "Proposals user select" ON public.proposals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Proposals user insert') THEN
    CREATE POLICY "Proposals user insert" ON public.proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Proposals user update') THEN
    CREATE POLICY "Proposals user update" ON public.proposals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Proposals user delete') THEN
    CREATE POLICY "Proposals user delete" ON public.proposals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
