---
title: "C++ 哈希表与字符串算法"
description: "讲解哈希表原理和字符串经典算法，包含滑动窗口、KMP、字符串匹配等 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "哈希表", "字符串", "滑动窗口", "KMP"]
lang: "zh"
---

## 哈希表基础

```cpp
#include <unordered_map>
#include <unordered_set>

// 基本操作
std::unordered_map<std::string, int> map;
map["key"] = 1;
map.insert({"key2", 2});
map.erase("key");
bool exists = map.count("key") > 0;
int val = map.at("key");

// 遍历
for (auto& [key, value] : map) {
    // key, value
}

// 集合
std::unordered_set<int> set;
set.insert(1);
set.count(1);  // 1 存在，0 不存在
set.erase(1);
```

## 两数之和

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

## 字符频率统计

```cpp
// 判断字母异位词
bool isAnagram(std::string s, std::string t) {
    if (s.size() != t.size()) return false;

    std::unordered_map<char, int> count;
    for (char c : s) count[c]++;
    for (char c : t) {
        if (--count[c] < 0) return false;
    }
    return true;
}
```

## 滑动窗口

解决子串/子数组问题的利器。

### 最小覆盖子串

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

        // 收缩窗口
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

### 无重复字符的最长子串

```cpp
int lengthOfLongestSubstring(std::string s) {
    std::unordered_map<char, int> window;
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        window[c]++;

        while (window[c] > 1) {
            char d = s[left];
            window[d]--;
            left++;
        }

        maxLen = std::max(maxLen, right - left + 1);
    }

    return maxLen;
}
```

### 找所有字母异位词

```cpp
std::vector<int> findAnagrams(std::string s, std::string p) {
    std::vector<int> result;
    std::unordered_map<char, int> need, window;
    for (char c : p) need[c]++;

    int left = 0, valid = 0;
    for (int right = 0; right < s.size(); right++) {
        char c = s[right];
        if (need.count(c)) {
            window[c]++;
            if (window[c] == need[c]) valid++;
        }

        if (right - left + 1 > p.size()) {
            char d = s[left];
            left++;
            if (need.count(d)) {
                if (window[d] == need[d]) valid--;
                window[d]--;
            }
        }

        if (valid == need.size()) {
            result.push_back(left);
        }
    }

    return result;
}
```

## KMP 字符串匹配

```cpp
std::vector<int> buildNext(std::string& pattern) {
    int m = pattern.size();
    std::vector<int> next(m, 0);
    int len = 0;
    int i = 1;

    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            next[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = next[len - 1];
            } else {
                next[i] = 0;
                i++;
            }
        }
    }

    return next;
}

int kmpSearch(std::string& text, std::string& pattern) {
    int n = text.size(), m = pattern.size();
    std::vector<int> next = buildNext(pattern);

    int i = 0, j = 0;
    while (i < n) {
        if (text[i] == pattern[j]) {
            i++;
            j++;
        }
        if (j == m) {
            return i - j;  // 找到匹配
        } else if (i < n && text[i] != pattern[j]) {
            if (j != 0) {
                j = next[j - 1];
            } else {
                i++;
            }
        }
    }

    return -1;  // 未找到
}
```

## 练习题

- LeetCode 1: 两数之和
- LeetCode 49: 字母异位词分组
- LeetCode 3: 无重复字符的最长子串
- LeetCode 76: 最小覆盖子串
- LeetCode 438: 找到字符串中所有字母异位词
- LeetCode 28: 找出字符串中第一个匹配项的下标
