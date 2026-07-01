---
title: "C++ Stack and Queue: Principles and Classic Applications"
description: "Guide to stack and queue core operations and classic applications including bracket matching, monotonic stack, and priority queue in C++."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Stack", "Queue", "Monotonic Stack", "Priority Queue"]
lang: "en"
---

## Stack (LIFO)

```cpp
#include <stack>

std::stack<int> st;
st.push(1);
int top = st.top();
st.pop();
bool empty = st.empty();
```

### Valid Parentheses

```cpp
bool isValid(std::string s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return st.empty();
}
```

## Monotonic Stack

### Next Greater Element

```cpp
std::vector<int> nextGreaterElement(std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> result(n, -1);
    std::stack<int> st;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            result[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }

    return result;
}
```

## Priority Queue (Heap)

```cpp
#include <queue>

// Max heap (default)
std::priority_queue<int> maxHeap;

// Min heap
std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;

// Top K elements
std::vector<int> topK(std::vector<int>& nums, int k) {
    std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;
    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) minHeap.pop();
    }
    std::vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top());
        minHeap.pop();
    }
    return result;
}
```

## Sliding Window Maximum

```cpp
std::vector<int> maxSlidingWindow(std::vector<int>& nums, int k) {
    std::deque<int> dq;
    std::vector<int> result;

    for (int i = 0; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }

    return result;
}
```

## Practice Problems

- LeetCode 20: Valid Parentheses
- LeetCode 155: Min Stack
- LeetCode 84: Largest Rectangle in Histogram
- LeetCode 239: Sliding Window Maximum
- LeetCode 215: Kth Largest Element
