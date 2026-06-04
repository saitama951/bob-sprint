# 🔧 Git Alias Solution - The Real Fix

## The Problem

Git's `post-push` hook **doesn't exist** as a built-in hook! Git only supports these hooks:
- pre-commit, post-commit
- pre-push (but NOT post-push)
- pre-receive, post-receive (server-side only)

That's why the hook doesn't trigger automatically when you push.

## The Solution: Git Alias

Instead of relying on a non-existent hook, we use a **Git alias** that wraps the push command.

### Setup (One-Time)

Run this command once:

```bash
bash ~/Desktop/bob-sprint-automation/scripts/setup-git-alias.sh
```

This creates a global Git alias called `bob-push`.

### Usage

Instead of:
```bash
git push
```

Use:
```bash
git bob-push
```

That's it! The alias will:
1. ✅ Push your commits normally
2. ✅ Automatically trigger Bob for commits with `issue:` and `status:`
3. ✅ Show you the automation status

### Examples

```bash
# Simple push
git bob-push

# Push to specific remote/branch
git bob-push origin main

# Push and set upstream
git bob-push -u origin feature-branch

# Force push (use carefully!)
git bob-push --force
```

### What Happens

```
$ git bob-push

Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (3/3), 301 bytes | 301.00 KiB/s, done.
Total 3 (delta 0), reused 0 (delta 0)
To github.com:user/repo.git
   abc1234..def5678  main -> main

🤖 Bob Sprint Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Processing commit abc1234
✓ Automation triggered
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Alternative: Manual Trigger

If you prefer to keep using `git push`, you can manually trigger Bob after pushing:

```bash
# Push normally
git push

# Then trigger Bob manually
bash ~/Desktop/bob-sprint-automation/scripts/trigger-bob.sh
```

(We can create this script if you prefer this approach)

## Why This Works

The alias:
1. Runs `git push` with all your arguments
2. After successful push, checks recent commits
3. For each commit with `issue:` and `status:`, triggers Bob
4. Runs in background so you can continue working

## Advantages

✅ **Works reliably** - No dependency on non-existent hooks
✅ **Simple to use** - Just replace `push` with `bob-push`
✅ **Flexible** - Works with all push options
✅ **Transparent** - Shows you what's happening
✅ **Non-intrusive** - Runs in background

## Make It Your Default (Optional)

If you want to always use Bob, create a shell alias:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias gp='git bob-push'
```

Then just use:
```bash
gp  # Instead of git push
```

## Troubleshooting

### Alias not found

Check if it's installed:
```bash
git config --global --get alias.bob-push
```

If empty, run the setup script again.

### Still want to use regular push

You can always use regular `git push` - it won't trigger Bob, but it works normally.

### Remove the alias

```bash
git config --global --unset alias.bob-push
```

## Summary

**The Fix:**
- ❌ `post-push` hook doesn't exist in Git
- ✅ Use `git bob-push` alias instead
- ✅ Works exactly like `git push` but triggers Bob

**Setup:**
```bash
bash ~/Desktop/bob-sprint-automation/scripts/setup-git-alias.sh
```

**Usage:**
```bash
git bob-push  # Instead of git push
```

That's it! 🎉