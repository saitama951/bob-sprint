# 🔄 Reset Guide - Start Fresh

If you want to completely reset and start from the beginning, follow these steps:

## Option 1: Quick Reset (Keep Bob, Remove Hooks)

This removes Bob from your projects but keeps the automation system intact.

### Step 1: Remove Hooks from All Projects

For each project where you installed Bob:

```bash
cd /path/to/your/project

# Remove post-push hook
rm .git/hooks/post-push

# Remove post-commit hook (if you had the old version)
rm .git/hooks/post-commit

# Verify removal
ls -la .git/hooks/
```

### Step 2: Clear Logs (Optional)

```bash
cd ~/Desktop/bob-sprint-automation
rm -rf logs/
```

### Step 3: Reinstall Fresh

Now you can reinstall in any project:

```bash
cd /path/to/your/project
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

---

## Option 2: Complete Reset (Remove Everything)

This completely removes Bob Sprint Automation and all traces.

### Step 1: Remove Hooks from All Projects

```bash
# For each project where Bob is installed:
cd /path/to/your/project
rm .git/hooks/post-push
rm .git/hooks/post-commit  # if exists
```

### Step 2: Remove Bob Automation System

```bash
cd ~/Desktop
rm -rf bob-sprint-automation
```

### Step 3: Start Fresh

Follow the setup guide from the beginning:

```bash
# Bob will need to recreate the system
# Or you can restore from backup if you have one
```

---

## Option 3: Reset Configuration Only

Keep everything but reset your configuration.

### Step 1: Reset Environment Variables

```bash
cd ~/Desktop/bob-sprint-automation
rm .env
cp .env.example .env
nano .env  # Add your GitHub token
```

### Step 2: Reset Configuration

```bash
# Backup current config (optional)
cp config.yml config.yml.backup

# Edit config with fresh values
nano config.yml
```

Update:
- `github.owner` - Your GitHub username
- `github.repo` - Your repository name
- `github.project_number` - Your project number

### Step 3: Test Configuration

```bash
npm test
```

---

## Option 4: Reinstall in a Different Project

If you want to use Bob in a different project:

### Step 1: Navigate to New Project

```bash
cd /path/to/new/project
```

### Step 2: Install Hook

```bash
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

### Step 3: Update Config (if needed)

If the new project is in a different repository:

```bash
cd ~/Desktop/bob-sprint-automation
nano config.yml
```

Update the `github.repo` value.

---

## Troubleshooting Reset Issues

### Can't Find Hooks

```bash
# List all hooks in a project
cd /path/to/your/project
ls -la .git/hooks/

# Search for Bob hooks
find .git/hooks/ -name "*post-*"
```

### Permission Denied

```bash
# Add execute permission to remove
chmod +x .git/hooks/post-push
rm .git/hooks/post-push
```

### Bob Still Running

```bash
# Check for background processes
ps aux | grep "bob-sprint"

# Kill if found
kill <process-id>
```

### Clean Slate Checklist

- [ ] Removed hooks from all projects
- [ ] Deleted bob-sprint-automation directory (if complete reset)
- [ ] Cleared any background processes
- [ ] Removed .env file (if resetting config)
- [ ] Ready to reinstall fresh

---

## Quick Commands Reference

### Remove Hook from Current Project
```bash
rm .git/hooks/post-push
```

### Remove Bob Completely
```bash
rm -rf ~/Desktop/bob-sprint-automation
```

### Reinstall Hook
```bash
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

### Check Hook Status
```bash
ls -la .git/hooks/post-push
```

### Test Parser
```bash
cd ~/Desktop/bob-sprint-automation
npm test
```

---

## After Reset

Once you've reset, follow the **SETUP_GUIDE.md** to set up Bob again:

1. Install dependencies: `npm install`
2. Configure `.env` with GitHub token
3. Update `config.yml` with your details
4. Install hook in your project
5. Test with a commit and push

---

## Need Help?

- **Setup Guide:** See `SETUP_GUIDE.md`
- **Migration:** See `MIGRATION_GUIDE.md` if switching from post-commit
- **Examples:** See `EXAMPLE_COMMENT.md` for what Bob posts
- **Main Docs:** See `README.md`

---

**Remember:** Resetting removes all hooks and configuration. Make sure you have your GitHub token saved somewhere before doing a complete reset!