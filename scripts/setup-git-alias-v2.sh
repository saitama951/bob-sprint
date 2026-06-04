#!/bin/bash

# Setup Git Alias for Bob Sprint Automation (Version 2 - With Output)
# This creates a 'git bob-push' command that triggers automation

echo "🤖 Setting up Bob Sprint Automation Git Alias (v2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BOB_DIR="$HOME/Desktop/bob-sprint-automation"

# Check if Bob directory exists
if [ ! -d "$BOB_DIR" ]; then
    echo "❌ Bob directory not found at $BOB_DIR"
    exit 1
fi

echo "Creating git alias 'bob-push' (with visible output)..."

# Create the alias - this version shows output and doesn't hide errors
git config --global alias.bob-push '!f() { 
    # First, do the normal push
    git push "$@" || return 1
    
    # Then trigger Bob
    echo ""
    echo "🤖 Bob Sprint Automation"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get the last commit
    SHA=$(git rev-parse HEAD)
    MSG=$(git log -1 --pretty=%B)
    
    # Check if it has the required parameters
    if echo "$MSG" | grep -qi "issue:" && echo "$MSG" | grep -qi "status:"; then
        echo "  ✓ Found automation parameters in commit ${SHA:0:7}"
        
        # Get commit details
        DATE=$(git log -1 --pretty=%ci)
        FILES=$(git diff-tree --no-commit-id --name-status -r $SHA)
        DIFF=$(git show --pretty="" --unified=3 $SHA | head -n 100)
        
        # Run Bob (NOT in background so we see output)
        cd '"$BOB_DIR"' && node scripts/process-commit.js \
            --sha "$SHA" \
            --message "$MSG" \
            --date "$DATE" \
            --files "$FILES" \
            --diff "$DIFF"
        
        if [ $? -eq 0 ]; then
            echo "✓ Automation completed successfully"
        else
            echo "❌ Automation failed - check output above"
        fi
    else
        echo "  ⏭️  No automation parameters found (need issue: and status:)"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}; f'

if [ $? -eq 0 ]; then
    echo "✅ Git alias created successfully!"
    echo ""
    echo "Usage:"
    echo "  git bob-push              # Push and trigger Bob"
    echo "  git bob-push origin main  # Push specific branch"
    echo ""
    echo "The alias will now show full output so you can see what's happening!"
    echo ""
else
    echo "❌ Failed to create alias"
    exit 1
fi

# Made with Bob
