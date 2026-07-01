---
title: "C++ 贪心算法：策略与经典问题"
description: "讲解贪心算法的核心思想和经典应用场景，包含区间调度、跳跃游戏、哈夫曼编码等 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "贪心", "区间调度"]
lang: "zh"
---

## 什么是贪心算法

贪心算法在每一步选择中都采取当前状态下最优的选择，希望导致全局最优解。适用条件：

1. **贪心选择性质**：局部最优能导致全局最优
2. **最优子结构**：问题的最优解包含子问题的最优解

## 区间调度问题

### 无重叠区间

```cpp
// LeetCode 435: 无重叠区间
int eraseOverlapIntervals(std::vector<std::vector<int>>& intervals) {
    if (intervals.empty()) return 0;

    std::sort(intervals.begin(), intervals.end(),
        [](const auto& a, const auto& b) { return a[1] < b[1]; });

    int count = 0;
    int end = intervals[0][1];

    for (int i = 1; i < intervals.size(); i++) {
        if (intervals[i][0] < end) {
            count++;  // 有重叠，删除当前区间
        } else {
            end = intervals[i][1];  // 无重叠，更新结束时间
        }
    }

    return count;
}
```

### 用最少数量的箭引爆气球

```cpp
// LeetCode 452: 用最少数量的箭引爆气球
int findMinArrowShots(std::vector<std::vector<int>>& points) {
    if (points.empty()) return 0;

    std::sort(points.begin(), points.end(),
        [](const auto& a, const auto& b) { return a[1] < b[1]; });

    int arrows = 1;
    int end = points[0][1];

    for (int i = 1; i < points.size(); i++) {
        if (points[i][0] > end) {
            arrows++;
            end = points[i][1];
        }
    }

    return arrows;
}
```

## 跳跃游戏

```cpp
// LeetCode 55: 跳跃游戏
bool canJump(std::vector<int>& nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > maxReach) return false;
        maxReach = std::max(maxReach, i + nums[i]);
    }
    return true;
}

// LeetCode 45: 跳跃游戏 II
int jump(std::vector<int>& nums) {
    int jumps = 0;
    int currentEnd = 0;
    int farthest = 0;

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

## 分配问题

### 分发糖果

```cpp
// LeetCode 135: 分发糖果
int candy(std::vector<int>& ratings) {
    int n = ratings.size();
    std::vector<int> candies(n, 1);

    // 左到右
    for (int i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }

    // 右到左
    for (int i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            candies[i] = std::max(candies[i], candies[i + 1] + 1);
        }
    }

    int total = 0;
    for (int c : candies) total += c;
    return total;
}
```

## 股票买卖

```cpp
// LeetCode 122: 股票买卖的最佳时机 II
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

## 合并区间

```cpp
// LeetCode 56: 合并区间
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

## 任务调度

```cpp
// LeetCode 621: 任务调度器
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

## 练习题

- LeetCode 55: 跳跃游戏
- LeetCode 45: 跳跃游戏 II
- LeetCode 435: 无重叠区间
- LeetCode 56: 合并区间
- LeetCode 135: 分发糖果
- LeetCode 122: 股票买卖 II
- LeetCode 621: 任务调度器
