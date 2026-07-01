---
title: "C++ 栈与队列：原理与经典应用"
description: "讲解栈和队列的核心操作及经典应用，包括括号匹配、单调栈、优先队列等 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "栈", "队列", "单调栈", "优先队列"]
lang: "zh"
---

## 栈（Stack）

后进先出（LIFO）数据结构。

### 基本操作

```cpp
#include <stack>

std::stack<int> st;
st.push(1);      // 入栈
st.push(2);
int top = st.top();  // 查看栈顶
st.pop();         // 出栈
bool empty = st.empty();  // 判断是否为空
```

### 应用：括号匹配

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

### 应用：计算表达式

```cpp
int calculate(std::string s) {
    std::stack<int> st;
    int num = 0;
    char sign = '+';

    for (int i = 0; i < s.size(); i++) {
        char c = s[i];
        if (isdigit(c)) {
            num = num * 10 + (c - '0');
        }
        if ((!isdigit(c) && c != ' ') || i == s.size() - 1) {
            if (sign == '+') st.push(num);
            else if (sign == '-') st.push(-num);
            else if (sign == '*') {
                int prev = st.top(); st.pop();
                st.push(prev * num);
            } else if (sign == '/') {
                int prev = st.top(); st.pop();
                st.push(prev / num);
            }
            sign = c;
            num = 0;
        }
    }

    int result = 0;
    while (!st.empty()) {
        result += st.top();
        st.pop();
    }
    return result;
}
```

## 单调栈

维护一个单调递增或递减的栈，用于解决"下一个更大/更小元素"问题。

### 下一个更大元素

```cpp
std::vector<int> nextGreaterElement(std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> result(n, -1);
    std::stack<int> st;  // 存储下标

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

### 接雨水

```cpp
int trap(std::vector<int>& height) {
    int n = height.size();
    std::stack<int> st;
    int water = 0;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && height[i] > height[st.top()]) {
            int top = st.top();
            st.pop();
            if (st.empty()) break;
            int distance = i - st.top() - 1;
            int boundedHeight = std::min(height[i], height[st.top()]) - height[top];
            water += distance * boundedHeight;
        }
        st.push(i);
    }

    return water;
}
```

## 队列（Queue）

先进先出（FIFO）数据结构。

```cpp
#include <queue>

std::queue<int> q;
q.push(1);       // 入队
q.push(2);
int front = q.front();  // 查看队首
q.pop();          // 出队
bool empty = q.empty();
```

## 优先队列（堆）

```cpp
#include <queue>

// 最大堆（默认）
std::priority_queue<int> maxHeap;
maxHeap.push(3);
maxHeap.push(1);
maxHeap.push(4);
int top = maxHeap.top();  // 4

// 最小堆
std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;
minHeap.push(3);
minHeap.push(1);
minHeap.push(4);
int top = minHeap.top();  // 1

// 自定义比较
struct Compare {
    bool operator()(const std::pair<int,int>& a, const std::pair<int,int>& b) {
        return a.first > b.first;
    }
};
std::priority_queue<std::pair<int,int>, std::vector<std::pair<int,int>>, Compare> pq;
```

### 应用：Top K 问题

```cpp
std::vector<int> topK(std::vector<int>& nums, int k) {
    std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;

    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }

    std::vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top());
        minHeap.pop();
    }
    return result;
}
```

### 应用：滑动窗口最大值

```cpp
std::vector<int> maxSlidingWindow(std::vector<int>& nums, int k) {
    std::deque<int> dq;  // 存储下标
    std::vector<int> result;

    for (int i = 0; i < nums.size(); i++) {
        // 移除超出窗口的元素
        while (!dq.empty() && dq.front() < i - k + 1) {
            dq.pop_front();
        }
        // 维护单调递减
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        dq.push_back(i);

        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }

    return result;
}
```

## 练习题

- LeetCode 20: 有效的括号
- LeetCode 155: 最小栈
- LeetCode 84: 柱状图中最大的矩形
- LeetCode 239: 滑动窗口最大值
- LeetCode 215: 数组中的第K个最大元素
- LeetCode 224: 基本计算器
