
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT leads_budget_check CHECK (budget_range IN ('<$1k','$1k-$5k','$5k-$20k','$20k+')),
  CONSTRAINT leads_status_check CHECK (status IN ('New','Contacted','Closed'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public lead capture; admin page has no auth yet (per spec)
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view leads" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update lead status" ON public.leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
