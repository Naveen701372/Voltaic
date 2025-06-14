# 🔧 Voltaic Debugging Cheat Sheet

## 🚨 Emergency Commands

```bash
# First line of defense
npm run debug

# Kill all development ports
npm run kill-ports

# Clean restart
npm run dev:clean

# Nuclear option
pkill -f "next" && rm -rf .next && npm run dev:clean
```

## 🔍 Quick Diagnostics

```bash
# Check what's using port 3000
lsof -i :3000

# Find zombie Next.js processes  
ps aux | grep next

# Check module counts (watch for 759 vs 741!)
# Look for this in terminal output when starting server

# Check for duplicate env vars
grep -E "^[A-Z_]+=" .env.local | cut -d'=' -f1 | sort | uniq -d
```

## 📊 Module Count Reference

- **741 modules** = ✅ Normal, working state
- **759 modules** = ❌ Corrupted cache/zombie process  
- **731 modules** = ⚠️ Not-found page compilation
- **342 modules** = ✅ Client-side compilation

## 🎯 Issue → Solution Mapping

| Issue              | Command                                    |
| ------------------ | ------------------------------------------ |
| Port in use        | `npm run kill-ports`                       |
| Webpack errors     | `npm run kill-ports && npm run dev:clean`  |
| Build errors       | `rm -rf .next && npm run dev:clean`        |
| Zombie processes   | `ps aux \| grep next` then `kill -9 <PID>` |
| Environment issues | Edit `.env.local` to remove duplicates     |

## 🚀 Best Practices

1. **Always use** `npm run dev:clean` instead of `npm run dev`
2. **Run** `npm run debug` when things seem off
3. **Watch module counts** in terminal output
4. **Kill ports cleanly** when switching projects
5. **Keep .env.local clean** - no duplicates

---
*The infamous "759 vs 741 module webpack error" is now history! 🎉* 