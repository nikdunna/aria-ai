# AI Productivity Scheduler - Setup Guide

## Quick Start (5 minutes)

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd ai-productivity-scheduler
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

The `.env.local.example` file contains all required environment variables with helpful comments and setup instructions. Simply copy it and fill in your actual credentials:

```bash
# The example file includes:
# - NextAuth.js configuration with security notes
# - Google OAuth2 setup with step-by-step instructions
# - AI API key placeholders for OpenAI and Anthropic
# - Optional integrations for future expansion
# - Production deployment considerations
```

### 3. Google OAuth Setup (3 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 4. Get API Keys

**OpenAI (Optional):**

- Visit [OpenAI Platform](https://platform.openai.com/)
- Create API key
- Add to `.env.local`

**Anthropic (Optional):**

- Visit [Anthropic Console](https://console.anthropic.com/)
- Create API key
- Add to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Google!

---

## Project Architecture

This application follows modern React/Next.js best practices:

### 🏗️ Directory Structure

```
app/                    # Next.js App Router
├── api/               # API routes (Backend for Frontend)
├── chat/              # Chat interface pages
└── globals.css        # Global styles

components/            # React components
├── ui/               # shadcn/ui base components
├── chat/             # Chat-specific components
├── views/            # Sidebar view components
└── providers/        # Context providers

lib/                  # Utility libraries
├── hooks/            # Custom React hooks
├── llm/              # LLM abstraction layer
└── utils.ts          # Utility functions

integrations/         # External service integrations
├── gcal/             # Google Calendar
└── weather/          # Weather API (stub)

types/                # TypeScript definitions
constants/            # App constants
```

### 🎨 Design System

Built with **Tailwind CSS** and **shadcn/ui** for:

- ✅ Consistent design tokens
- ✅ Accessible components
- ✅ Dark/light mode support
- ✅ Mobile responsiveness

### 🔧 Key Features

1. **Chat-Based Interface**: Natural language scheduling
2. **AI Model Selection**: Switch between OpenAI and Anthropic models
3. **Google Calendar Integration**: Read/write calendar events
4. **Sidebar Views**: Calendar, weather, settings, model info
5. **Command Palette**: Keyboard shortcuts (⌘K)
6. **Dark Mode**: System/manual theme switching

---

## Development Guide

### Custom Hooks

The app uses custom hooks for clean component separation:

- `useChat()` - Chat message management
- `useCalendar()` - Calendar operations with error handling
- `useToast()` - Toast notifications

### API Routes

All API routes follow consistent patterns:

- `POST /api/chat` - AI completions
- `GET/POST/PUT/DELETE /api/calendar` - Calendar CRUD
- `GET /api/weather` - Weather data

### Component Architecture

Components are organized by domain:

- **UI Components**: Reusable, accessible components
- **Feature Components**: Domain-specific logic
- **View Components**: Sidebar panels
- **Provider Components**: Context/state management

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Add environment variables in dashboard
3. Deploy automatically on push

### Docker

```bash
docker build -t ai-scheduler .
docker run -p 3000:3000 ai-scheduler
```

---

## Extending the App

### Adding New AI Providers

1. Create provider class in `lib/llm/providers/`
2. Implement `LLMProvider` interface
3. Register in `lib/llm/index.ts`
4. Add to `constants/models.ts`

### Adding New Integrations

1. Create integration in `integrations/`
2. Add API routes in `app/api/`
3. Create custom hook in `lib/hooks/`
4. Add UI components as needed

### Adding New Sidebar Views

1. Create view component in `components/views/`
2. Add route to `components/sidebar/sidebar.tsx`
3. Update `types/index.ts` for `SidebarView`

---

## Troubleshooting

### Common Issues

**Build Errors:**

- Ensure all environment variables are set
- Check TypeScript errors with `npm run type-check`

**Authentication Issues:**

- Verify Google OAuth redirect URIs
- Check `NEXTAUTH_SECRET` is set

**Calendar Integration:**

- Ensure Google Calendar API is enabled
- Check OAuth scope includes calendar access

**AI Models Not Working:**

- Verify API keys are correct
- Check API key permissions/billing

### Getting Help

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [shadcn/ui Components](https://ui.shadcn.com/)
- See [NextAuth.js Guide](https://next-auth.js.org/)

---

## Performance Optimizations

The app includes several optimizations:

- **Route Handlers**: Efficient API architecture
- **Custom Hooks**: Reduced re-renders
- **Lazy Loading**: Components loaded on demand
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: User feedback for all actions

Built with ❤️ using modern web technologies.
