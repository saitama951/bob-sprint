# 🔄 Migration Guide: Post-Commit → Post-Push

## What Changed?

Bob Sprint Automation now uses a **post-push hook** instead of post-commit. This means:

### Before (Post-Commit)
- ❌ Triggered on local commit
- ❌ Ran before code reached GitHub
- ❌ Used git author name

### After (Post-Push) ✅
- ✅ Triggers when you push to remote
- ✅ Only runs after code is on GitHub
- ✅ Uses GitHub username from commit

## Why This Change?

1. **Better Reliability**: Comments only appear after code is actually pushed to GitHub
2. **Accurate Attribution**: Uses actual GitHub username instead of git config name
3. **No Local Noise**: Doesn't run on local commits that might never be pushed
4. **Branch Awareness**: Knows which branch was pushed

## Migration Steps

### 1. Remove Old Hook (if installed)

```bash
cd /path/to/your/project
rm .git/hooks/post-commit
```

### 2. Install New Hook

```bash
cd /path/to/your/project
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

The installer now defaults to `post-push` hook.

### 3. Test It

```bash
# Make a commit
git commit -m "Test new hook
issue: 123
status: in-progress"

# Push to trigger automation
git push
```

You should see:
```
🤖 Bob Sprint Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Processing pushed commits to branch: main
  ✓ Found automation parameters in commit abc1234
✓ Automation triggered for pushed commits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## New Workflow

```bash
# 1. Make changes
vim src/file.js

# 2. Commit with parameters
git commit -m "Implement feature X
issue: 456
status: in-progress"

# 3. Push to trigger Bob
git push

# Bob automatically:
# - Waits for push to complete
# - Fetches commit from GitHub
# - Gets your GitHub username
# - Posts comment with AI explanation
# - Updates issue status
```

## Benefits

### 1. GitHub Username
Comments now show your actual GitHub handle:
```markdown
**Author:** @your-github-username
```

Instead of:
```markdown
**Author:** @Your Name
```

### 2. Only Runs on Push
- No automation on local commits
- Only triggers when code reaches GitHub
- Cleaner workflow

### 3. Multiple Commits
If you push multiple commits at once, Bob processes all of them:
```bash
git commit -m "Fix bug\nissue: 1\nstatus: in-progress"
git commit -m "Add tests\nissue: 1\nstatus: done"
git push  # Bob processes both commits
```

## Troubleshooting

### Hook Not Running After Push

Check if hook is installed:
```bash
ls -la .git/hooks/post-push
```

Should show: `-rwxr-xr-x` (executable)

### Still Using Old Hook?

Remove old hook and reinstall:
```bash
rm .git/hooks/post-commit
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

### Want to Keep Post-Commit?

You can install the old post-commit hook by editing `install-hook.js`:
```javascript
const installer = new HookInstaller('post-commit');
```

But we recommend using post-push for better reliability.

## Comparison

| Feature | Post-Commit | Post-Push |
|---------|-------------|-----------|
| Trigger | Local commit | Remote push |
| Timing | Before push | After push |
| Username | Git author | GitHub username |
| Reliability | Lower | Higher |
| Branch info | Limited | Full |
| Multiple commits | One at a time | Batch processing |

## Recommendation

✅ **Use post-push** for production workflows
- More reliable
- Better attribution
- Cleaner process

⚠️ Use post-commit only if you need immediate local feedback

---

**Questions?** Check the main README.md or SETUP_GUIDE.md