# TSA Website

A modern, responsive website for the Technology Student Association with user authentication and event management.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
node setup.js
```

### Option 2: Manual Setup
1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. Copy the Supabase configuration template:
   ```bash
   cp js/supabase-config.template.js js/supabase-config.js
   ```

## 🏃‍♂️ Running the Website

Start a local server:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔒 Security Features

- ✅ Environment variables for sensitive data
- ✅ `.env` file automatically ignored by Git
- ✅ Supabase configuration file excluded from repository
- ✅ Template files provided for easy setup
- ✅ Public repository safe for sharing

## 📚 Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 🛠️ Features

- User authentication (sign up/sign in)
- Event management and display
- Responsive design
- Modern UI/UX
- Supabase backend integration

## 📁 Project Structure

```
TSA-Website/
├── .env                    # Environment variables (not in Git)
├── .gitignore             # Git ignore rules
├── env.example            # Environment template
├── setup.js               # Automated setup script
├── SETUP.md               # Detailed setup guide
├── js/
│   ├── env-config.js      # Environment loader
│   ├── supabase-config.js # Supabase config (not in Git)
│   └── supabase-config.template.js # Template
├── css/                   # Stylesheets
├── index.html             # Home page
├── signin.html            # Sign in page
├── signup.html            # Sign up page
└── events.html            # Events page
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
