-- Insert example inbox messages
INSERT INTO inbox_messages (from_email, from_name, subject, body, status, source, starred, received_at) VALUES
('info@blocket.se', 'Blocket Meddelanden', 'Ny förfrågan om Volvo XC90', 'Hej! Jag är intresserad av din Volvo XC90 från 2021. Kan du berätta mer om servicehhistorik och om det finns några kända fel? Vad är sista pris?', 'unread', 'blocket', true, NOW() - INTERVAL '2 hours'),

('kund@gmail.com', 'Anna Svensson', 'Fråga om finansiering', 'Hej! Jag såg er BMW 320d och undrar om ni erbjuder finansiering? Jag skulle vilja veta vilka alternativ som finns. Tacksam för svar!', 'unread', 'manual', false, NOW() - INTERVAL '5 hours'),

('leads@wayke.se', 'Wayke Leads', 'Lead: Audi A4 2019', 'En potentiell köpare har visat intresse för Audi A4 2019. Kontaktuppgifter: Johan Andersson, 070-123 45 67. Bud: 285 000 kr.', 'read', 'wayke', false, NOW() - INTERVAL '1 day'),

('support@bytbil.com', 'Bytbil Support', 'Ny inbytesförfrågan', 'Kund vill byta in sin Toyota Corolla 2016 mot en nyare modell. Uppskattad inbytespris: 125 000 kr. Kunden är intresserad av hybridmodeller.', 'unread', 'bytbil', true, NOW() - INTERVAL '3 hours'),

('info@blocket.se', 'Blocket Meddelanden', 'Prisförhandling Volvo V60', 'Hej, jag har sett er annons för Volvo V60. Skulle ni kunna gå ner till 185 000 kr? Jag kan hämta bilen i morgon om vi kommer överens.', 'read', 'blocket', false, NOW() - INTERVAL '2 days'),

('markus.berg@hotmail.com', 'Markus Berg', 'Besiktningsfrågor', 'Hej! När gjordes senaste besiktningen på Mercedes C-klass 2018? Finns det några anmärkningar? Kan jag komma och provköra i helgen?', 'unread', 'manual', false, NOW() - INTERVAL '30 minutes'),

('leads@wayke.se', 'Wayke Leads', 'Hot Lead: BMW X5', 'BRÅDSKANDE: Köpare vill se BMW X5 2020 redan idag. Kontakt: Lisa Holm, 076-987 65 43. Budget: 450 000 kr kontant.', 'unread', 'wayke', true, NOW() - INTERVAL '15 minutes'),

('service@blocket.se', 'Blocket Service', 'Din annons löper ut snart', 'Din annons för Volkswagen Golf kommer att löpa ut om 3 dagar. Förnya annonsen för att fortsätta nå potentiella köpare.', 'archived', 'blocket', false, NOW() - INTERVAL '5 days');