-- Insert example lead for demonstration
INSERT INTO public.leads (
  id,
  blocket_url,
  lead_namn,
  lead_email,
  regnr,
  summary,
  subject,
  preview_title,
  preview_description,
  preview_image_url,
  claimed,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'https://www.blocket.se/annonser/hela_sverige/fordon/bilar/toyota/camry/toyota-camry-2019-hybrid-exempel',
  'Anna Andersson',
  'anna.andersson@email.com',
  'ABC123',
  'Hej! Jag är mycket intresserad av er Toyota Camry Hybrid från 2019. Bilen verkar vara i mycket bra skick enligt annonsen. Jag skulle gärna vilja komma och titta på den och eventuellt göra en provkörning. Är det möjligt att träffas under helgen? Jag har kontanter redo för snabb affär om allt ser bra ut. Mvh Anna',
  'Intresse för Toyota Camry 2019 - Snabb affär möjlig',
  'Toyota Camry 2019 Hybrid - Välskött och ekonomisk',
  'En pålitlig Toyota Camry från 2019 med hybridmotor. Bilen har körts varsamt och har full servicehistorik. Perfekt för dig som söker en ekonomisk och miljövänlig bil.',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
  false,
  now(),
  now()
);