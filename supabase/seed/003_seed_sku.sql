copy public.sku_catalogue
from '/supabase/seed/sku_min.csv'
with (format csv, header true);
