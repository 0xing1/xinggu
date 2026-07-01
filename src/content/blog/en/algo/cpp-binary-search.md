---
title: "C++ Binary Search: From Basics to Variants"
description: "Deep dive into binary search algorithm principles, implementation, and common variants with complete C++ code examples and complexity analysis."
pubDate: 2026-06-30
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Binary Search", "Data Structure"]
lang: "en"
---

## What is Binary Search

Binary Search is an efficient algorithm for finding a target value in a **sorted array**. It works by repeatedly dividing the search interval in half, achieving O(log n) time complexity.

## Basic Implementation

```cpp
#include <vector>
#include <iostream>

int binarySearch(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;  // Prevent overflow

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;  // Not found
}
```

## Key Details

### 1. Preventing Integer Overflow

Use `left + (right - left) / 2` instead of `(left + right) / 2` to avoid overflow when two large numbers are added.

### 2. Boundary Conditions

- `left <= right`: Include equality because `left == right` still needs checking
- `left = mid + 1` and `right = mid - 1`: Exclude the already-checked `mid`

## Common Variants

### Find Left Bound

```cpp
int findLeftBound(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;
    int result = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            result = mid;
            right = mid - 1;  // Keep searching left
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}
```

### Find Right Bound

```cpp
int findRightBound(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;
    int result = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            result = mid;
            left = mid + 1;  // Keep searching right
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}
```

## Complexity Analysis

| Metric | Complexity |
|--------|------------|
| Time Complexity | O(log n) |
| Space Complexity | O(1) |

## Using STL

The C++ standard library provides binary search related functions:

```cpp
#include <algorithm>
#include <vector>

std::vector<int> nums = {1, 3, 5, 7, 9, 11};

// Check if element exists
bool found = std::binary_search(nums.begin(), nums.end(), 7);

// Find first position not less than target
auto lower = std::lower_bound(nums.begin(), nums.end(), 6);

// Find first position greater than target
auto upper = std::upper_bound(nums.begin(), nums.end(), 6);
```

## Common Use Cases

1. **Finding an element in a sorted array**
2. **Finding insertion position**
3. **Finding peak element**
4. **Search in rotated sorted array**
5. **Search a 2D matrix**

## Practice Problems

- LeetCode 704: Binary Search
- LeetCode 35: Search Insert Position
- LeetCode 34: Find First and Last Position of Element
- LeetCode 33: Search in Rotated Sorted Array
