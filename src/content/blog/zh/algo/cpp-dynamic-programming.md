---
title: "C++ 动态规划：从入门到精通"
description: "深入讲解动态规划的核心思想、解题框架和经典问题，包含斐波那契、背包、LCS 等完整 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "动态规划", "背包问题", "LCS"]
lang: "zh"
---

## 什么是动态规划

动态规划（Dynamic Programming，DP）是一种通过把原问题分解为相对简单的子问题的方式来求解复杂问题的方法。核心思想：

1. **最优子结构**：问题的最优解包含子问题的最优解
2. **重叠子问题**：子问题会被重复计算
3. **状态转移方程**：定义问题状态之间的递推关系

## 入门：斐波那契数列

```cpp
// 递归（有大量重复计算）
int fibRecursive(int n) {
    if (n <= 1) return n;
    return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// 记忆化搜索（自顶向下）
int memo[1001];
int fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    return memo[n];
}

// DP 数组（自底向上）
int fibDP(int n) {
    if (n <= 1) return n;
    std::vector<int> dp(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// 空间优化
int fibOptimized(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

## 经典问题：爬楼梯

```cpp
// LeetCode 70: 爬楼梯
int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

## 背包问题

### 0-1 背包

每个物品只能选一次：

```cpp
int knapsack01(std::vector<int>& weights, std::vector<int>& values, int capacity) {
    int n = weights.size();
    std::vector<int> dp(capacity + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}
```

### 完全背包

每个物品可以选无限次：

```cpp
int knapsackComplete(std::vector<int>& weights, std::vector<int>& values, int capacity) {
    int n = weights.size();
    std::vector<int> dp(capacity + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = weights[i]; w <= capacity; w++) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}
```

## 最长公共子序列（LCS）

```cpp
int lcs(std::string& text1, std::string& text2) {
    int m = text1.size(), n = text2.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}
```

## 最长递增子序列（LIS）

```cpp
// O(n²) DP
int lisDP(std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> dp(n, 1);
    int result = 1;

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = std::max(dp[i], dp[j] + 1);
            }
        }
        result = std::max(result, dp[i]);
    }

    return result;
}

// O(n log n) 贪心 + 二分
int lisGreedy(std::vector<int>& nums) {
    std::vector<int> tails;
    for (int num : nums) {
        auto it = std::lower_bound(tails.begin(), tails.end(), num);
        if (it == tails.end()) {
            tails.push_back(num);
        } else {
            *it = num;
        }
    }
    return tails.size();
}
```

## 最大子数组和（Kadane 算法）

```cpp
int maxSubArray(std::vector<int>& nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];

    for (int i = 1; i < nums.size(); i++) {
        currentSum = std::max(nums[i], currentSum + nums[i]);
        maxSum = std::max(maxSum, currentSum);
    }

    return maxSum;
}
```

## 编辑距离

```cpp
int editDistance(std::string& word1, std::string& word2) {
    int m = word1.size(), n = word2.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1));

    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + std::min({
                    dp[i - 1][j],      // 删除
                    dp[i][j - 1],      // 插入
                    dp[i - 1][j - 1]   // 替换
                });
            }
        }
    }

    return dp[m][n];
}
```

## 练习题

- LeetCode 70: 爬楼梯
- LeetCode 322: 零钱兑换
- LeetCode 300: 最长递增子序列
- LeetCode 1143: 最长公共子序列
- LeetCode 72: 编辑距离
- LeetCode 53: 最大子数组和
- LeetCode 416: 分割等和子集
