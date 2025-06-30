#!/bin/bash

# Quick Git Push Script
# Usage: ./scripts/quick-push.sh "your commit message"
# Or: npm run push "your commit message"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick Push to GitHub${NC}"

# Check if commit message provided
if [ -z "$1" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${BLUE}📝 No commit message provided, using: ${COMMIT_MSG}${NC}"
else
    COMMIT_MSG="$1"
    echo -e "${BLUE}📝 Commit message: ${COMMIT_MSG}${NC}"
fi

# Check if there are any changes
if git diff --quiet && git diff --staged --quiet; then
    echo -e "${RED}❌ No changes to commit${NC}"
    exit 1
fi

# Add all changes
echo -e "${BLUE}📦 Adding all changes...${NC}"
git add .

# Check git status
echo -e "${BLUE}📋 Git status:${NC}"
git status --short

# Commit
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

# Push to main
echo -e "${BLUE}🌐 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}🔗 Repository: $(git config --get remote.origin.url)${NC}"
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    exit 1
fi 