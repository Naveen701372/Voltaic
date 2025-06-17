# ⚡ Voltaic AI App Generator

> **Hackathon Submission**: Transform ideas into reality with AI-powered MVP generation

Voltaic is an intelligent AI-powered platform that transforms user ideas into fully functional web applications using a sophisticated multi-agent workflow system. Built for rapid prototyping and MVP development.

## 🚀 Key Features

### 🤖 Multi-Agent AI Workflow
- **Enthusiasm Agent**: Analyzes and enhances user ideas
- **Title Generator**: Creates compelling app names
- **Feature Analyzer**: Breaks down requirements
- **Code Generator**: Produces production-ready React/Next.js code
- **Error Recovery**: Ensures code quality and fixes issues
- **Preview Generator**: Creates live, interactive previews

### 🔐 Authentication & Security
- Google OAuth integration via Supabase
- Protected routes with middleware
- Row-level security (RLS) for data isolation
- User session management

### 📊 Project Management
- Dashboard with real-time statistics
- Project grid with glass morphism UI
- Individual project tracking per user
- Status monitoring (generating → ready → deployed)

### 🎨 Modern UI/UX
- Apple-inspired design language
- Glass morphism effects throughout
- Light/Dark theme support
- Mobile-responsive layout
- Real-time workflow visualization

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Deployment**: Vercel-ready

## 🏗 Architecture

### Database Schema
```sql
-- Core tables
public.projects        -- User projects with metadata
public.project_files   -- Generated code files
public.user_stats      -- Dashboard statistics

-- Automatic triggers for stats updates
-- RLS policies for data security
```

### Multi-Agent System
1. **User Input** → **Enthusiasm Agent** (idea enhancement)
2. **Title Generator** (app naming)
3. **Feature Analyzer** (requirement breakdown)  
4. **Code Generator** (React/Next.js components)
5. **Error Recovery** (code validation & fixes)
6. **Preview Generator** (live app deployment)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Anthropic API key (optional)

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd voltaic

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Force build previews
VOLTAIC_FORCE_BUILD_PREVIEW=false
```

### Database Setup
```bash
# Run migrations in Supabase SQL Editor
# Copy and execute: supabase/migrations/001_initial_schema.sql
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

## 📱 Usage Flow

### 1. Authentication
- Navigate to the homepage
- Click "Get Started" or "Sign In"
- Authenticate with Google OAuth
- Redirected to dashboard

### 2. Create Project
- Dashboard → "Create New MVP"
- Enter your app idea (e.g., "A task management app with team collaboration")
- Watch the multi-agent workflow in real-time
- Get a fully functional preview

### 3. Manage Projects  
- Dashboard → "My Projects"
- View all generated applications
- Open live previews
- Track project status

## 🎯 Hackathon Highlights

### Innovation
- **Real-time AI Workflow Visualization**: Watch agents work step-by-step
- **Intelligent Code Generation**: Context-aware React component creation
- **Automatic Error Recovery**: Self-healing code generation
- **Live Preview Generation**: Instant app deployment

### User Experience
- **Glass Morphism Design**: Modern, Apple-inspired interface
- **Seamless Authentication**: One-click Google sign-in
- **Responsive Design**: Perfect on all devices
- **Real-time Feedback**: Live progress indicators

### Technical Excellence
- **Multi-Agent Architecture**: Specialized AI agents for different tasks
- **Database Integration**: Full CRUD with Supabase
- **Security First**: RLS policies and protected routes
- **Scalable Architecture**: Production-ready codebase

## 🔮 Generated Apps Include

- **Landing Pages**: Hero sections, feature showcases, CTAs
- **Dashboards**: Data visualization, user management
- **E-commerce**: Product catalogs, shopping carts
- **SaaS Tools**: User authentication, subscription management
- **Portfolio Sites**: Project showcases, contact forms

## 🏆 Competitive Advantages

1. **Speed**: From idea to deployed app in under 2 minutes
2. **Quality**: Production-ready React/Next.js code
3. **Intelligence**: Context-aware AI agents that understand requirements
4. **Scalability**: Multi-user platform with proper data isolation
5. **User Experience**: Intuitive workflow with real-time feedback

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interfaces
- **Glass Morphism**: Modern visual effects with depth
- **Apple-Inspired**: Familiar and intuitive interactions
- **Mobile-First**: Responsive design for all devices
- **Dark Theme**: Reduced eye strain, modern aesthetic

## 🔧 API Endpoints

```typescript
// Authentication
GET  /auth/callback          // OAuth callback
POST /auth/signin           // Sign in page

// Projects
GET  /api/projects          // List user projects  
POST /api/projects          // Create new project

// AI Generation
POST /api/write-files       // Save generated files
POST /api/preview/build     // Build live preview
GET  /api/preview/:id       // View project preview
```

## 📊 Database Schema

```sql
projects (
  id, user_id, name, description,
  project_type, status, preview_url,
  workflow_id, ai_generations, created_at
)

project_files (
  id, project_id, file_path, file_content,
  file_type, description, created_at
)

user_stats (
  id, user_id, projects_created,
  mvps_deployed, ai_generations, created_at
)
```

## 🚀 Production Deployment

### Build Configuration
```bash
# Clean build (excludes generated-apps folder)
npm run build

# Memory optimization for large projects
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### Git Configuration
The project is configured to exclude:
- `generated-apps/` folder (local development only)
- Most `.md` files except `README.md` and `PRD.md`
- Build artifacts and dependencies

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🎯 Performance Optimizations

- **Webpack Configuration**: Optimized chunk splitting for faster loads
- **Build Exclusions**: Generated apps folder excluded from production build
- **Memory Management**: Proper garbage collection for large codebases
- **File Watching**: Intelligent file watching excludes temporary files

## 🎮 Demo

Visit the live demo: `https://your-app.vercel.app`

1. Sign in with Google
2. Try: "Create a recipe sharing app with ratings"
3. Watch the AI workflow generate your app
4. Get a live, shareable preview URL

---

**Built with ❤️ for the hackathon community**
  workflow_id, created_at, updated_at
)

project_files (
  id, project_id, file_path, file_content,
  file_type, description, created_at
)

user_stats (
  id, user_id, projects_created,
  mvps_deployed, ai_generations
)
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Configure environment variables in Vercel dashboard
```

## 🤝 Contributing

This is a hackathon submission, but we welcome feedback and contributions:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎉 Acknowledgments

- Built for [Hackathon Name]
- Powered by OpenAI, Anthropic, and Supabase
- Inspired by the future of AI-assisted development

---

**Built with ❤️ by [Your Team]** | **"It all starts with an idea."**
