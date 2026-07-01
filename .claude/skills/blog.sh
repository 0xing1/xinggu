#!/bin/bash

# Blog Management Skill
# Usage: /blog [command] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory for blog content
BLOG_DIR="src/content/blog"

# Function to print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Function to generate slug from title
generate_slug() {
    echo "$1" | \
        tr '[:upper:]' '[:lower:]' | \
        sed 's/[^a-z0-9\s-]//g' | \
        sed 's/\s\+/-/g' | \
        sed 's/-\+/-/g' | \
        sed 's/^-//' | \
        sed 's/-$//'
}

# Function to get current date in YYYY-MM-DD format
get_current_date() {
    date +%Y-%m-%d
}

# Function to create a new blog post
blog_new() {
    echo -e "${BLUE}Creating a new blog post...${NC}"
    echo ""

    # Ask for language
    read -p "What language? (zh/en): " lang
    if [[ "$lang" != "zh" && "$lang" != "en" ]]; then
        print_error "Invalid language. Use 'zh' or 'en'."
        exit 1
    fi

    # Ask for title
    read -p "Title: " title
    if [[ -z "$title" ]]; then
        print_error "Title is required."
        exit 1
    fi

    # Ask for description
    read -p "Description: " description
    if [[ -z "$description" ]]; then
        print_error "Description is required."
        exit 1
    fi

    # Ask for category
    read -p "Category: " category

    # Ask for tags
    read -p "Tags (comma-separated): " tags_input

    # Process tags
    if [[ -n "$tags_input" ]]; then
        # Convert comma-separated to array format
        tags=$(echo "$tags_input" | sed 's/,/, /g' | sed 's/^/[/; s/$/]/; s/, /", "/g; s/\["/["/; s/"\]/"]/; s/^$/[]/')
    else
        tags="[]"
    fi

    # Generate slug and filename
    slug=$(generate_slug "$title")
    filename="${slug}.md"
    filepath="${BLOG_DIR}/${lang}/${filename}"

    # Check if file already exists
    if [[ -f "$filepath" ]]; then
        print_error "Post with slug '${slug}' already exists."
        exit 1
    fi

    # Get current date
    current_date=$(get_current_date)

    # Create the markdown content
    content="---
title: \"${title}\"
description: \"${description}\"
pubDate: ${current_date}
category: \"${category}\"
tags: ${tags}
lang: \"${lang}\"
---

## ${title}

Write your content here...
"

    # Create directory if it doesn't exist
    mkdir -p "${BLOG_DIR}/${lang}"

    # Write the file
    echo "$content" > "$filepath"

    print_success "Created: ${filepath}"
    echo ""
    echo "You can now edit the file to add your content."
}

# Function to list blog posts
blog_list() {
    local lang_filter=""
    local category_filter=""
    local tag_filter=""
    local sort_by="date"

    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --lang=*)
                lang_filter="${1#*=}"
                shift
                ;;
            --category=*)
                category_filter="${1#*=}"
                shift
                ;;
            --tag=*)
                tag_filter="${1#*=}"
                shift
                ;;
            --sort=*)
                sort_by="${1#*=}"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    echo -e "${BLUE}Blog Posts${NC}"
    echo ""

    # Collect all posts
    posts=()

    for lang_dir in "${BLOG_DIR}"/*/; do
        if [[ -d "$lang_dir" ]]; then
            lang=$(basename "$lang_dir")

            # Apply language filter
            if [[ -n "$lang_filter" && "$lang" != "$lang_filter" ]]; then
                continue
            fi

            for file in "${lang_dir}"*.md; do
                if [[ -f "$file" ]]; then
                    # Extract frontmatter
                    frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d')

                    # Extract fields
                    title=$(echo "$frontmatter" | grep "^title:" | sed 's/^title: *//' | sed 's/^"//' | sed 's/"$//')
                    category=$(echo "$frontmatter" | grep "^category:" | sed 's/^category: *//' | sed 's/^"//' | sed 's/"$//')
                    tags=$(echo "$frontmatter" | grep "^tags:" | sed 's/^tags: *//')
                    pub_date=$(echo "$frontmatter" | grep "^pubDate:" | sed 's/^pubDate: *//')

                    # Get slug from filename
                    slug=$(basename "$file" .md)

                    # Apply category filter
                    if [[ -n "$category_filter" && "$category" != "$category_filter" ]]; then
                        continue
                    fi

                    # Apply tag filter
                    if [[ -n "$tag_filter" ]]; then
                        if ! echo "$tags" | grep -q "$tag_filter"; then
                            continue
                        fi
                    fi

                    # Store post data
                    posts+=("${pub_date}|${slug}|${title}|${lang}|${category}|${tags}")
                fi
            done
        fi
    done

    # Sort posts
    if [[ "$sort_by" == "title" ]]; then
        sorted_posts=$(printf '%s\n' "${posts[@]}" | sort -t'|' -k3)
    else
        sorted_posts=$(printf '%s\n' "${posts[@]}" | sort -t'|' -k1 -r)
    fi

    # Display posts in table format
    printf "%-30s %-40s %-8s %-15s %-20s %s\n" "Slug" "Title" "Lang" "Category" "Tags" "Date"
    printf "%-30s %-40s %-8s %-15s %-20s %s\n" "----" "-----" "----" "--------" "----" "----"

    echo "$sorted_posts" | while IFS='|' read -r slug title lang category tags date; do
        if [[ -n "$slug" ]]; then
            # Truncate long strings
            slug_display=$(echo "$slug" | cut -c1-28)
            title_display=$(echo "$title" | cut -c1-38)
            category_display=$(echo "$category" | cut -c1-13)
            tags_display=$(echo "$tags" | sed 's/\[//g; s/\]//g; s/"//g' | cut -c1-18)

            printf "%-30s %-40s %-8s %-15s %-20s %s\n" \
                "$slug_display" "$title_display" "$lang" "$category_display" "$tags_display" "$date"
        fi
    done

    echo ""
    print_info "Total: $(echo "$sorted_posts" | grep -c '^' || echo 0) posts"
}

# Function to edit a blog post
blog_edit() {
    local slug="$1"

    if [[ -z "$slug" ]]; then
        print_error "Usage: /blog edit <slug>"
        exit 1
    fi

    # Find the file
    local filepath=""
    for lang_dir in "${BLOG_DIR}"/*/; do
        if [[ -d "$lang_dir" ]]; then
            if [[ -f "${lang_dir}${slug}.md" ]]; then
                filepath="${lang_dir}${slug}.md"
                break
            fi
        fi
    done

    if [[ -z "$filepath" ]]; then
        print_error "Post with slug '${slug}' not found."
        exit 1
    fi

    echo -e "${BLUE}Editing: ${filepath}${NC}"
    echo ""

    # Read current content
    content=$(cat "$filepath")

    # Extract frontmatter
    frontmatter=$(sed -n '/^---$/,/^---$/p' "$filepath" | sed '1d;$d')

    # Extract current values
    current_title=$(echo "$frontmatter" | grep "^title:" | sed 's/^title: *//' | sed 's/^"//' | sed 's/"$//')
    current_description=$(echo "$frontmatter" | grep "^description:" | sed 's/^description: *//' | sed 's/^"//' | sed 's/"$//')
    current_category=$(echo "$frontmatter" | grep "^category:" | sed 's/^category: *//' | sed 's/^"//' | sed 's/"$//')
    current_tags=$(echo "$frontmatter" | grep "^tags:" | sed 's/^tags: *//')

    # Ask what to edit
    echo "What do you want to edit?"
    echo "  1. Frontmatter only"
    echo "  2. Content only"
    echo "  3. Both"
    echo ""
    read -p "Select (1/2/3): " edit_choice

    case $edit_choice in
        1)
            # Edit frontmatter
            echo ""
            read -p "Title (current: ${current_title}): " new_title
            read -p "Description (current: ${current_description}): " new_description
            read -p "Category (current: ${current_category}): " new_category
            read -p "Tags (current: ${current_tags}): " new_tags

            # Use current values if empty
            new_title="${new_title:-$current_title}"
            new_description="${new_description:-$current_description}"
            new_category="${new_category:-$current_category}"
            new_tags="${new_tags:-$current_tags}"

            # Update frontmatter
            sed -i "s/^title: .*/title: \"${new_title}\"/" "$filepath"
            sed -i "s/^description: .*/description: \"${new_description}\"/" "$filepath"
            sed -i "s/^category: .*/category: \"${new_category}\"/" "$filepath"
            sed -i "s/^tags: .*/tags: ${new_tags}/" "$filepath"

            print_success "Frontmatter updated."
            ;;
        2)
            # Edit content (open in editor)
            echo ""
            print_info "Opening in editor..."
            ${EDITOR:-nano} "$filepath"
            print_success "Content updated."
            ;;
        3)
            # Edit both
            echo ""
            read -p "Title (current: ${current_title}): " new_title
            read -p "Description (current: ${current_description}): " new_description
            read -p "Category (current: ${current_category}): " new_category
            read -p "Tags (current: ${current_tags}): " new_tags

            # Use current values if empty
            new_title="${new_title:-$current_title}"
            new_description="${new_description:-$current_description}"
            new_category="${new_category:-$current_category}"
            new_tags="${new_tags:-$current_tags}"

            # Update frontmatter
            sed -i "s/^title: .*/title: \"${new_title}\"/" "$filepath"
            sed -i "s/^description: .*/description: \"${new_description}\"/" "$filepath"
            sed -i "s/^category: .*/category: \"${new_category}\"/" "$filepath"
            sed -i "s/^tags: .*/tags: ${new_tags}/" "$filepath"

            # Open content in editor
            print_info "Opening content in editor..."
            ${EDITOR:-nano} "$filepath"
            print_success "Post updated."
            ;;
        *)
            print_error "Invalid choice."
            exit 1
            ;;
    esac
}

# Function to delete a blog post
blog_delete() {
    local slug="$1"

    if [[ -z "$slug" ]]; then
        print_error "Usage: /blog delete <slug>"
        exit 1
    fi

    # Find the file
    local filepath=""
    for lang_dir in "${BLOG_DIR}"/*/; do
        if [[ -d "$lang_dir" ]]; then
            if [[ -f "${lang_dir}${slug}.md" ]]; then
                filepath="${lang_dir}${slug}.md"
                break
            fi
        fi
    done

    if [[ -z "$filepath" ]]; then
        print_error "Post with slug '${slug}' not found."
        exit 1
    fi

    # Read post title
    title=$(grep "^title:" "$filepath" | sed 's/^title: *//' | sed 's/^"//' | sed 's/"$//')

    # Confirm deletion
    echo -e "${YELLOW}Are you sure you want to delete \"${title}\"?${NC}"
    read -p "(y/n): " confirm

    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
        rm "$filepath"
        print_success "Deleted: ${filepath}"
    else
        print_info "Deletion cancelled."
    fi
}

# Main command handler
main() {
    local command="$1"
    shift

    case "$command" in
        new)
            blog_new
            ;;
        list)
            blog_list "$@"
            ;;
        edit)
            blog_edit "$1"
            ;;
        delete)
            blog_delete "$1"
            ;;
        *)
            echo "Blog Management Skill"
            echo ""
            echo "Usage: /blog <command> [options]"
            echo ""
            echo "Commands:"
            echo "  new              Create a new blog post"
            echo "  list             List all blog posts"
            echo "  edit <slug>      Edit an existing blog post"
            echo "  delete <slug>    Delete a blog post"
            echo ""
            echo "Options for list:"
            echo "  --lang=zh|en     Filter by language"
            echo "  --category=<cat> Filter by category"
            echo "  --tag=<tag>      Filter by tag"
            echo "  --sort=date|title Sort order"
            ;;
    esac
}

# Run main function
main "$@"