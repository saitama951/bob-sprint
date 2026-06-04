#!/bin/bash

# Setup Git Alias for Bob Sprint Automation
# This creates a 'git bob-push' command that triggers automation

echo "🤖 Setting up Bob Sprint Automation Git Alias"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BOB_DIR="$HOME/Desktop/bob-sprint-automation"

# Check if Bob directory exists
if [ ! -d "$BOB_DIR" ]; then
    echo "❌ Bob directory not found at $BOB_DIR"
    exit 1
fi

echo "Creating git alias 'bob-push'..."

# Create the alias
git config --global alias.bob-push '!f() { 
    git push "$@" && 
    echo "" && 
    echo "🤖 Bob Sprint Automation" && 
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && 
    COMMITS=$(git log @{u}..HEAD --pretty=format:"%H") && 
    for SHA in $COMMITS; do 
        MSG=$(git log -1 --pretty=%B $SHA) && 
        if echo "$MSG" | grep -qi "issue:" && echo "$MSG" | grep -qi "status:"; then 
            echo "  ✓ Processing commit ${SHA:0:7}" && 
            DATE=$(git log -1 --pretty=%ci $SHA) && 
            FILES=$(git diff-tree --no-commit-id --name-status -r $SHA) && 
            DIFF=$(git show --pretty="" --unified=3 $SHA | head -n 100) && 
            (cd '"$BOB_DIR"' && node scripts/process-commit.js --sha "$SHA" --message "$MSG" --date "$DATE" --files "$FILES" --diff "$DIFF" 2>&1) &
        fi
    done && 
    echo "✓ Automation triggered" && 
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && 
    echo ""
}; f'

if [ $? -eq 0 ]; then
    echo "✅ Git alias created successfully!"
    echo ""
    echo "Usage:"
    echo "  Instead of:  git push"
    echo "  Use:         git bob-push"
    echo ""
    echo "Or with options:"
    echo "  git bob-push origin main"
    echo "  git bob-push -u origin feature-branch"
    echo ""
    echo "The alias will:"
    echo "  1. Push your commits normally"
    echo "  2. Automatically trigger Bob for commits with issue: and status:"
    echo ""
else
    echo "❌ Failed to create alias"
    exit 1
fi

# Made with Bob
