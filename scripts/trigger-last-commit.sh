#!/bin/bash

# Trigger Bob for the last commit
# Run this manually after pushing to see what's happening

BOB_DIR="$HOME/Desktop/bob-sprint-automation"

echo "🤖 Bob Sprint Automation - Manual Trigger"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if in git repo
if [ ! -d .git ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get last commit
SHA=$(git rev-parse HEAD)
MSG=$(git log -1 --pretty=%B)
DATE=$(git log -1 --pretty=%ci)
FILES=$(git diff-tree --no-commit-id --name-status -r $SHA)
DIFF=$(git show --pretty="" --unified=3 $SHA | head -n 100)

echo "Commit: ${SHA:0:7}"
echo "Message:"
echo "$MSG"
echo ""

# Check for parameters
if ! echo "$MSG" | grep -qi "issue:"; then
    echo "❌ No 'issue:' parameter found in commit message"
    exit 1
fi

if ! echo "$MSG" | grep -qi "status:"; then
    echo "❌ No 'status:' parameter found in commit message"
    exit 1
fi

echo "✓ Found issue: and status: parameters"
echo ""
echo "Running Bob processor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the processor (NOT in background, so we see output)
cd "$BOB_DIR"
node scripts/process-commit.js \
    --sha "$SHA" \
    --message "$MSG" \
    --date "$DATE" \
    --files "$FILES" \
    --diff "$DIFF"

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Success!"
else
    echo "❌ Failed with exit code: $EXIT_CODE"
    echo ""
    echo "Common issues:"
    echo "1. Missing .env file with GITHUB_TOKEN"
    echo "2. Wrong repo in config.yml"
    echo "3. Issue doesn't exist"
    echo "4. Token lacks permissions"
fi

echo ""

# Made with Bob
