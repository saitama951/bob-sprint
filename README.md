# 🤖 Bob Sprint Automation

Automatically update your GitHub Projects sprint board when you push commits. Simply include `issue:` and `status:` parameters in your commits, and Bob will handle the rest when you push to GitHub!

## ✨ Features

- 🔄 **Automatic Issue Updates**: Post commit summaries to GitHub issues when you push
- 🤖 **AI-Powered Explanations**: Bob analyzes and explains what your code changes do
- 📊 **Status Tracking**: Update issue status based on commit parameters
- 🏷️ **Smart Labeling**: Automatically add labels (in-progress, done)
- 🔒 **Auto-Close**: Close issues when marked as done
- 📝 **Rich Comments**: Include file changes, AI explanations, and impact assessment
- 👤 **GitHub Attribution**: Uses your actual GitHub username
- ⚡ **Zero Friction**: Works automatically via Git post-push hook

## 🚀 Quick Start

### 1. Installation

```bash
cd ~/Desktop/bob-sprint-automation
npm install
```

### 2. Configuration

Create a `.env` file with your GitHub token:

```bash
cp .env.example .env
# Edit .env and add your GitHub Personal Access Token
```

Update `config.yml` with your repository details:

```yaml
github:
  owner: "your-github-username"
  repo: "your-repo-name"
  project_number: 1
```

### 3. Install Git Hook

Navigate to your project repository and run:

```bash
cd /path/to/your/project
node ~/Desktop/bob-sprint-automation/scripts/install-hook.js
```

This will install the post-push hook in your repository.

### 4. Start Using!

Make commits and push with the special format:

```bash
git commit -m "Implement user authentication
issue: 123
status: in-progress"

git push
```

Bob will automatically (after push):
- Fetch your commit from GitHub
- Analyze the code changes with AI
- Post a detailed comment to issue #123
- Include AI explanation of what the patch does
- Add the "in-progress" label
- Use your GitHub username (not git author name)

## 📝 Commit Message Format

### Required Parameters

Your commit message must include two parameters:

```
Your commit description here

issue: <issue-number>
status: <status-keyword>
```

### Status Keywords

**In Progress** (keeps issue open):
- `in-progress`
- `ongoing`
- `wip`
- `working`
- `progress`

**Done** (closes issue):
- `done`
- `completed`
- `finished`
- `resolved`
- `fixed`
- `complete`

### Examples

#### Work in Progress
```bash
git commit -m "Add JWT token validation middleware
issue: 456
status: in-progress"
git push
```

#### Completed Work
```bash
git commit -m "Complete user authentication system
issue: 456
status: done"
git push
```

#### Multiple Files Changed
```bash
git commit -m "Refactor authentication logic and add tests
issue: 789
status: ongoing"
git push
```

## 🎯 What Bob Does

### For "in-progress" Status:
1. ✅ Posts a comment to the issue with:
   - Commit description
   - Commit SHA and link
   - Author and timestamp
   - Files changed
   - Diff summary
2. ✅ Adds "in-progress" label

### For "done" Status:
1. ✅ Posts a completion comment
2. ✅ Adds "done" label
3. ✅ Closes the issue (if configured)

## 📋 Example Comment

Bob posts comments like this to your issues:

```markdown
🚧 **Commit Update** - In Progress

**Description:** Add JWT token validation middleware

**Commit:** [a1b2c3d](https://github.com/user/repo/commit/a1b2c3d)
**Author:** @username
**Date:** Jun 4, 2026, 8:47 PM

**Files Changed:**
- 📝 `src/middleware/auth.js` (+45/-12)
- ➕ `tests/auth.test.js` (+89/-0)
- 📝 `README.md` (+5/-2)

**Changes Summary:**
```diff
+ function validateToken(token) {
+   // Token validation logic
+ }
```

---
🤖 Automated by Bob Sprint Assistant
```

## ⚙️ Configuration

### config.yml

```yaml
github:
  owner: "your-username"
  repo: "your-repo"
  project_number: 1

automation:
  status_keywords:
    in_progress: ["in-progress", "ongoing", "wip"]
    done: ["done", "completed", "finished"]
  
  comment:
    include_diff: true
    max_diff_lines: 50
    include_files_changed: true
  
  projects:
    done_status: "Done"
    close_issue_on_done: true

logging:
  enabled: true
  level: "info"
  file: "logs/automation.log"
```

### Environment Variables

Create a `.env` file:

```bash
GITHUB_TOKEN=ghp_your_token_here
TZ=Asia/Calcutta
```

**Getting a GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `project`
4. Copy the token to your `.env` file

## 🔧 Advanced Usage

### Manual Processing

Process a specific commit manually:

```bash
node scripts/process-commit.js \
  --sha "abc123" \
  --message "Your commit message" \
  --author "Your Name" \
  --date "2026-06-04"
```

### Testing the Parser

Test commit message parsing:

```bash
node scripts/test-parser.js "Your commit message
issue: 123
status: done"
```

### Uninstalling the Hook

Remove the hook from a repository:

```bash
rm /path/to/your/project/.git/hooks/post-commit
```

## 📊 Workflow Diagram

```
┌─────────────────┐
│  Make Commit    │
│  with issue:    │
│  and status:    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git Hook       │
│  Triggered      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse Commit   │
│  Message        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Issue    │
│  from GitHub    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Post Comment   │
│  with Details   │
└────────┬────────┘
         │
         ▼
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│In Prog │ │  Done  │
│Label   │ │Close   │
└────────┘ └────────┘
```

## 🐛 Troubleshooting

### Hook Not Running

Check if the hook is executable:
```bash
ls -la .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

### GitHub Token Issues

Verify your token has the correct scopes:
- `repo` - Full control of private repositories
- `project` - Full control of projects

### Commit Not Processed

Check the logs:
```bash
cat ~/Desktop/bob-sprint-automation/logs/automation.log
```

Verify commit message format:
```bash
git log -1 --pretty=%B
```

### Issue Not Found

Ensure:
- Issue number is correct
- Issue exists in the configured repository
- Token has access to the repository

## 📚 Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

## 🤝 Contributing

Feel free to customize the scripts to fit your workflow!

## 📄 License

MIT License - Feel free to use and modify as needed.

---

**Made with ❤️ by Bob, your AI coding assistant**