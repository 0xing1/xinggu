---
title: "C++ 回溯算法：排列、组合与搜索"
description: "系统讲解回溯算法的核心框架和经典问题，包含全排列、组合、子集、N皇后等 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "回溯", "排列组合", "搜索"]
lang: "zh"
---

## 回溯算法框架

回溯算法的核心是**做选择 → 递归 → 撤销选择**。

```cpp
void backtrack(路径, 选择列表) {
    if (满足结束条件) {
        result.push_back(路径);
        return;
    }

    for (选择 : 选择列表) {
        做选择;
        backtrack(路径, 选择列表);
        撤销选择;
    }
}
```

## 全排列

```cpp
// LeetCode 46: 全排列
std::vector<std::vector<int>> permute(std::vector<int>& nums) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);

    std::function<void()> backtrack = [&]() {
        if (path.size() == nums.size()) {
            result.push_back(path);
            return;
        }

        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            backtrack();
            path.pop_back();
            used[i] = false;
        }
    };

    backtrack();
    return result;
}
```

### 有重复元素的全排列

```cpp
// LeetCode 47: 全排列 II
std::vector<std::vector<int>> permuteUnique(std::vector<int>& nums) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);
    std::sort(nums.begin(), nums.end());

    std::function<void()> backtrack = [&]() {
        if (path.size() == nums.size()) {
            result.push_back(path);
            return;
        }

        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

            used[i] = true;
            path.push_back(nums[i]);
            backtrack();
            path.pop_back();
            used[i] = false;
        }
    };

    backtrack();
    return result;
}
```

## 组合

```cpp
// LeetCode 77: 组合
std::vector<std::vector<int>> combine(int n, int k) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;

    std::function<void(int)> backtrack = [&](int start) {
        if (path.size() == k) {
            result.push_back(path);
            return;
        }

        // 剪枝：剩余元素不够
        for (int i = start; i <= n - (k - path.size()) + 1; i++) {
            path.push_back(i);
            backtrack(i + 1);
            path.pop_back();
        }
    };

    backtrack(1);
    return result;
}
```

## 组合总和

```cpp
// LeetCode 39: 组合总和
std::vector<std::vector<int>> combinationSum(std::vector<int>& candidates, int target) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;
    std::sort(candidates.begin(), candidates.end());

    std::function<void(int, int)> backtrack = [&](int start, int remain) {
        if (remain == 0) {
            result.push_back(path);
            return;
        }

        for (int i = start; i < candidates.size(); i++) {
            if (candidates[i] > remain) break;
            path.push_back(candidates[i]);
            backtrack(i, remain - candidates[i]);  // 可以重复选
            path.pop_back();
        }
    };

    backtrack(0, target);
    return result;
}
```

## 子集

```cpp
// LeetCode 78: 子集
std::vector<std::vector<int>> subsets(std::vector<int>& nums) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;

    std::function<void(int)> backtrack = [&](int start) {
        result.push_back(path);

        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            backtrack(i + 1);
            path.pop_back();
        }
    };

    backtrack(0);
    return result;
}
```

## N 皇后

```cpp
// LeetCode 51: N 皇后
std::vector<std::vector<std::string>> solveNQueens(int n) {
    std::vector<std::vector<std::string>> result;
    std::vector<std::string> board(n, std::string(n, '.'));
    std::vector<bool> cols(n, false);
    std::vector<bool> diag1(2 * n - 1, false);
    std::vector<bool> diag2(2 * n - 1, false);

    std::function<void(int)> backtrack = [&](int row) {
        if (row == n) {
            result.push_back(board);
            return;
        }

        for (int col = 0; col < n; col++) {
            if (cols[col] || diag1[row - col + n - 1] || diag2[row + col]) continue;

            board[row][col] = 'Q';
            cols[col] = diag1[row - col + n - 1] = diag2[row + col] = true;

            backtrack(row + 1);

            board[row][col] = '.';
            cols[col] = diag1[row - col + n - 1] = diag2[row + col] = false;
        }
    };

    backtrack(0);
    return result;
}
```

## 单词搜索

```cpp
// LeetCode 79: 单词搜索
bool exist(std::vector<std::vector<char>>& board, std::string word) {
    int m = board.size(), n = board[0].size();

    std::function<bool(int, int, int)> backtrack = [&](int i, int j, int k) {
        if (k == word.size()) return true;
        if (i < 0 || i >= m || j < 0 || j >= n) return false;
        if (board[i][j] != word[k]) return false;

        char tmp = board[i][j];
        board[i][j] = '#';

        bool found = backtrack(i + 1, j, k + 1)
                  || backtrack(i - 1, j, k + 1)
                  || backtrack(i, j + 1, k + 1)
                  || backtrack(i, j - 1, k + 1);

        board[i][j] = tmp;
        return found;
    };

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (backtrack(i, j, 0)) return true;
        }
    }

    return false;
}
```

## 练习题

- LeetCode 46/47: 全排列
- LeetCode 77/78: 组合 / 子集
- LeetCode 39: 组合总和
- LeetCode 51: N 皇后
- LeetCode 79: 单词搜索
- LeetCode 131: 分割回文串
