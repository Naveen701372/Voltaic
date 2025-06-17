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

### Environment Detection
The platform automatically detects production environments and adapts its behavior:

- **Development**: Creates live preview apps with file system operations
- **Production**: Uses template-based previews without file system access
- **Vercel/Netlify**: Automatically detected via environment variables

### Build Configuration
```bash
# Clean build (excludes generated-apps folder)
npm run build

# Memory optimization for large projects
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### Production Features
✅ **No File System Operations**: Prevents `ENOENT` errors on read-only platforms  
✅ **Template Previews**: Generated apps displayed via template system  
✅ **Environment Auto-Detection**: Works with Vercel, Netlify, and other platforms  
✅ **Optimized Builds**: Excludes development-only directories and files  

## 🚀 **BREAKTHROUGH: Production Dev Server System**

### **Revolutionary Live React Preview in Production**
Voltaic now features a breakthrough serverless development server system that creates **live React applications directly in production environments**:

✨ **Live React Components**: Real React apps with full interactivity  
⚡ **Quick Preview Mode**: < 10 seconds deployment to live preview  
🌐 **Serverless Architecture**: Runs in Vercel's serverless environment  
📦 **CDN-Based Dependencies**: No npm install required, uses React CDN  
🔧 **Production-Ready**: Automatically detects and adapts to production  

### **How It Works**
1. **User creates app** → AI generates React components
2. **Production environment detected** → Activates dev server system
3. **Components processed** → Converted to standalone React with CDN
4. **Live preview created** → Real React app running in serverless function
5. **Instant access** → Preview URL provides immediate interactive experience

### **Technical Implementation**
```typescript
// Production Dev Server API Endpoints
POST /api/dev-server/start        // Create live dev server
GET  /api/dev-server/preview/:id  // Access live React app
GET  /api/dev-server/manage       // Server management
DELETE /api/dev-server/manage     // Cleanup servers
```

### **Live Preview Architecture**
- **Quick Mode**: React components with CDN libraries (< 10s)
- **Full Mode**: Complete Next.js build with npm install (60s+)
- **Auto-Detection**: Chooses best mode based on environment and complexity
- **Fallback System**: Graceful degradation to template previews if needed

### **Environment Configuration**
```bash
# Force production dev server mode (optional)
VOLTAIC_DEV_SERVER_MODE=quick

# Environment auto-detection works with:
# - Vercel (VERCEL=1)
# - Netlify (NETLIFY=true) 
# - AWS Lambda (AWS_LAMBDA_FUNCTION_NAME)
# - Production (NODE_ENV=production)
```

### **Dev Server vs Template Previews**
| Feature             | Dev Server (NEW)           | Template Preview      |
| ------------------- | -------------------------- | --------------------- |
| **Interactivity**   | ✅ Full React hooks, events | ❌ Static display only |
| **Speed**           | ⚡ < 10 seconds             | 🐌 Template rendering  |
| **Technology**      | 🚀 Live React + CDN         | 📄 HTML templates      |
| **Environment**     | 🌐 Production serverless    | 💻 Any environment     |
| **User Experience** | 🎯 Real app preview         | 👀 Code visualization  |

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

The platform will automatically:
1. Detect the production environment
2. Skip file system operations
3. Use template-based previews
4. Build without generated-apps dependencies

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
