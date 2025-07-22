// Gemini AI Chatbot Service for TSA Meeting Notes
class GeminiChatbot {
    constructor() {
        this.apiKey = window.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
        this.conversationHistory = [];
    }

    async askQuestion(question) {
        try {
            this.validateConfig();
            
            console.log('Asking Gemini:', question);
            
            // Build prompt with meeting notes context
            const prompt = await this.buildPrompt(question);
            
            // Call Gemini API
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          'Sorry, I could not generate a response.';

            console.log('Gemini response received');
            return { success: true, answer };
            
        } catch (error) {
            console.error('Chatbot error:', error.message);
            return { success: false, error: error.message };
        }
    }

    validateConfig() {
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
            throw new Error('Gemini API key not configured');
        }
    }

    async buildPrompt(question) {
        const meetingNotes = await this.getMeetingNotes();
        
        let prompt = `You are a helpful assistant for the Technology Student Association (TSA). Answer questions about meeting notes, activities, and to-do tasks. You have access to the complete content of recent meeting notes. Provide detailed, accurate answers based on the full meeting content.

Recent TSA meeting notes:

`;
        
        if (meetingNotes.length === 0) {
            prompt += "No meeting notes available. Please inform the user to sync from Google Drive first.\n\n";
        } else {
            meetingNotes.forEach((note, index) => {
                prompt += `Meeting ${index + 1}: ${note.title}\n`;
                prompt += `Date: ${note.meeting_date || 'Not specified'}\n`;
                prompt += `Content: ${note.content}\n\n`;
            });
        }

        prompt += `Question: ${question}\n\nAnswer based on the complete meeting notes above (full content provided). Be helpful, professional, and detailed in your response:`;
        
        return prompt;
    }

    async getMeetingNotes() {
        try {
            const { data: notes, error } = await window.supabase
                .from('meeting_notes')
                .select('title, content, meeting_date')
                .order('meeting_date', { ascending: false })
                .limit(5);

            if (error) throw error;
            return notes || [];
        } catch (error) {
            console.error('Error getting meeting notes:', error);
            return [];
        }
    }

    getSampleQuestions() {
        return [
            "What were the main decisions from the last meeting?",
            "What tasks are pending from recent meetings?",
            "Summarize the key points from this month's meetings",
            "What events are planned for the upcoming period?",
            "Who was assigned specific action items?"
        ];
    }

    // Simple test method
    static async test() {
        const chatbot = new GeminiChatbot();
        return await chatbot.askQuestion("Hello, can you help me with TSA meeting information?");
    }
} 