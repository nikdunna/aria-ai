# AI Productivity Scheduler

A beautiful, chat-based productivity app powered by AI that integrates with Google Calendar to help you plan and manage your day efficiently.

## ✨ Features

- **Chat-based Interface**: Natural language scheduling through a sleek chat UI
- **AI Model Selection**: Choose between OpenAI GPT models and Claude with descriptive tooltips
- **Google Calendar Integration**: Full read/write access to your calendar events
- **Beautiful UI**: Modern design using Tailwind CSS and shadcn/ui components
- **Dark Mode**: Built-in theme switching
- **Modular Architecture**: Easily extensible with clean separation of concerns
- **Command Palette**: Quick access to all features

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone <your-repo>
   cd ai-productivity-scheduler
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Google OAuth Setup**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Calendar API
   - Create OAuth2 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

4. **API Keys**

   - Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
   - Get Anthropic API key from [Anthropic Console](https://console.anthropic.com/)

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

```
app/                    # Next.js App Router
├── chat/              # Chat interface pages
├── dashboard/         # Dashboard pages
├── api/               # API routes
│   ├── auth/          # NextAuth.js routes
│   ├── chat/          # Chat completions
│   └── calendar/      # Google Calendar integration

components/            # React components
├── ui/               # shadcn/ui base components
├── chat/             # Chat-specific components
├── views/            # Sidebar view components
└── model-select/     # AI model selection

lib/                  # Utility libraries
├── llm/              # LLM abstraction layer
├── auth/             # Authentication utilities
└── utils/            # General utilities

integrations/         # External service integrations
├── gcal/             # Google Calendar
└── weather/          # Weather API (stub)

types/                # TypeScript type definitions
constants/            # App constants and configuration
```

## 🤖 AI Models

The app supports multiple AI providers through a unified interface:

- **OpenAI GPT-4**: Best for complex reasoning and long-form responses
- **OpenAI GPT-3.5 Turbo**: Fast and cost-effective for daily tasks
- **Claude 3 Sonnet**: Excellent for detailed analysis and planning
- **Claude 3 Haiku**: Quick responses for simple scheduling tasks

## 📅 Calendar Integration

- **OAuth2 Authentication**: Secure Google account integration
- **Read Events**: View your existing calendar events
- **Create Events**: Schedule new appointments through chat
- **Update Events**: Modify existing events via natural language
- **Conflict Detection**: Smart scheduling that respects existing commitments

## 🎨 UI Components

- **Chat Interface**: iMessage-style messages with smooth animations
- **Sidebar Views**: Toggleable panels for calendar, weather, and settings
- **Model Selector**: Beautiful dropdown with model descriptions
- **Command Palette**: Keyboard-driven quick actions
- **Dark Mode**: Seamless theme switching

## 🔧 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Test with UI
npm run test:ui

# Coverage
npm run coverage
```

## 🚀 Deployment

The app is optimized for Vercel deployment:

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: NextAuth.js
- **AI**: OpenAI API, Anthropic Claude API
- **Calendar**: Google Calendar API
- **Validation**: Zod
- **Database**: Prisma (future integration)

## 📝 License

MIT License - feel free to use this project for your own productivity needs!
