# Environment Variables Troubleshooting Guide

## Common Issues and Solutions

### Issue: Database still connects to localhost after updating .env

## ✅ Solution Steps:

### 1. **Verify .env File Location**
The `.env` file **must** be in the **project root directory** (same level as `package.json`):

```
attendify-backend/
├── .env              ← Must be here!
├── package.json
├── src/
└── ...
```

### 2. **Check .env File Format**
Your `.env` file should look like this (no spaces around `=`):

```env
# ✅ CORRECT
DB_HOST=your_host_here
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ATTENDIFY

# ❌ WRONG (spaces around =)
DB_HOST = your_host_here
DB_PORT = 3306
```

### 3. **Restart the Server**
**IMPORTANT:** After changing `.env` file, you **MUST restart the server**:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are loaded when the server starts, so changes won't take effect until restart.

### 4. **Check What Values Are Being Used**
After restarting, the server will now log the database configuration being used:

```
📋 Database Configuration:
   Host: your_host_here
   Port: 3306
   User: root
   Database: ATTENDIFY
   Password: ***
```

If you see `localhost` here, it means:
- `.env` file is not being loaded, OR
- `DB_HOST` is not set in `.env`, OR
- `.env` file has syntax errors

### 5. **Verify .env File Syntax**
Common mistakes:

```env
# ❌ WRONG - Quotes not needed
DB_HOST="localhost"
DB_NAME="ATTENDIFY"

# ✅ CORRECT - No quotes
DB_HOST=localhost
DB_NAME=ATTENDIFY

# ❌ WRONG - Spaces around =
DB_HOST = localhost

# ✅ CORRECT - No spaces
DB_HOST=localhost

# ❌ WRONG - Comments on same line (may cause issues)
DB_HOST=localhost # my database

# ✅ CORRECT - Comments on separate lines
# My database host
DB_HOST=localhost
```

### 6. **Example .env File**
Here's a complete example:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ATTENDIFY

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Email Verification Configuration
VERIFICATION_CODE_TTL_MINUTES=15
VERIFICATION_CODE_LENGTH=6
MAX_VERIFICATION_ATTEMPTS=5
```

### 7. **Test if .env is Loading**
After restarting, check the console output:

- ✅ If you see: `✅ .env file loaded successfully` → .env is loading correctly
- ⚠️ If you see: `⚠️ Warning: .env file not found` → .env file is missing or in wrong location

### 8. **Manual Test**
You can also test by temporarily adding this to `src/index.js`:

```javascript
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
```

Then restart and check the output.

## 🔍 Debugging Checklist

- [ ] `.env` file exists in project root (same folder as `package.json`)
- [ ] `.env` file has correct format (no spaces around `=`, no quotes)
- [ ] Server was restarted after changing `.env`
- [ ] Variable names match exactly (case-sensitive): `DB_HOST`, `DB_PORT`, etc.
- [ ] No typos in variable names
- [ ] Check console output for configuration values being used

## 📝 Quick Fix Commands

```bash
# 1. Check if .env exists
ls -la .env        # Linux/Mac
dir .env           # Windows

# 2. View .env contents (be careful with passwords)
cat .env           # Linux/Mac
type .env          # Windows

# 3. Restart server
npm run dev
```

## 🆘 Still Not Working?

If after all these steps it's still using localhost:

1. **Check for multiple .env files** - Make sure you're editing the right one
2. **Check for .env.local or .env.development** - These might override .env
3. **Clear Node.js cache** - Sometimes cached modules cause issues:
   ```bash
   rm -rf node_modules/.cache
   npm run dev
   ```
4. **Verify dotenv is installed**:
   ```bash
   npm list dotenv
   ```






