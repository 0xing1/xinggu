---
title: "C++ Greedy Algorithms: Strategies and Classic Problems"
description: "Guide to greedy algorithm core concepts and classic applications including interval scheduling, jump game, and task scheduling in C++."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Greedy", "Interval Scheduling"]
lang: "en"
---

## What is Greedy Algorithm

Greedy algorithms make locally optimal choices at each step, hoping to find a global optimum. Applicable when:

1. **Greedy Choice Property**: Local optimum leads to global optimum
2. **Optimal Substructure**: Optimal solution contains optimal sub-solutions

## Interval Scheduling

### Non-overlapping Intervals

```cpp
int eraseOverlapIntervals(std::vector<std::vector<int>>& intervals) {
    if (intervals.empty()) return 0;

    std::sort(intervals.begin(), intervals.end(),
        [](const auto& a, const auto& b) { return a[1] < b[1]; });

    int count = 0;
    int end = intervals[0][1];

    for (int i = 1; i < intervals.size(); i++) {
        if (intervals[i][0] < end) {
            count++;
        } else {
            end = intervals[i][1];
        }
    }

    return count;
}
```

### Merge Intervals

```cpp
std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {
    std::sort(intervals.begin(), intervals.end());
    std::vector<std::vector<int>> merged;

    for (auto& interval : intervals) {
        if (merged.empty() || merged.back()[1] < interval[0]) {
            merged.push_back(interval);
        } else {
            merged.back()[1] = std::max(merged.back()[1], interval[1]);
        }
    }

    return merged;
}
```

## Jump Game

```cpp
bool canJump(std::vector<int>& nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > maxReach) return false;
        maxReach = std::max(maxReach, i + nums[i]);
    }
    return true;
}

int jump(std::vector<int>& nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;
    for (int i = 0; i < nums.size() - 1; i++) {
        farthest = std::max(farthest, i + nums[i]);
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    return jumps;
}
```

## Stock Trading

```cpp
int maxProfit(std::vector<int>& prices) {
    int profit = 0;
    for (int i = 1; i < prices.size(); i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}
```

## Task Scheduler

```cpp
int leastInterval(std::vector<char>& tasks, int n) {
    std::unordered_map<char, int> count;
    int maxCount = 0;
    for (char t : tasks) {
        count[t]++;
        maxCount = std::max(maxCount, count[t]);
    }

    int maxFreq = 0;
    for (auto& [_, c] : count) {
        if (c == maxCount) maxFreq++;
    }

    return std::max((int)tasks.size(), (maxCount - 1) * (n + 1) + maxFreq);
}
```

## Practice Problems

- LeetCode 55: Jump Game
- LeetCode 45: Jump Game II
- LeetCode 435: Non-overlapping Intervals
- LeetCode 56: Merge Intervals
- LeetCode 135: Candy
- LeetCode 122: Best Time to Buy and Sell Stock II
