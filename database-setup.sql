-- TSA Website Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    grade INTEGER NOT NULL,
    phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Policy: Admin can view all profiles, users can view their own
CREATE POLICY "Admin and user profile access" ON user_profiles
    FOR SELECT USING (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Policy: Admin can update all profiles, users can update their own
CREATE POLICY "Admin and user profile update" ON user_profiles
    FOR UPDATE USING (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Policy: Admin can insert profiles, users can insert their own
CREATE POLICY "Admin and user profile insert" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Policy: Admin can delete all profiles, users can delete their own
CREATE POLICY "Admin and user profile delete" ON user_profiles
    FOR DELETE USING (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Drop existing triggers first (to avoid dependency issues)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;

-- Drop existing function if it exists (now that triggers are gone)
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create events table (optional - for future use)
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table (optional - for future use)
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered',
    UNIQUE(event_id, user_id)
);

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing event policies if they exist
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;

-- Policy: Anyone can view events
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

-- Policy: Only admin can manage events
CREATE POLICY "Admin can manage events" ON events
    FOR ALL USING (auth.email() = 'bothellhstsa@gmail.com');

-- Enable RLS on event_registrations table
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing registration policies if they exist
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;

-- Policy: Admin can view all registrations, users can view their own
CREATE POLICY "Admin and user registration access" ON event_registrations
    FOR SELECT USING (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Policy: Admin can manage registrations, users can register for events
CREATE POLICY "Admin and user registration management" ON event_registrations
    FOR INSERT WITH CHECK (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Policy: Admin can update all registrations, users can update their own
CREATE POLICY "Admin and user registration update" ON event_registrations
    FOR UPDATE USING (
        auth.email() = 'bothellhstsa@gmail.com' OR auth.uid() = user_id
    );

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample events
INSERT INTO events (title, description, event_date, location, max_participants) VALUES
('Winter Competition Prep', 'Get ready for the upcoming winter competitions with hands-on workshops and team building activities.', '2024-12-15 15:00:00+00', 'Room 205, Science Building', 30),
('Regional Competition', 'Showcase your skills and compete against other schools in our annual regional technology competition.', '2025-01-20 09:00:00+00', 'Main Campus Auditorium', 100),
('Guest Speaker Series', 'Learn from industry professionals about the latest trends in technology and career opportunities.', '2025-02-10 14:00:00+00', 'Conference Room A', 50)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);

-- ============================================================
-- CHATBOT FUNCTIONALITY TABLES
-- ============================================================

-- Meeting notes table for storing Google Drive meeting notes
CREATE TABLE IF NOT EXISTS meeting_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meeting_date DATE,
    file_id TEXT UNIQUE, -- Google Drive file ID
    last_modified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat conversations table for storing chatbot interactions
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chatbot tables
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing chatbot policies if they exist
DROP POLICY IF EXISTS "Admin only meeting notes" ON meeting_notes;
DROP POLICY IF EXISTS "Admin only chat conversations" ON chat_conversations;

-- Only admin can access meeting notes
CREATE POLICY "Admin only meeting notes" ON meeting_notes
    FOR ALL USING (auth.email() = 'bothellhstsa@gmail.com');

-- Only admin can access chat conversations
CREATE POLICY "Admin only chat conversations" ON chat_conversations
    FOR ALL USING (auth.email() = 'bothellhstsa@gmail.com');

-- Create triggers for chatbot tables
CREATE TRIGGER update_meeting_notes_updated_at 
    BEFORE UPDATE ON meeting_notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for chatbot tables
CREATE INDEX IF NOT EXISTS idx_meeting_notes_file_id ON meeting_notes(file_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_date ON meeting_notes(meeting_date);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_date ON chat_conversations(created_at); 