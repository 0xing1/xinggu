---
title: "C++ Hash Table and String Algorithms"
description: "Guide to hash table principles and classic string algorithms including sliding window, KMP, and string matching in C++."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Hash Table", "String", "Sliding Window", "KMP"]
lang: "en"
---

## Hash Table Basics

```cpp
#include <unordered_map>
#include <unordered_set>

std::unordered_map<std::string, int> map;
map["key"] = 1;
map.count("key");  // Check existence

std::unordered_set<int> set;
set.insert(1);
set.count(1);
```

## Two Sum

```cpp
std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}
```

## Sliding Window

### Minimum Window Substring

```cpp
std::string minWindow(std::string s, std::string t) {
    std::unordered_map<char, int> need, window;
    for (char c : t) need[c]++;

    int left = 0, valid = 0;
    int start = 0, minLen = INT_MAX;

    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        if (need.count(c)) {
            window[c]++;
            if (window[c] == need[c]) valid++;
        }

        while (valid == need.size()) {
            if (right - left < minLen) {
                start = left;
                minLen = right - left;
            }
            char d = s[left];
            left++;
            if (need.count(d)) {
                if (window[d] == need[d]) valid--;
                window[d]--;
            }
        }
    }

    return minLen == INT_MAX ? "" : s.substr(start, minLen + 1);
}
```

### Longest Substring Without Repeating Characters

```cpp
int lengthOfLongestSubstring(std::string s) {
    std::unordered_map<char, int> window;
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        window[c]++;

        while (window[c] > 1) {
            window[s[left]]--;
            left++;
        }

        maxLen = std::max(maxLen, right - left + 1);
    }

    return maxLen;
}
```

## KMP String Matching

```cpp
std::vector<int> buildNext(std::string& pattern) {
    int m = pattern.size();
    std::vector<int> next(m, 0);
    int len = 0, i = 1;

    while (i < m) {
        if (pattern[i] == pattern[len]) {
            next[i++] = ++len;
        } else if (len != 0) {
            len = next[len - 1];
        } else {
            next[i++] = 0;
        }
    }

    return next;
}
```

## Practice Problems

- LeetCode 1: Two Sum
- LeetCode 49: Group Anagrams
- LeetCode 3: Longest Substring Without Repeating Characters
- LeetCode 76: Minimum Window Substring
- LeetCode 28: Find the Index of the First Occurrence
