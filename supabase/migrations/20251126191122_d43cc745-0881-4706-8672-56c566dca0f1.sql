-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set REPLICA IDENTITY FULL to capture complete row data during updates
ALTER TABLE notifications REPLICA IDENTITY FULL;