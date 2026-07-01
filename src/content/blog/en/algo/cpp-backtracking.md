---
title: "C++ Backtracking: Permutations, Combinations, and Search"
description: "Systematic guide to backtracking core framework and classic problems including permutations, combinations, subsets, and N-Queens in C++."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Backtracking", "Permutations", "Search"]
lang: "en"
---

## Backtracking Framework

```cpp
void backtrack(path, choices) {
    if (meets_end_condition) {
        result.push_back(path);
        return;
    }

    for (choice : choices) {
        make_choice;
        backtrack(path, choices);
        undo_choice;
    }
}
```

## Permutations

```cpp
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

## Combinations

```cpp
std::vector<std::vector<int>> combine(int n, int k) {
    std::vector<std::vector<int>> result;
    std::vector<int> path;

    std::function<void(int)> backtrack = [&](int start) {
        if (path.size() == k) {
            result.push_back(path);
            return;
        }

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

## Subsets

```cpp
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

## N-Queens

```cpp
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

## Practice Problems

- LeetCode 46/47: Permutations
- LeetCode 77/78: Combinations / Subsets
- LeetCode 39: Combination Sum
- LeetCode 51: N-Queens
- LeetCode 79: Word Search
