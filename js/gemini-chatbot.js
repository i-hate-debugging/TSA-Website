// Gemini AI Chatbot Service for TSA Meeting Notes
class GeminiChatbot {
    constructor() {
        this.apiKey = window.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async askQuestion(question) {
        try {
            if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
                throw new Error('Gemini API key not configured');
            }

            console.log('Asking Gemini:', question);
            
            // Get relevant meeting notes for context
            const context = await this.getMeetingContext(question);
            
            // Prepare the prompt
            const prompt = this.buildPrompt(question, context);
            
            // Call Gemini API
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

            // Save conversation to database
            await this.saveConversation(question, answer);

            console.log('Gemini response:', answer);
            return { success: true, answer };
            
        } catch (error) {
            console.error('Chatbot error:', error);
            return { success: false, error: error.message };
        }
    }

    async getMeetingContext(question) {
        try {
            const { data: notes, error } = await window.supabase
                .from('meeting_notes')
                .select('*')
                .order('meeting_date', { ascending: false })
                .limit(10); // Get last 10 meetings for context

            if (error) throw error;
            return notes || [];
        } catch (error) {
            console.error('Error getting meeting context:', error);
            return [];
        }
    }

    buildPrompt(question, meetingNotes) {
        let context = `You are a helpful assistant for the Technology Student Association (TSA). You help answer questions about meeting notes and organizational activities.

Here are the recent TSA meeting notes for context:

`;
        
        if (meetingNotes.length === 0) {
            context += "No meeting notes are currently available. Please inform the user that meeting notes need to be synced from Google Drive first.\n\n";
        } else {
            meetingNotes.forEach((note, index) => {
                const content = note.content.length > 800 ? 
                    note.content.substring(0, 800) + '...' : 
                    note.content;
                    
                context += `Meeting ${index + 1}: ${note.title}\n`;
                context += `Date: ${note.meeting_date || 'Not specified'}\n`;
                context += `Content: ${content}\n\n`;
            });
        }

        context += `Question: ${question}

Please provide a helpful, concise answer based on the meeting notes above. If the information isn't available in the notes, mention that and suggest syncing more recent notes if needed. Be professional and specific to TSA activities.

Answer:`;
        
        return context;
    }

    async saveConversation(question, answer) {
        try {
            const { user } = await window.auth.getCurrentUser();
            
            if (user) {
                await window.supabase
                    .from('chat_conversations')
                    .insert([{
                        user_id: user.id,
                        question,
                        answer
                    }]);
            }
        } catch (error) {
            console.error('Error saving conversation:', error);
            // Don't throw error - conversation saving is not critical
        }
    }

    async getChatHistory(limit = 20) {
        try {
            const { user } = await window.auth.getCurrentUser();
            
            if (!user) return [];

            const { data, error } = await window.supabase
                .from('chat_conversations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting chat history:', error);
            return [];
        }
    }

    async clearChatHistory() {
        try {
            const { user } = await window.auth.getCurrentUser();
            
            if (!user) return { success: false, error: 'User not authenticated' };

            const { error } = await window.supabase
                .from('chat_conversations')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error clearing chat history:', error);
            return { success: false, error: error.message };
        }
    }

    // Predefined sample questions to help users get started
    getSampleQuestions() {
        return [
            "What were the main decisions from the last meeting?",
            "What tasks are pending from recent meetings?",
            "Summarize the key points from this month's meetings",
            "What events are planned for the upcoming period?",
            "Who was assigned specific action items?",
            "What budget items were discussed?",
            "What competitions are we preparing for?"
        ];
    }
} 