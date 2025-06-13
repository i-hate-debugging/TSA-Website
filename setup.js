#!/usr/bin/env node

/**
 * TSA Website Setup Script
 * This script helps you set up your environment variables quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('🚀 TSA Website Setup\n');
    console.log('This script will help you set up your environment variables.\n');
    
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }
    
    console.log('\n📝 Please provide your Supabase credentials:');
    console.log('You can find these in your Supabase project dashboard under Settings → API\n');
    
    const supabaseUrl = await question('Supabase URL (e.g., https://your-project.supabase.co): ');
    const supabaseKey = await question('Supabase Anonymous Key: ');
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Both URL and key are required. Setup cancelled.');
        rl.close();
        return;
    }
    
    // Create .env file
    const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseKey}

# Optional: Additional environment variables can be added here
# DATABASE_URL=your_database_url
# API_KEY=your_api_key
`;
    
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');
        
        // Check if supabase-config.js exists
        const configPath = path.join(__dirname, 'js', 'supabase-config.js');
        if (!fs.existsSync(configPath)) {
            const templatePath = path.join(__dirname, 'js', 'supabase-config.template.js');
            if (fs.existsSync(templatePath)) {
                fs.copyFileSync(templatePath, configPath);
                console.log('✅ Supabase configuration file created from template!');
            }
        }
        
        console.log('\n🎉 Setup complete! You can now run your website.');
        console.log('\n📖 Next steps:');
        console.log('1. Start a local server (e.g., python -m http.server 8000)');
        console.log('2. Open http://localhost:8000 in your browser');
        console.log('3. Check the browser console for any setup messages');
        
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
    }
    
    rl.close();
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log('\n\nSetup cancelled.');
    rl.close();
    process.exit(0);
});

setup().catch(console.error); 