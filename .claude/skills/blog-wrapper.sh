#!/bin/bash

# Blog Management Wrapper
# This script provides a simple interface to the blog management skill

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_SCRIPT="${SCRIPT_DIR}/blog.sh"

# Check if blog.sh exists
if [[ ! -f "$BLOG_SCRIPT" ]]; then
    echo "Error: blog.sh not found in ${SCRIPT_DIR}"
    exit 1
fi

# Execute the blog script with all arguments
bash "$BLOG_SCRIPT" "$@"