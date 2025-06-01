
# MetaMind Voice-Driven eBook Platform

A fully voice-controlled platform for creating and publishing eBooks, designed specifically for older users (60+) with accessibility and ease-of-use in mind.

## 🎯 Features

### Voice Assistant (Jarvis-like Experience)
- **Continuous Listening**: Toggle via floating microphone button
- **Natural Commands**: Support for "Hey MetaMind" prefix (optional)
- **Error Recovery**: Robust error handling with automatic retry
- **Visual Feedback**: Real-time status indicators and toast notifications

### Supported Voice Commands

#### Authentication
- "Sign in with email" - Navigate to login page
- "Log out" - Sign out current user

#### Navigation
- "Go to dashboard" - Navigate to dashboard
- "Go to marketplace" - Open marketplace
- "Open eBook creation" - Start creation wizard

#### eBook Creation
- "Create medical eBook" - Start wizard with medical category
- "Create business eBook" - Start wizard with business category
- "Set title to [title]" - Autofill title with uniqueness check
- "Select category medical" - Set category
- "Give me a unique title about [topic]" - AI-generated title suggestions

#### Draft Management
- "Save draft" - Save current progress
- "Show drafts" - Display version control panel
- "Open draft version [number]" - Load specific draft
- "Refresh drafts" - Update draft list

#### Wizard Control
- "Next step" - Move to next step in wizard
- "Previous step" / "Go back" - Move to previous step
- "Submit eBook" / "Publish now" - Submit for publishing

#### Content Management
- "Start recording" - Begin voice recording
- "Stop recording" - End voice recording
- "Edit draft" - Open draft editor

#### Help
- "Help" / "What can I say" - Show available commands

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, ShadCN UI
- **Voice**: Web Speech API (Recognition & Synthesis)
- **State Management**: React Hooks, Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Toastify

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── VoiceAssistant.tsx      # Main voice command handler
│   ├── CreatorWizard.tsx       # eBook creation wizard
│   ├── VersionControl.tsx      # Draft version management
│   ├── DraftEditor.tsx         # Content editing interface
│   ├── VoiceInput.tsx          # Voice recording component
│   ├── TemplateSelector.tsx    # Template selection
│   └── PublishForm.tsx         # Publishing interface
├── pages/
│   ├── Dashboard.tsx           # User dashboard
│   ├── Create.tsx             # Creation page
│   └── Market.tsx             # Marketplace
├── hooks/
│   ├── useVoiceCommands.ts    # Voice recognition hook
│   ├── useVersionControl.ts   # Draft management hook
│   └── useAccessibility.ts    # Accessibility preferences
├── lib/
│   ├── api.ts                 # API client with error handling
│   └── versionControl.ts      # Version control utilities
└── styles/
    └── accessibility.css      # WCAG 2.1 AA compliant styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with Web Speech API support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neuron-asset-verse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

### Browser Permissions

The app requires microphone access for voice commands:
1. Click the microphone button
2. Allow microphone permissions when prompted
3. Start speaking commands

## 🎙 Voice Recognition Setup

### Supported Browsers
- Chrome 25+ (Recommended)
- Edge 79+
- Safari 14.1+
- Firefox (limited support)

### Troubleshooting Voice Issues

1. **Microphone Access Denied**
   - Check browser permissions in Settings
   - Ensure HTTPS connection (required for Web Speech API)
   - Try refreshing the page

2. **No Speech Detected**
   - Speak clearly and at normal volume
   - Check microphone is working in other apps
   - Try moving closer to microphone

3. **Commands Not Recognized**
   - Speak slowly and clearly
   - Use exact command phrases
   - Try the "Help" command to see available options

## 🎨 Design System

### Typography
- **Body Text**: 16px Inter, line-height 1.6
- **Headings**: 22px Inter, line-height 1.4
- **Hero Text**: 28px Inter, line-height 1.3

### Colors (WCAG 2.1 AA Compliant)
- **Primary**: #4B8BBE (4.5:1 contrast ratio)
- **Secondary**: #F4A261
- **Background**: #FFFFFF
- **Text**: #1F2937

### Accessibility Features
- **Touch Targets**: Minimum 48x48px
- **Focus Indicators**: 3px outline with offset
- **Voice Feedback**: 0.8x speed for better comprehension
- **High Contrast Mode**: Toggle for enhanced visibility
- **Large Text Mode**: 20-32px font sizes
- **Reduced Motion**: Respects user preferences

## 🔧 API Endpoints

### Authentication
- `POST /auth/sign-in` - User authentication
- `POST /auth/sign-out` - User logout

### Content Management
- `POST /check-title` - Title uniqueness check
- `POST /suggest-title` - AI title generation
- `POST /save-draft` - Save draft version
- `GET /drafts/:userId` - Get user drafts
- `DELETE /drafts/:draftId` - Delete draft

### AI Services
- `POST /api/draft` - Generate AI content
- `POST /api/analyze-content` - Content structure analysis

## 🧪 Testing Voice Commands

1. **Start the voice assistant** by clicking the microphone button
2. **Wait for the "Listening..." indicator**
3. **Speak clearly**: "Create medical eBook"
4. **Observe feedback**: Toast notification and voice response
5. **Try navigation**: "Go to dashboard"
6. **Test error handling**: Say an unrecognized command

### Example Test Scenarios

```javascript
// Test basic navigation
"Go to dashboard" → Should navigate to /dashboard

// Test content creation
"Create medical eBook" → Should open wizard with medical category

// Test title setting
"Set title to Healing Wisdom" → Should autofill title field

// Test draft management
"Save draft" → Should save current progress
"Show drafts" → Should display version control panel

// Test help system
"Help" → Should show available commands
```

## 🔐 Security & Privacy

- **Microphone Access**: Only used for voice commands, not recorded
- **Speech Data**: Processed locally via Web Speech API
- **Authentication**: Secure JWT tokens via Supabase
- **Data Encryption**: All API communications over HTTPS

## 🌐 Browser Support

| Browser | Version | Voice Support | Notes |
|---------|---------|---------------|--------|
| Chrome | 25+ | ✅ Full | Recommended |
| Edge | 79+ | ✅ Full | Good |
| Safari | 14.1+ | ⚠️ Limited | iOS Safari has restrictions |
| Firefox | Latest | ❌ None | No Web Speech API support |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/voice-enhancement`)
3. Commit changes (`git commit -am 'Add new voice command'`)
4. Push to branch (`git push origin feature/voice-enhancement`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issue with voice command logs
- **Voice Problems**: Include browser version and error console output

---

Built with ❤️ for accessibility and voice-first experiences.
