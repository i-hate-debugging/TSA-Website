# TSA Website Setup Guide

This guide will help you set up the TSA website with proper environment variable configuration to keep your Supabase API keys secure.

## Prerequisites

- A Supabase account and project
- Your Supabase project URL and anonymous key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TSA-Website
```

### 2. Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your actual Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" and "anon public" key
   - Paste them into your `.env` file

### 3. Set Up Supabase Configuration

1. **Copy the template configuration:**
   ```bash
   cp js/supabase-config.template.js js/supabase-config.js
   ```

2. **The configuration will automatically use your environment variables** from the `.env` file.

### 4. Start the Development Server

Since this is a static website, you can serve it using any local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx serve .
```

**Using PHP:**
```bash
php -S localhost:8000
```

### 5. Access the Website

Open your browser and navigate to:
- `http://localhost:8000` (or whatever port you're using)

## Security Notes

- ✅ The `.env` file is automatically ignored by Git (see `.gitignore`)
- ✅ Your API keys will never be committed to the repository
- ✅ The `js/supabase-config.js` file is also ignored to prevent accidental commits
- ✅ Only the template files are included in the repository

## File Structure

```
TSA-Website/
├── .env                    # Your environment variables (not in Git)
├── .gitignore             # Git ignore rules
├── env.example            # Example environment file
├── js/
│   ├── env-config.js      # Environment loader
│   ├── supabase-config.js # Your Supabase config (not in Git)
│   └── supabase-config.template.js # Template for others
├── index.html
└── ... (other files)
```

## Troubleshooting

### Environment Variables Not Loading

1. Make sure your `.env` file is in the root directory
2. Check that the file format is correct (no spaces around `=`)
3. Verify your Supabase credentials are correct

### Supabase Connection Issues

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure your database tables are set up correctly

### Development vs Production

- **Development**: Uses `.env` file for local development
- **Production**: Set environment variables on your hosting platform
  - For Netlify: Use Environment Variables in site settings
  - For Vercel: Use Environment Variables in project settings
  - For GitHub Pages: Use GitHub Secrets and Actions

## Support

If you encounter any issues, please check:
1. The browser console for error messages
2. Your Supabase project settings
3. The environment variable configuration

For additional help, refer to the [Supabase documentation](https://supabase.com/docs). 