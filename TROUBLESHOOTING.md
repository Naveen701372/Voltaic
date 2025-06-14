# 🔧 Voltaic Troubleshooting Guide

This guide helps you quickly identify and resolve common development issues with the Voltaic platform.

## 🚀 Quick Diagnostic

**First, run our diagnostic tool:**
```bash
npm run debug
```

This will automatically check for common issues and suggest solutions.

## 🐛 Common Issues & Solutions

### 1. **Webpack Module Loading Errors**

**Symptoms:**
- `TypeError: __webpack_modules__[moduleId] is not a function`
- Different module counts on different ports (e.g., 759 vs 741 modules)
- 500 Internal Server Error on specific ports

**Causes:**
- Zombie Next.js processes with corrupted state
- Duplicate environment variables
- Corrupted webpack cache

**Solutions:**
```bash
# Quick fix
npm run kill-ports && npm run dev:clean

# Nuclear option
rm -rf .next && npm run kill-ports && npm run dev:clean
```

### 2. **Port Conflicts**

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use`
- Next.js automatically switches to different ports
- Inconsistent behavior between ports

**Diagnostic:**
```bash
# Check what's using port 3000
lsof -i :3000

# Check for zombie Next.js processes
ps aux | grep next
```

**Solutions:**
```bash
# Kill all processes on development ports
npm run kill-ports

# Or kill specific port
lsof -ti:3000 | xargs -r kill -9
```

### 3. **Environment Variable Issues**

**Symptoms:**
- Unexpected module loading behavior
- Inconsistent webpack compilation

**Diagnostic:**
```bash
# Check for duplicates in .env.local
grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | sort | uniq -d
```

**Solutions:**
- Remove duplicate environment variables
- Ensure proper formatting in `.env.local`

### 4. **Missing Build Files**

**Symptoms:**
- `ENOENT: no such file or directory, open '.next/server/app/page.js'`
- 404 errors after successful compilation

**Solutions:**
```bash
# Clean rebuild
rm -rf .next
npm run dev:clean
```

## 🛠️ Diagnostic Commands

### Port Analysis
```bash
# Check specific port
lsof -i :3000

# Check range of ports
for port in {3000..3010}; do echo "Port $port:"; lsof -i :$port; done

# Kill all development ports
for port in {3000..3010}; do lsof -ti:$port | xargs -r kill -9; done 2>/dev/null
```

### Process Analysis
```bash
# Find Next.js processes
ps aux | grep -E "(next dev|next-server)"

# Detailed process tree
ps -ef | grep next

# Kill specific process
kill -9 <PID>
```

### Environment Analysis
```bash
# Check for duplicate env vars
grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | sort | uniq -d

# Show environment loading
env | grep -E "(NEXT_|NODE_)"
```

### Cache Analysis
```bash
# Check .next directory
ls -la .next/server/app/

# Check cache size
du -sh .next

# Clean cache
rm -rf .next node_modules/.cache
```

## 🔍 Debugging Workflow

1. **Run Quick Diagnostic**
   ```bash
   npm run debug
   ```

2. **Identify the Issue Type**
   - Port conflicts → Use `npm run kill-ports`
   - Webpack errors → Check for zombie processes
   - Build errors → Clean cache and rebuild

3. **Apply Targeted Solution**
   ```bash
   # For port conflicts
   npm run kill-ports

   # For build issues
   rm -rf .next && npm run dev:clean

   # For environment issues
   # Edit .env.local to remove duplicates
   ```

4. **Verify Resolution**
   ```bash
   npm run debug  # Should show all green
   npm run dev:clean
   ```

## 🚨 Emergency Recovery

If nothing else works, use the nuclear option:

```bash
# Kill everything and start fresh
pkill -f "next"
for port in {3000..3010}; do lsof -ti:$port | xargs -r kill -9; done 2>/dev/null
rm -rf .next node_modules/.cache
npm install
npm run dev:clean
```

## 📊 Understanding Module Counts

**Normal module counts:**
- **741 modules**: Clean, working state
- **759 modules**: Usually indicates corrupted cache/zombie process
- **731 modules**: Not-found page compilation
- **342 modules**: Client-side compilation

**Module count differences are the key diagnostic for webpack issues!**

## 🔧 Available Scripts

```bash
npm run dev          # Standard development server
npm run dev:clean    # Clean start with port cleanup
npm run debug        # Comprehensive diagnostic
npm run kill-ports   # Kill all processes on ports 3000-3010
npm run build        # Production build
```

## 💡 Prevention Tips

1. **Always use `npm run dev:clean`** instead of `npm run dev`
2. **Run `npm run debug`** if you encounter any issues
3. **Kill ports properly** before switching between projects
4. **Keep environment files clean** - no duplicates
5. **Monitor process health** - don't leave zombie processes

## 🆘 Getting Help

If this guide doesn't solve your issue:

1. Run `npm run debug` and share the output
2. Check `lsof -i :3000` for port conflicts
3. Share any specific error messages
4. Note which port works vs which doesn't

---

*This guide is based on resolving the infamous "759 vs 741 module webpack error" that plagued the Voltaic development environment.* 🎉 