---
title: "C++ Dynamic Programming: From Basics to Mastery"
description: "In-depth guide to DP core concepts, problem-solving framework, and classic problems including Fibonacci, Knapsack, and LCS with C++ implementations."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Dynamic Programming", "Knapsack", "LCS"]
lang: "en"
---

## What is Dynamic Programming

Dynamic Programming (DP) solves complex problems by breaking them into simpler subproblems. Core concepts:

1. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems**: Subproblems are computed multiple times
3. **State Transition Equation**: Defines recursive relationship between states

## Fibonacci Sequence

```cpp
// Memoization (top-down)
int memo[1001];
int fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    return memo[n];
}

// DP array (bottom-up)
int fibDP(int n) {
    if (n <= 1) return n;
    std::vector<int> dp(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}

// Space optimized
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

## 0-1 Knapsack

Each item can be used at most once:

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

## Longest Common Subsequence (LCS)

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

## Longest Increasing Subsequence (LIS)

```cpp
// O(n log n) Greedy + Binary Search
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

## Edit Distance

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
                    dp[i - 1][j],      // Delete
                    dp[i][j - 1],      // Insert
                    dp[i - 1][j - 1]   // Replace
                });
            }
        }
    }

    return dp[m][n];
}
```

## Practice Problems

- LeetCode 70: Climbing Stairs
- LeetCode 322: Coin Change
- LeetCode 300: Longest Increasing Subsequence
- LeetCode 1143: Longest Common Subsequence
- LeetCode 72: Edit Distance
- LeetCode 53: Maximum Subarray
