// Google Drive Sync Service for TSA Meeting Notes
class GoogleDriveSync {
    constructor() {
        this.apiKey = window.GOOGLE_DRIVE_API_KEY;
        this.folderId = window.GOOGLE_DRIVE_FOLDER_ID;
        this.baseUrl = 'https://www.googleapis.com/drive/v3';
    }

    async syncMeetingNotes() {
        try {
            this.validateConfig();
            
            console.log('Syncing meeting notes from Google Drive...');
            const files = await this.getFiles();
            
            let processed = 0;
            for (const file of files) {
                await this.processFile(file);
                processed++;
            }
            
            console.log(`Sync completed: ${processed} files processed`);
            return { success: true, filesProcessed: processed };
            
        } catch (error) {
            console.error('Sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    validateConfig() {
        if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_DRIVE_API_KEY') {
            throw new Error('Google Drive API key not configured');
        }
        if (!this.folderId || this.folderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID') {
            throw new Error('Google Drive folder ID not configured');
        }
    }

    async getFiles() {
        const url = `${this.baseUrl}/files?q='${this.folderId}' in parents and mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime)&key=${this.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Google Drive API error: ${error.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log(`Found ${data.files?.length || 0} Google Docs`);
        return data.files || [];
    }

    async processFile(file) {
        try {
            const content = await this.getFileContent(file.id);
            const noteData = {
                title: file.name,
                content: content,
                file_id: file.id,
                meeting_date: this.extractDate(file.name),
                last_modified: file.modifiedTime
            };

            // Check if file exists
            const { data: existing } = await window.supabase
                .from('meeting_notes')
                .select('last_modified')
                .eq('file_id', file.id)
                .single();

            if (existing) {
                // Update if modified
                if (new Date(file.modifiedTime) > new Date(existing.last_modified)) {
                    await window.supabase
                        .from('meeting_notes')
                        .update(noteData)
                        .eq('file_id', file.id);
                    console.log(`Updated: ${file.name}`);
                }
            } else {
                // Insert new
                await window.supabase
                    .from('meeting_notes')
                    .insert([noteData]);
                console.log(`Added: ${file.name}`);
            }
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error.message);
        }
    }

    async getFileContent(fileId) {
        const url = `${this.baseUrl}/files/${fileId}/export?mimeType=text/plain&key=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to get file content: ${response.statusText}`);
        }
        
        return await response.text();
    }

    extractDate(title) {
        // Simple date extraction patterns
        const patterns = [
            /(\d{4}-\d{2}-\d{2})/,     // 2024-01-15
            /(\d{1,2}\/\d{1,2}\/\d{4})/, // 1/15/2024
            /(\d{1,2}-\d{1,2}-\d{4})/   // 1-15-2024
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                const dateStr = match[0];
                try {
                    if (dateStr.includes('/')) {
                        const [month, day, year] = dateStr.split('/');
                        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    } else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                        const [month, day, year] = dateStr.split('-');
                        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    return dateStr; // Already in YYYY-MM-DD format
                } catch (e) {
                    continue;
                }
            }
        }
        
        return new Date().toISOString().split('T')[0]; // Default to today
    }

    async getStats() {
        try {
            const { data: notes, error } = await window.supabase
                .from('meeting_notes')
                .select('updated_at')
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            return {
                totalNotes: notes?.length || 0,
                lastSync: notes?.length > 0 ? 
                    new Date(notes[0].updated_at).toLocaleDateString() : 'Never'
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return { totalNotes: 0, lastSync: 'Error' };
        }
    }

    // Simple test method
    static async test() {
        const sync = new GoogleDriveSync();
        return await sync.syncMeetingNotes();
    }
} 