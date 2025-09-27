-- Update the current lead with name and email information
UPDATE leads 
SET 
  lead_namn = 'Mikael',
  lead_email = 'mikael@example.com',
  updated_at = now()
WHERE id = '60a31948-78a6-4d6a-b598-6112d07b49e9';