# ⚡ Voltaic Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Transform startup ideas into working MVPs through AI-powered code generation with stunning Apple Glass design.

Built for **THC Hackathon - HackTheVibe 2025** | **Category:** SaaS

---

## 🎯 Overview

Voltaic is a revolutionary no-code platform that electrically transforms ideas into reality. Non-technical founders describe their startup vision and receive wireframe previews, then complete working MVPs with interactive component-level editing:

- ✨ Beautiful landing page with Apple Glass design
- 🔐 Complete authentication system
- 💾 Database integration and management
- 📱 Mobile-responsive design
- ⚡ Real-time preview and testing

## 🎨 Design Philosophy

Following Apple's latest WWDC Glass Design System:
- **Glass Morphism:** Translucent elements with backdrop blur
- **Depth Layering:** Multiple glass surfaces for visual hierarchy
- **Smooth Animations:** Framer Motion for fluid interactions
- **Accessibility First:** WCAG 2.1 AA compliant
- **Mobile-First:** Progressive enhancement for all devices

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS + Custom Glass Components
- **Animations:** Framer Motion
- **State Management:** Zustand
- **UI Components:** Custom Glass Design System

### Backend & Services
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (Google, Email, Magic Link)
- **AI Integration:** Multi-agent AI system
  - Claude Sonnet 4 (Primary code generation)
  - OpenAI GPT-4 (Idea enhancement)
- **Agent Framework:** Custom orchestration system
- **File Storage:** Supabase Storage
- **Real-time Updates:** Supabase Realtime + WebSockets

### Infrastructure
- **Hosting:** Vercel
- **CDN:** Vercel Edge Network
- **Analytics:** Vercel Analytics
- **Monitoring:** Sentry
- **CI/CD:** GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Naveen701372/Voltaic.git
   cd Voltaic
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # App
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:setup
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Voltaic/
├── 📄 PRD.md                    # Product Requirements Document
├── 📄 README.md                 # This file
├── 📄 TASKS.md                  # Development task list
├── 📁 app/                      # Next.js App Router
│   ├── 📁 (auth)/              # Authentication routes
│   ├── 📁 dashboard/            # User dashboard
│   ├── 📁 api/                  # API routes
│   └── 📄 layout.tsx            # Root layout
├── 📁 components/               # React components
│   ├── 📁 glass/               # Glass design system
│   ├── 📁 ui/                  # Base UI components
│   └── 📁 forms/               # Form components
├── 📁 lib/                     # Utilities and configurations
│   ├── 📄 supabase.ts          # Supabase client
│   ├── 📄 ai-agents.ts         # AI agent framework
│   └── 📄 utils.ts             # Utility functions
├── 📁 styles/                  # Global styles
├── 📁 types/                   # TypeScript type definitions
├── 📁 hooks/                   # Custom React hooks
└── 📁 public/                  # Static assets
```

## 🎨 Glass Design System

Our custom glass components follow Apple's design principles:

### Core Components
- `<GlassCard />` - Primary glass surface
- `<GlassButton />` - Interactive glass elements
- `<GlassInput />` - Form inputs with glass styling
- `<GlassModal />` - Overlay glass containers
- `<GlassNavigation />` - Navigation elements

### Usage Example
```tsx
import { GlassCard, GlassButton } from '@/components/glass'

function MyComponent() {
  return (
    <GlassCard className="p-6">
      <h2>Beautiful Glass Design</h2>
      <GlassButton variant="primary">
        Get Started
      </GlassButton>
    </GlassCard>
  )
}
```

### Design Tokens
- **Glass Opacity:** 70% primary, 50% secondary, 30% accent
- **Blur Strength:** 20px backdrop filter
- **Border Radius:** 16px for cards, 8px for buttons
- **Spacing:** 8px base unit system

## 🔧 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Convention
Following [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testing
npm run test

# Build check
npm run build
```

## 📱 Responsive Design

### Breakpoints
- **Mobile:** 320px - 768px (Mobile-first approach)
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

### Glass Component Responsiveness
All glass components are built with mobile-first responsive design:
- Touch-optimized interactions
- Adaptive sizing and spacing
- Optimized glass effects for mobile performance
- Progressive enhancement for larger screens

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── 📁 __tests__/              # Unit tests
├── 📁 e2e/                    # End-to-end tests
└── 📁 integration/            # Integration tests
```

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. **Connect Repository**
   - Import project in Vercel dashboard
   - Configure environment variables

2. **Automatic Deployments**
   - Push to `main` branch triggers production deploy
   - Pull requests get preview deployments

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Performance Metrics

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Optimization Features
- Image optimization with Next.js
- Glass effect performance optimization
- Code splitting and lazy loading
- Service worker caching

## 🔒 Security

### Authentication Security
- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- API route protection
- CSRF protection

### Code Generation Security
- Input sanitization
- Output validation
- Secure code templates
- Dependency scanning

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Guidelines
- Follow the established code style
- Write meaningful commit messages
- Add documentation for new features
- Ensure all tests pass
- Update README if needed

## 📋 Roadmap

### Phase 1: MVP (Hackathon) ✅
- [x] Glass design system
- [x] Authentication flow
- [x] Basic AI integration
- [x] MVP generation engine
- [x] Live preview system

### Phase 2: Enhancement (Post-Hackathon)
- [ ] Multiple MVP templates
- [ ] Advanced customization
- [ ] Team collaboration
- [ ] Analytics dashboard
- [ ] Mobile app

### Phase 3: Scale (Future)
- [ ] Enterprise features
- [ ] White-label solutions
- [ ] Template marketplace
- [ ] Developer API

## 🆘 Support

### Documentation
- [PRD.md](./PRD.md) - Complete product requirements
- [API Documentation](./docs/api.md) - API reference
- [Design System](./docs/design-system.md) - Component library

### Getting Help
- **Issues:** [GitHub Issues](https://github.com/Naveen701372/Voltaic/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Naveen701372/Voltaic/discussions)
- **Email:** support@voltaic.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Info

- **Event:** THC Hackathon - HackTheVibe 2025
- **Category:** SaaS
- **Project:** Voltaic Platform
- **Repository:** [https://github.com/Naveen701372/Voltaic](https://github.com/Naveen701372/Voltaic)
- **Timeline:** 3 Weeks
- **Demo Day:** TBD

## 🙏 Acknowledgments

- Apple for Glass Design inspiration
- Supabase for amazing backend services
- OpenAI for AI capabilities
- Vercel for deployment platform
- The open-source community

---

**Built with ❤️ for the future of no-code development**

*Last Updated: January 2025* 