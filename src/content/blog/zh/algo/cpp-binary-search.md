---
title: "C++ 二分查找：从基础到变体"
description: "深入理解二分查找算法的原理、实现和常见变体，附带完整 C++ 代码示例和复杂度分析。"
pubDate: 2026-06-30
category: "C++算法"
tags: ["C++", "算法", "二分查找", "数据结构"]
lang: "zh"
---

## 什么是二分查找

二分查找（Binary Search）是一种在**有序数组**中查找目标值的高效算法。它通过每次将搜索范围缩小一半来快速定位目标，时间复杂度为 O(log n)。

## 基础实现

```cpp
#include <vector>
#include <iostream>

int binarySearch(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;  // 防止溢出

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;  // 未找到
}
```

## 关键细节

### 1. 防止整数溢出

使用 `left + (right - left) / 2` 而不是 `(left + right) / 2`，避免两个大数相加导致溢出。

### 2. 边界条件

- `left <= right`：包含等号，因为 `left == right` 时仍需检查
- `left = mid + 1` 和 `right = mid - 1`：排除已检查的 `mid`

## 常见变体

### 查找左边界

```cpp
int findLeftBound(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;
    int result = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            result = mid;
            right = mid - 1;  // 继续向左搜索
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}
```

### 查找右边界

```cpp
int findRightBound(const std::vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;
    int result = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            result = mid;
            left = mid + 1;  // 继续向右搜索
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}
```

## 复杂度分析

| 指标 | 复杂度 |
|------|--------|
| 时间复杂度 | O(log n) |
| 空间复杂度 | O(1) |

## 使用 STL

C++ 标准库提供了二分查找相关函数：

```cpp
#include <algorithm>
#include <vector>

std::vector<int> nums = {1, 3, 5, 7, 9, 11};

// 查找元素是否存在
bool found = std::binary_search(nums.begin(), nums.end(), 7);

// 查找第一个不小于 target 的位置
auto lower = std::lower_bound(nums.begin(), nums.end(), 6);

// 查找第一个大于 target 的位置
auto upper = std::upper_bound(nums.begin(), nums.end(), 6);
```

## 常见应用场景

1. **查找有序数组中的元素**
2. **查找插入位置**
3. **查找峰值元素**
4. **旋转排序数组查找**
5. **搜索二维矩阵**

## 练习题

- LeetCode 704: 二分查找
- LeetCode 35: 搜索插入位置
- LeetCode 34: 在排序数组中查找元素的第一个和最后一个位置
- LeetCode 33: 搜索旋转排序数组
