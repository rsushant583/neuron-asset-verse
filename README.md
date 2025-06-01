
# MetaMind Platform - Voice-Driven eBook Creation

A fully voice-command-driven platform inspired by Jarvis, designed for older users (60+) to create and monetize digital products like medical eBooks. Built with React, Tailwind CSS, and ShadCN UI with WCAG 2.1 AA compliance.

## Features

### 🎙️ Voice-Command System (Jarvis-like)
- **Navigation**: "Go to dashboard", "Open marketplace", "Start eBook creation"
- **Actions**: "Create medical eBook", "Record story", "Edit draft", "Publish now"
- **Autofill**: "Set title to [spoken title]", "Set category to medical"
- **Version Control**: "Show drafts", "Open draft version 2", "Save draft"

### 📚 Intelligent Content Management
- AI-powered draft generation from voice/text input
- Chapter-wise content structuring
- Unique, copyright-compliant title suggestions
- Version control system for iterative editing

### ♿ Accessibility Features (WCAG 2.1 AA)
- 4.5:1 contrast ratio minimum
- 20px+ font sizes for readability
- 48x48px minimum touch targets
- Voice feedback at 0.8x speed for older users
- High contrast mode toggle

## Project Structure

```
frontend/src/
├── components/
│   ├── VoiceAssistant.tsx      # Jarvis-like voice command system
│   ├── CreatorWizard.tsx       # Enhanced multi-step creation wizard
│   ├── VoiceInput.tsx          # Voice-to-text input component
│   ├── DraftEditor.tsx         # AI-powered content editor
│   ├── VersionControl.tsx      # Draft version management
│   ├── TemplateSelector.tsx    # eBook template selection
│   └── PublishForm.tsx         # Publishing and pricing
├── hooks/
│   ├── useVoiceCommands.ts     # Voice recognition hook
│   ├── useVersionControl.ts    # Draft management hook
│   └── useAccessibility.ts     # Accessibility preferences
├── lib/
│   ├── api.ts                  # API utilities
│   └── versionControl.ts       # Version control API
├── pages/
│   └── Dashboard.tsx           # Enhanced dashboard with voice support
└── styles/
    └── accessibility.css       # WCAG compliant styles

backend/
└── routes/
    └── drafts.py              # FastAPI endpoints for draft management

ai/
└── grok_client.py             # Placeholder for Grok AI integration

blockchain/
├── mint_nft.py                # Placeholder for Polygon NFT minting
└── web3_config.js             # Web3 configuration
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Modern browser with Web Speech API support

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Backend Setup (Optional)
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install fastapi uvicorn python-multipart

# Start FastAPI server
python -m uvicorn routes.drafts:app --reload --port 8000
```

## Voice Commands Reference

### Navigation
- "Go to dashboard" - Navigate to main dashboard
- "Open marketplace" - Go to product marketplace
- "Start eBook creation" - Begin creation wizard

### Content Creation
- "Create medical eBook" - Start with medical category pre-selected
- "Record story" - Begin voice recording
- "Edit draft" - Open draft editor
- "Generate draft" - Create AI-powered content

### Draft Management
- "Save draft" - Save current progress
- "Show drafts" - Display version control panel
- "Open draft version [number]" - Load specific draft version

### Content Enhancement
- "Suggest title" - Generate unique title suggestions
- "Set title to [title]" - Set specific title via voice
- "Set category to [category]" - Set content category

### Publishing
- "Publish now" - Proceed to publishing step
- "Check title" - Verify title uniqueness

## API Endpoints

### Draft Management
- `POST /api/save-draft` - Save new draft version
- `GET /api/drafts/{user_id}` - Get all user drafts
- `DELETE /api/drafts/{draft_id}` - Delete specific draft

### Content Enhancement
- `POST /api/check-title` - Check title uniqueness
- `POST /api/suggest-titles` - Generate title suggestions
- `POST /api/analyze-content` - Structure content into chapters

## Accessibility Features

### Visual
- High contrast mode (toggle in settings)
- Large text option (24px+ body text)
- 4.5:1 minimum contrast ratio
- Clear focus indicators

### Motor
- 48x48px minimum touch targets
- Voice-driven navigation reduces need for precise clicking
- Keyboard navigation support

### Cognitive
- Voice feedback confirms all actions
- Clear, simple language in all prompts
- Consistent navigation patterns
- Auto-save functionality prevents data loss

### Auditory
- Text-to-speech for all content
- Adjustable speech rate (0.8x default for older users)
- Visual indicators complement audio feedback

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library
- **Web Speech API** - Voice recognition/synthesis
- **Framer Motion** - Animations
- **React Router** - Navigation

### Backend (Placeholders)
- **FastAPI** - Python web framework
- **Supabase** - Database and authentication
- **Grok AI** - Content analysis and generation
- **Polygon** - NFT minting for digital ownership

## Voice Recognition Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended browser |
| Edge | ✅ Full | WebKit-based versions |
| Safari | ⚠️ Limited | iOS 14.5+ required |
| Firefox | ❌ None | No Web Speech API support |

## Development Guidelines

### Accessibility Testing
```bash
# Install accessibility testing tools
npm install -D @axe-core/react eslint-plugin-jsx-a11y

# Run accessibility audit
npm run a11y-audit
```

### Voice Command Testing
1. Enable microphone permissions
2. Use Chrome DevTools to simulate voice input
3. Test with various accents and speech patterns
4. Verify fallback behavior for unsupported browsers

### Performance Optimization
- Lazy load voice recognition only when needed
- Debounce auto-save operations
- Compress audio data for voice transcription
- Cache frequently used AI suggestions

## Contributing

1. Follow WCAG 2.1 AA guidelines for all UI changes
2. Test voice commands across different browsers
3. Ensure new features work without voice input
4. Add appropriate ARIA labels and semantic HTML
5. Test with screen readers and keyboard navigation

## License

MIT License - see LICENSE file for details

## Support

For accessibility issues or voice command problems:
- Check browser microphone permissions
- Ensure stable internet connection for AI features
- Use keyboard navigation as fallback
- Contact support for additional assistance

---

**Built with ❤️ for older adults who want to share their wisdom with the world**
