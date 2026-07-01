#!/bin/bash

# Blog Management Command
# Usage: ./blog [command] [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_SCRIPT="${SCRIPT_DIR}/.claude/skills/blog.sh"

# Check if blog.sh exists
if [[ ! -f "$BLOG_SCRIPT" ]]; then
    echo "Error: blog.sh not found"
    exit 1
fi

# Execute the blog script with all arguments
bash "$BLOG_SCRIPT" "$@"