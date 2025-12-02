-- Add starred column to inbox_messages
ALTER TABLE inbox_messages ADD COLUMN starred BOOLEAN DEFAULT false NOT NULL;