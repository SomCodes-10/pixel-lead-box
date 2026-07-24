
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

CREATE POLICY "Anyone can insert valid leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) > 0
    AND char_length(btrim(name)) <= 200
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND budget_range IN ('<$1k','$1k-$5k','$5k-$20k','$20k+')
    AND char_length(btrim(message)) >= 10
    AND char_length(message) <= 5000
    AND status = 'New'
  );
