#!/bin/bash

# Test script for blog management skill

set -e

echo "Testing Blog Management Skill"
echo "=============================="
echo ""

# Test 1: List all posts
echo "Test 1: List all posts"
echo "----------------------"
./blog list
echo ""

# Test 2: List posts by language
echo "Test 2: List posts by language (en)"
echo "-----------------------------------"
./blog list --lang=en
echo ""

# Test 3: List posts by category
echo "Test 3: List posts by category (Technology)"
echo "--------------------------------------------"
./blog list --category=Technology
echo ""

# Test 4: List posts by tag
echo "Test 4: List posts by tag (astro)"
echo "---------------------------------"
./blog list --tag=astro
echo ""

# Test 5: Sort by title
echo "Test 5: Sort by title"
echo "---------------------"
./blog list --sort=title
echo ""

echo "All tests completed successfully!"
echo ""
echo "To test interactive commands, run:"
echo "  ./blog new      # Create a new post"
echo "  ./blog edit <slug>  # Edit a post"
echo "  ./blog delete <slug>  # Delete a post"