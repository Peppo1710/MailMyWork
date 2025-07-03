# PingUp - Daily Todo Summary Sender

A Chrome extension that helps you manage daily tasks and automatically sends professional email summaries using AI-powered content generation.

## Features

### 🔐 **Authentication**
- Secure login with Gmail credentials
- Password encryption using bcrypt-like hashing
- Local storage for credentials with encryption

### 📝 **Todo Management**
- Add tasks with title and description
- Mark tasks as completed
- Delete tasks
- Automatic expiration after 24 hours
- Clean, modern interface

### 📧 **Email Features**
- AI-powered email generation using Google Gemini
- Customizable email context and format
- Email preview before sending
- Support for To, CC, and BCC recipients
- Professional scrum-style email format

### ⏰ **Automation**
- Toggle for automatic daily email sending at 6 PM
- Manual email sending option
- Automatic cleanup of completed tasks

### 🎨 **Modern UI**
- Beautiful dark theme design
- Responsive layout
- Tabbed interface for better organization
- Loading states and success/error notifications

## Project Structure

```
Noted/
├── Extension/                 # Chrome Extension
│   ├── css/
│   │   └── styles.css        # Modern UI styles
│   ├── js/
│   │   └── popup.js          # Main application logic
│   ├── utils/
│   │   ├── crypto.js         # Encryption utilities
│   │   └── storage.js        # Chrome storage management
│   ├── background.js         # Background service worker
│   ├── popup.html           # Main extension popup
│   ├── manifest.json        # Extension manifest
│   └── icons.png            # Extension icons
└── Extension_backend/        # Node.js Backend
    ├── emailer.js           # Email processing logic
    ├── server.js            # Express server
    ├── package.json         # Dependencies
    └── .env                 # Environment variables
```

## Installation & Setup

### 1. Backend Setup

```bash
cd Extension_backend
npm install
```

Create a `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

Start the server:
```bash
npm start
```

### 2. Gemini API Key Setup

To use the AI-powered email generation, you need a Gemini API key.

1. Go to the [Google AI Gemini API Console](https://aistudio.google.com/app/apikey) to generate your API key.
2. Create a `.env` file in the `Extension_backend` directory (if you haven't already) and add the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

Replace `your_gemini_api_key_here` with the API key you obtained from the Gemini API Console.

### 3. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `Extension` folder
4. The PingUp extension should now appear in your extensions list

### 4. Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Create an App Password for "Mail"
4. Use this 16-character password in the extension

## Usage

### First Time Setup
1. Click the PingUp extension icon
2. Enter your Gmail address and 16-character app password
3. Configure email recipients in the "Recipients" tab
4. Customize email format in the "Email Context" tab

### Daily Usage
1. **Add Tasks**: Use the "Todos" tab to add your daily tasks
2. **Manage Tasks**: Mark tasks as completed or delete them
3. **Send Emails**: Use the "Send Email" button or enable auto-send
4. **Preview**: Generate email previews before sending

### Email Format
The extension generates professional emails with this structure:
- **EPIC**: General project overview
- **User Story**: Main user story description
- **Task**: Progress summary
- Professional closing

## Technical Details

### Security
- Passwords are hashed using SHA-256 with salt
- Encrypted storage in Chrome local storage
- Secure transmission to backend

### API Integration
- Google Gemini AI for email generation
- Gmail SMTP for email sending
- RESTful API communication

### Data Management
- Local storage for todos and settings
- Automatic cleanup of expired tasks
- Persistent user preferences

## Development

### Frontend (Extension)
- Vanilla JavaScript with ES6 modules
- Chrome Extension Manifest V3
- Modern CSS with CSS variables

### Backend
- Node.js with Express
- Nodemailer for email sending
- Axios for API calls
- CORS enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository. 