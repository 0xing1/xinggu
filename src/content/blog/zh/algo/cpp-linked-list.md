---
title: "C++ 链表：核心操作与经典题解"
description: "系统讲解单链表、双链表的核心操作和经典算法题，附带 C++ 完整实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "链表", "数据结构"]
lang: "zh"
---

## 链表定义

```cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};
```

## 基础操作

### 创建链表

```cpp
ListNode* createList(std::vector<int>& nums) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (int num : nums) {
        curr->next = new ListNode(num);
        curr = curr->next;
    }
    return dummy.next;
}
```

### 反转链表

```cpp
// 迭代
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}

// 递归
ListNode* reverseListRecursive(ListNode* head) {
    if (!head || !head->next) return head;

    ListNode* newHead = reverseListRecursive(head->next);
    head->next->next = head;
    head->next = nullptr;

    return newHead;
}
```

### 检测环

```cpp
// Floyd 快慢指针
bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }

    return false;
}

// 找环的入口
ListNode* detectCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }

    return nullptr;
}
```

## 经典算法

### 合并两个有序链表

```cpp
ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* curr = &dummy;

    while (l1 && l2) {
        if (l1->val <= l2->val) {
            curr->next = l1;
            l1 = l1->next;
        } else {
            curr->next = l2;
            l2 = l2->next;
        }
        curr = curr->next;
    }

    curr->next = l1 ? l1 : l2;
    return dummy.next;
}
```

### 删除倒数第 N 个节点

```cpp
ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* fast = &dummy;
    ListNode* slow = &dummy;

    // fast 先走 n+1 步
    for (int i = 0; i <= n; i++) {
        fast = fast->next;
    }

    while (fast) {
        fast = fast->next;
        slow = slow->next;
    }

    slow->next = slow->next->next;
    return dummy.next;
}
```

### 链表中点

```cpp
ListNode* middleNode(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }

    return slow;
}
```

### 回文链表

```cpp
bool isPalindrome(ListNode* head) {
    // 1. 找中点
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }

    // 2. 反转后半部分
    ListNode* prev = nullptr;
    while (slow) {
        ListNode* next = slow->next;
        slow->next = prev;
        prev = slow;
        slow = next;
    }

    // 3. 比较
    ListNode* left = head;
    ListNode* right = prev;
    while (right) {
        if (left->val != right->val) return false;
        left = left->next;
        right = right->next;
    }

    return true;
}
```

### 排序链表（归并排序）

```cpp
ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;

    // 找中点
    ListNode* slow = head;
    ListNode* fast = head->next;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }

    ListNode* mid = slow->next;
    slow->next = nullptr;

    ListNode* left = sortList(head);
    ListNode* right = sortList(mid);

    return mergeTwoLists(left, right);
}
```

## 练习题

- LeetCode 206: 反转链表
- LeetCode 141: 环形链表
- LeetCode 21: 合并两个有序链表
- LeetCode 19: 删除倒数第N个节点
- LeetCode 234: 回文链表
- LeetCode 148: 排序链表
- LeetCode 142: 环形链表 II
