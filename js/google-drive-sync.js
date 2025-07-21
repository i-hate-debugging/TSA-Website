// Google Drive Sync Service for TSA Meeting Notes
class GoogleDriveSync {
    constructor() {
        this.apiKey = window.GOOGLE_DRIVE_API_KEY;
        this.folderId = window.GOOGLE_DRIVE_FOLDER_ID;
        this.baseUrl = 'https://www.googleapis.com/drive/v3';
    }

    async syncMeetingNotes() {
        try {
            if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_DRIVE_API_KEY') {
                throw new Error('Google Drive API key not configured');
            }
            
            if (!this.folderId || this.folderId === 'YOUR_GOOGLE_DRIVE_FOLDER_ID') {
                throw new Error('Google Drive folder ID not configured');
            }

            console.log('Syncing meeting notes from Google Drive...');
            
            // Get files from the specific folder
            const files = await this.getFilesFromFolder();
            
            let processed = 0;
            for (const file of files) {
                await this.processMeetingFile(file);
                processed++;
            }
            
            console.log(`Sync completed successfully - processed ${processed} files`);
            return { success: true, filesProcessed: processed };
            
        } catch (error) {
            console.error('Sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getFilesFromFolder() {
        const url = `${this.baseUrl}/files?q='${this.folderId}' in parents and mimeType='application/vnd.google-apps.document'&fields=files(id,name,modifiedTime)&key=${this.apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google Drive API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        return data.files || [];
    }

    async processMeetingFile(file) {
        try {
            // Get file content
            const content = await this.getFileContent(file.id);
            
            // Check if file already exists in database
            const { data: existingNote } = await window.supabase
                .from('meeting_notes')
                .select('*')
                .eq('file_id', file.id)
                .single();

            const noteData = {
                title: file.name,
                content: content,
                file_id: file.id,
                meeting_date: this.extractDateFromTitle(file.name),
                last_modified: file.modifiedTime
            };

            if (existingNote) {
                // Update existing note if modified
                if (new Date(file.modifiedTime) > new Date(existingNote.last_modified)) {
                    await window.supabase
                        .from('meeting_notes')
                        .update(noteData)
                        .eq('file_id', file.id);
                    console.log(`Updated: ${file.name}`);
                }
            } else {
                // Insert new note
                await window.supabase
                    .from('meeting_notes')
                    .insert([noteData]);
                console.log(`Added: ${file.name}`);
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            // Continue processing other files even if one fails
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

    extractDateFromTitle(title) {
        // Try different date patterns commonly used in meeting notes
        const patterns = [
            /(\d{4}-\d{2}-\d{2})/,           // 2024-01-15
            /(\d{2}-\d{2}-\d{4})/,           // 01-15-2024
            /(\d{1,2}\/\d{1,2}\/\d{4})/,     // 1/15/2024
            /(\d{1,2}-\d{1,2}-\d{4})/        // 1-15-2024
        ];
        
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                try {
                    const dateStr = match[0];
                    // Convert to YYYY-MM-DD format
                    if (dateStr.includes('/')) {
                        const [month, day, year] = dateStr.split('/');
                        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    } else if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
                        const [month, day, year] = dateStr.split('-');
                        return `${year}-${month}-${day}`;
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
        
        // If no date found, use current date
        return new Date().toISOString().split('T')[0];
    }

    async getMeetingStats() {
        try {
            const { data: notes, error } = await window.supabase
                .from('meeting_notes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                totalNotes: notes ? notes.length : 0,
                lastSync: notes && notes.length > 0 ? 
                    new Date(notes[0].updated_at).toLocaleDateString() : 'Never'
            };
        } catch (error) {
            console.error('Error getting meeting stats:', error);
            return { totalNotes: 0, lastSync: 'Error' };
        }
    }
} 