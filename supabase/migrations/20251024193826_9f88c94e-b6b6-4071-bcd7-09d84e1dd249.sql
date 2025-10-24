-- Uppdatera alla meddelanden mellan Alex och Mahad till deras gemensamma konversation
UPDATE public.messages
SET channel_id = 'b63b30bc-f081-4aa1-9a09-5ef7c9843638'
WHERE (sender_id = '1a0fd33c-beef-421c-8203-506b20a432dd' 
       OR sender_id = 'a08c571b-f843-4453-83e3-ab3d6a78b3ba')
  AND channel_id IN (
    'd32080a8-09cb-4aa1-a42d-98f69b426796',
    'f1207eea-176b-42ce-bb2d-0a8c7dc59831',
    '51db9e94-55d1-458c-9281-c75788309f99'
  );