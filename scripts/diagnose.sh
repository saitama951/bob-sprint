#!/bin/bash

# Diagnostic Script for Bob Sprint Automation
# Run this to check if everything is set up correctly

echo "🔍 Bob Sprint Automation - Diagnostic Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository!"
    echo "   Please run this from your project root directory."
    exit 1
fi

echo "✓ Git repository detected"
echo ""

# Check for post-push hook
echo "Checking for post-push hook..."
if [ -f .git/hooks/post-push ]; then
    echo "✓ post-push hook exists"
    
    # Check if executable
    if [ -x .git/hooks/post-push ]; then
        echo "✓ post-push hook is executable"
    else
        echo "❌ post-push hook is NOT executable"
        echo "   Fix: chmod +x .git/hooks/post-push"
    fi
    
    # Show first few lines
    echo ""
    echo "Hook content (first 10 lines):"
    head -n 10 .git/hooks/post-push
else
    echo "❌ post-push hook NOT found"
    echo "   Install it with: node ~/Desktop/bob-sprint-automation/scripts/install-hook.js"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Bob automation directory
echo "Checking Bob automation directory..."
BOB_DIR="$HOME/Desktop/bob-sprint-automation"

if [ -d "$BOB_DIR" ]; then
    echo "✓ Bob directory exists: $BOB_DIR"
    
    # Check for required files
    if [ -f "$BOB_DIR/scripts/process-commit.js" ]; then
        echo "✓ process-commit.js exists"
    else
        echo "❌ process-commit.js NOT found"
    fi
    
    if [ -f "$BOB_DIR/.env" ]; then
        echo "✓ .env file exists"
        
        # Check if GITHUB_TOKEN is set (without showing the value)
        if grep -q "GITHUB_TOKEN=" "$BOB_DIR/.env"; then
            echo "✓ GITHUB_TOKEN is set in .env"
        else
            echo "❌ GITHUB_TOKEN not found in .env"
        fi
    else
        echo "❌ .env file NOT found"
        echo "   Create it: cp $BOB_DIR/.env.example $BOB_DIR/.env"
    fi
    
    if [ -f "$BOB_DIR/config.yml" ]; then
        echo "✓ config.yml exists"
    else
        echo "❌ config.yml NOT found"
    fi
else
    echo "❌ Bob directory NOT found at $BOB_DIR"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js NOT installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check last commit
echo "Checking last commit..."
LAST_COMMIT=$(git log -1 --pretty=%B)
echo "Last commit message:"
echo "$LAST_COMMIT"
echo ""

if echo "$LAST_COMMIT" | grep -qi "issue:"; then
    echo "✓ Found 'issue:' parameter"
else
    echo "⚠️  No 'issue:' parameter in last commit"
fi

if echo "$LAST_COMMIT" | grep -qi "status:"; then
    echo "✓ Found 'status:' parameter"
else
    echo "⚠️  No 'status:' parameter in last commit"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test hook manually
echo "Testing hook manually..."
echo "Run this command to test the hook:"
echo ""
echo "  bash .git/hooks/post-push <<< \"refs/heads/main $(git rev-parse HEAD) refs/heads/main 0000000000000000000000000000000000000000\""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Diagnostic complete!"
echo ""
echo "Common issues:"
echo "1. Hook not executable: chmod +x .git/hooks/post-push"
echo "2. Missing .env file: cp ~/Desktop/bob-sprint-automation/.env.example ~/Desktop/bob-sprint-automation/.env"
echo "3. No GITHUB_TOKEN in .env"
echo "4. Commit message missing 'issue:' or 'status:' parameters"
echo "5. Node.js not installed"
echo ""

# Made with Bob
