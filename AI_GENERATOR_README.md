# Voltaic AI App Generator

A powerful AI-driven application generator that creates complete, production-ready web applications from natural language descriptions. Built with Next.js, TypeScript, and beautiful glass morphism UI.

## 🚀 Features

- **Conversational AI Interface** - Chat with AI to describe your app idea
- **Real-time Code Generation** - Watch your app being built live
- **Live Preview** - See your generated app in action immediately
- **Glass Morphism UI** - Beautiful, modern design system
- **Production Ready** - Clean, scalable code with best practices
- **Multiple AI Providers** - Support for OpenAI and Anthropic
- **File Management** - Complete project structure generation
- **Responsive Design** - Mobile-first approach

## 🎯 How It Works

1. **Describe Your Idea** - Tell the AI what kind of app you want to build
2. **AI Analysis** - The system analyzes your requirements and plans the architecture
3. **Code Generation** - Complete files are generated with components, pages, and styling
4. **Live Preview** - See your app running immediately
5. **Iterate & Refine** - Chat with the AI to make changes and improvements

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key OR Anthropic API key

### Environment Variables

Create a `.env.local` file with your AI provider credentials:

```bash
# OpenAI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_OPENAI_MODEL=gpt-4

# OR Anthropic Configuration  
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
NEXT_PUBLIC_ANTHROPIC_MODEL=claude-3-5-haiku-latest

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000/ai-generator](http://localhost:3000/ai-generator)

## 💡 Usage Examples

### Basic App Ideas

Try these prompts to get started:

- **"A todo app with user authentication and real-time sync"**
- **"A recipe sharing platform with ratings and comments"**
- **"A fitness tracker with workout plans and progress charts"**
- **"A project management tool with team collaboration"**
- **"A social media dashboard with analytics"**
- **"An e-commerce store with payment integration"**

### Advanced Features

The AI can understand and implement:

- **Authentication** - Google OAuth, user profiles, session management
- **Real-time Updates** - Live data synchronization
- **Payment Integration** - Stripe, PayPal integration
- **Analytics** - Charts, dashboards, metrics
- **Search** - Full-text search, filtering
- **Notifications** - Real-time alerts, email notifications
- **File Upload** - Image/document handling
- **API Integration** - Third-party service connections

## 🏗️ Architecture

### Core Components

```
src/
├── components/ai/
│   └── PromptInterface.tsx     # Main AI chat interface
├── lib/
│   ├── ai-service.ts          # AI provider integration
│   └── voltaic-prompts/       # System prompts and context
├── components/glass/          # Glass morphism UI library
└── app/ai-generator/          # AI generator page
```

### AI Service Architecture

The AI service (`src/lib/ai-service.ts`) handles:

- **Prompt Analysis** - Understanding user requirements
- **Code Generation** - Creating complete file structures
- **Preview Generation** - Building HTML previews
- **Feature Detection** - Identifying required functionality
- **Error Handling** - Graceful fallbacks and recovery

### Glass Component System

Pre-built glass morphism components:

```typescript
import { GlassCard, GlassButton, GlassInput } from '@/components/glass';

// Usage examples
<GlassCard title="Dashboard" padding="lg" hover>
  <GlassInput label="Email" value={email} onChange={setEmail} />
  <GlassButton variant="primary" onClick={handleSubmit}>
    Submit
  </GlassButton>
</GlassCard>
```

## 🤖 AI Integration

### Supported Providers

1. **OpenAI** - GPT-4, GPT-3.5-turbo
2. **Anthropic** - Claude 3.5 Haiku, Claude 3 Sonnet

### System Prompts

The system uses sophisticated prompts from `src/lib/voltaic-prompts/` that include:

- **Role Definition** - AI identity and capabilities
- **Technical Standards** - Next.js, TypeScript, Tailwind CSS
- **Design Guidelines** - Glass morphism, Apple-like design
- **Code Quality** - Production-ready, accessible, responsive
- **Integration Patterns** - Supabase, authentication, databases

### Request Flow

1. **User Input** → Prompt analysis
2. **Context Building** → System prompt assembly
3. **AI Request** → Provider API call
4. **Response Parsing** → Code extraction
5. **Project Creation** → File generation
6. **Preview Building** → HTML compilation

## 🎨 Generated App Structure

Each generated app includes:

### Core Files
- `src/app/page.tsx` - Main application page
- `src/components/AppHeader.tsx` - Navigation header
- `src/components/MainContent.tsx` - Primary content area

### Optional Components (based on features)
- `src/components/AuthSection.tsx` - Authentication UI
- `src/components/Dashboard.tsx` - Analytics dashboard
- `src/components/SearchBar.tsx` - Search functionality
- `src/lib/types.ts` - TypeScript definitions

### Styling
- Glass morphism design system
- Responsive grid layouts
- Dark theme optimized
- Smooth animations and transitions

## 🔧 Customization

### Adding New AI Providers

1. Extend `VoltaicAIService` class
2. Add provider-specific API calls
3. Update environment variable handling
4. Test with provider's API format

### Custom Prompts

Modify `src/lib/voltaic-prompts/index.ts` to:
- Add new prompt sections
- Customize code generation patterns
- Include specific frameworks or libraries
- Adjust design guidelines

### UI Components

Extend the glass component library:
- Add new variants and sizes
- Create specialized components
- Implement custom animations
- Build complex layouts

## 📊 Features by Category

### UI/UX
- ✅ Glass morphism design
- ✅ Responsive layouts
- ✅ Dark theme support
- ✅ Smooth animations
- ✅ Accessibility compliance

### Development
- ✅ TypeScript support
- ✅ Next.js App Router
- ✅ Component-based architecture
- ✅ Clean code generation
- ✅ Best practices enforcement

### Integration
- ✅ Supabase database
- ✅ Google OAuth
- ✅ Real-time updates
- ✅ API endpoints
- ✅ Third-party services

### Deployment
- ✅ Vercel optimization
- ✅ Environment management
- ✅ Performance optimization
- ✅ SEO friendly
- ✅ Production ready

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions

## 🔮 Roadmap

- [ ] Real AI API integration (currently using fallback)
- [ ] More AI providers (Google Gemini, Cohere)
- [ ] Advanced code editing capabilities
- [ ] Project export/import
- [ ] Template library
- [ ] Collaborative editing
- [ ] Version control integration
- [ ] Advanced deployment options

---

**Built with ❤️ by the Voltaic Team**

Transform your ideas into reality with AI-powered development! 