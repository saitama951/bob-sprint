# 🚀 Setup Guide - Bob Sprint Automation

Complete step-by-step guide to get Bob Sprint Automation working with post-push hook.

## Prerequisites

- ✅ Node.js 16+ installed
- ✅ Git repository with GitHub
- ✅ GitHub account with repository access

## Step 1: Install Dependencies

```bash
cd ~/Desktop/bob-sprint-automation
npm install
```

Expected output:
```
added 50 packages in 5s
```

## Step 2: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `Bob Sprint Automation`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `project` (Full control of projects)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

## Step 3: Configure Environment

Create `.env` file:

```bash
cd ~/Desktop/bob-sprint-automation
cp .env.example .env
nano .env  # or use your preferred editor
```

Add your token:
```bash
GITHUB_TOKEN=ghp_your_actual_token_here
TZ=Asia/Calcutta
```

Save and exit (Ctrl+X, Y, Enter in nano).

## Step 4: Update Configuration

Edit `config.yml`:

```bash
nano config.yml
```

Update these values:
```yaml
github:
  owner: "your-github-username"    # Your GitHub username
  repo: "your-repo-name"           # Your repository name
  project_number: 1                # Your project number (see below)
```

### Finding Your Project Number

1. Go to your GitHub repository
2. Click on **"Projects"** tab
3. Open your project
4. Look at the URL: `https://github.com/users/USERNAME/projects/NUMBER`
5. The number at the end is your project number

## Step 5: Test the Parser

Verify the parser works:

```bash
npm test
```

Expected output:
```
🧪 Testing Commit Message Parser
...
📊 Test Results: 7 passed, 0 failed
```

## Step 6: Install Git Hook

Navigate to your project repository:

```bash
cd /path/to/your/project
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

Expected output:
```
🤖 Bob Sprint Automation - Hook Installer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Git repository found: /path/to/your/project

✅ post-push hook installed in: /path/to/your/project
   Hook location: /path/to/your/project/.git/hooks/post-push

✨ Installation complete!
```

## Step 7: Test with a Commit and Push

Create a test commit and push:

```bash
# Make a small change
echo "# Test" >> README.md

# Commit with the special format
git add README.md
git commit -m "Test Bob automation
issue: 1
status: in-progress"

# Push to trigger Bob
git push
```

Expected output after push:
```
🤖 Bob Sprint Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Processing pushed commits to branch: main
  ✓ Found automation parameters in commit abc1234
✓ Automation triggered for pushed commits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 8: Verify on GitHub

1. Go to your GitHub repository
2. Navigate to issue #1
3. You should see a new comment from Bob with:
   - Commit description
   - Commit SHA and link
   - Your GitHub username (not git author name)
   - AI-powered explanation of what the patch does
   - Files changed with detailed analysis
   - Impact assessment
   - Raw diff in collapsible section

## Troubleshooting

### "GITHUB_TOKEN not found"

**Problem:** `.env` file not found or token not set

**Solution:**
```bash
cd ~/Desktop/bob-sprint-automation
cat .env  # Verify file exists and has token
```

### "Failed to fetch issue"

**Problem:** Issue doesn't exist or token lacks permissions

**Solution:**
1. Verify issue exists: `https://github.com/owner/repo/issues/NUMBER`
2. Check token scopes at https://github.com/settings/tokens
3. Ensure token has `repo` scope

### Hook not running after push

**Problem:** Hook file not executable or not installed

**Solution:**
```bash
cd /path/to/your/project
chmod +x .git/hooks/post-push
ls -la .git/hooks/post-push  # Should show -rwxr-xr-x
```

### "Repository not found"

**Problem:** Wrong owner/repo in config.yml

**Solution:**
```bash
cd ~/Desktop/bob-sprint-automation
nano config.yml
# Update owner and repo to match your GitHub repository
```

### Check logs

View automation logs:
```bash
cat ~/Desktop/bob-sprint-automation/logs/automation.log
```

## Verification Checklist

- [ ] Dependencies installed (`npm install` successful)
- [ ] GitHub token created with correct scopes
- [ ] `.env` file created with token
- [ ] `config.yml` updated with your repository details
- [ ] Parser tests pass (`npm test`)
- [ ] Git hook installed in your repository
- [ ] Test commit created
- [ ] Comment appears on GitHub issue

## Next Steps

Once everything is working:

1. **Use it daily**: Make commits with `issue:` and `status:` parameters
2. **Customize**: Edit `config.yml` to adjust behavior
3. **Install in other repos**: Run the installer in each repository
4. **Monitor**: Check logs if something doesn't work

## Example Workflow

```bash
# Start working on issue #42
git checkout -b feature/new-auth

# Make changes
vim src/auth.js

# Commit with status
git add src/auth.js
git commit -m "Implement JWT authentication
issue: 42
status: in-progress"

# Push to trigger Bob
git push origin feature/new-auth

# Bob automatically (after push):
# - Fetches commit from GitHub
# - Analyzes code changes with AI
# - Posts detailed comment to issue #42
# - Adds "in-progress" label
# - Uses your GitHub username

# Complete the work
git add .
git commit -m "Complete authentication with tests
issue: 42
status: done"

# Push to trigger Bob
git push

# Bob automatically (after push):
# - Posts completion comment with AI explanation
# - Adds "done" label
# - Closes issue #42
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs: `~/Desktop/bob-sprint-automation/logs/automation.log`
3. Test parser: `npm test`
4. Verify GitHub token permissions

---

**Happy automating! 🎉**