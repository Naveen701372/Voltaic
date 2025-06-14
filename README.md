# Voltaic - AI-Powered MVP Generator

Transform your ideas into production-ready MVPs with AI-powered development, stunning glass morphism UI, and seamless deployment.

## 🚀 Current Status

**Phase 1: Foundation & Setup** - ✅ **COMPLETED**

## 🚀 Current Status

**Phase 1: Foundation & Setup** - ✅ **COMPLETED**

See `TASKS.md` for detailed task tracking and progress updates.

### 🎨 Glass Design System

Our custom glass morphism design system includes:

- **Custom Tailwind Tokens**: Glass opacity variants, backdrop blur utilities, and custom animations
- **Glass Components**: Reusable React components with TypeScript support
- **Responsive Design**: Mobile-first approach with Apple-like clean aesthetics
- **Accessibility**: ARIA labels and keyboard navigation support

### 🏗️ Architecture

```
src/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with glass background
│   ├── page.tsx           # Landing page with glass components
│   └── globals.css        # Global styles
├── components/
│   └── glass/             # Glass morphism component system
│       ├── types.ts       # TypeScript interfaces
│       ├── utils.ts       # Utility functions for glass styles
│       ├── GlassCard.tsx  # Glass card component
│       ├── GlassButton.tsx # Glass button component
│       ├── GlassInput.tsx # Glass input components
│       └── index.ts       # Component exports
└── lib/
    └── supabase.ts        # Supabase client configuration
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with virtual environment

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo-url>
   cd Voltaic
   ```

2. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate  # On macOS/Linux
   # or
   .venv\Scripts\activate     # On Windows
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Environment setup:**
   ```bash
   cp env.example .env.local
   # Update .env.local with your actual API keys
   ```

5. **Start development server:**
   ```bash
   # Option 1: Regular start
   npm run dev
   
   # Option 2: Clean start (kills ports 3000-3010 and starts fresh)
   npm run dev:clean
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration (for future phases)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# NextAuth Configuration (for future phases)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🎯 Next Steps (Phase 2)

### Priority Tasks:
- **TASK-016 → TASK-023**: Authentication system with Supabase Auth
- **TASK-031 → TASK-037**: User dashboard with glass components
- **TASK-038 → TASK-044**: Project management interface

## 🎨 Design Philosophy

- **Minimalist & Clean**: Apple-like design principles
- **Glass Morphism**: Modern UI with glassmorphism effects
- **Mobile Responsive**: Mobile-first approach
- **Better UX**: Prioritizing user experience over flashy features
- **Accessibility**: WCAG compliant components

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:clean    # Clean start (kills ports 3000-3010 & starts fresh)
npm run debug        # Run comprehensive diagnostic tool
npm run kill-ports   # Kill all processes on ports 3000-3010
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚨 Troubleshooting

### Quick Diagnostic
```bash
npm run debug  # Checks ports, processes, environment, and build files
```

### Common Issues

**Port conflicts or webpack errors:**
```bash
npm run kill-ports && npm run dev:clean
```

**Build/cache issues:**
```bash
rm -rf .next && npm run dev:clean
```

**Emergency recovery:**
```bash
pkill -f "next" && rm -rf .next && npm run dev:clean
```

**For detailed troubleshooting:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📱 Features

### Current Features:
- ✅ Stunning glass morphism landing page
- ✅ Responsive design system
- ✅ TypeScript support
- ✅ Tailwind CSS with custom tokens
- ✅ Framer Motion animations
- ✅ Supabase integration ready

### Planned Features:
- 🔄 User authentication & profiles
- 🔄 AI-powered MVP generation
- 🔄 Real-time collaboration
- 🔄 One-click deployment
- 🔄 Project templates
- 🔄 Code export functionality

## 🤝 Contributing

This project follows the task-driven development approach outlined in `TASKS.md`. Please refer to the task list for current priorities and development guidelines.

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by the Voltaic team**
