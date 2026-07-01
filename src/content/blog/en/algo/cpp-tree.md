---
title: "C++ Binary Tree: Traversal, Properties, and Classic Algorithms"
description: "Comprehensive guide to binary tree traversal methods, properties, and classic algorithm problems with C++ recursive and iterative implementations."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Binary Tree", "Data Structure", "Traversal"]
lang: "en"
---

## Tree Definition

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
```

## Four Traversal Methods

### Inorder (Left-Root-Right) — Iterative

```cpp
std::vector<int> inorderIter(TreeNode* root) {
    std::vector<int> result;
    std::stack<TreeNode*> st;
    TreeNode* curr = root;

    while (curr || !st.empty()) {
        while (curr) {
            st.push(curr);
            curr = curr->left;
        }
        curr = st.top();
        st.pop();
        result.push_back(curr->val);
        curr = curr->right;
    }

    return result;
}
```

### Level Order (BFS)

```cpp
std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    std::vector<std::vector<int>> result;
    if (!root) return result;

    std::queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int size = q.size();
        std::vector<int> level;

        for (int i = 0; i < size; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }

        result.push_back(level);
    }

    return result;
}
```

## Maximum Depth

```cpp
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + std::max(maxDepth(root->left), maxDepth(root->right));
}
```

## Lowest Common Ancestor (LCA)

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;

    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);

    if (left && right) return root;
    return left ? left : right;
}
```

## Validate BST

```cpp
bool isValidBST(TreeNode* root) {
    std::function<bool(TreeNode*, long, long)> validate = [&](TreeNode* node, long minVal, long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val)
            && validate(node->right, node->val, maxVal);
    };
    return validate(root, LONG_MIN, LONG_MAX);
}
```

## Practice Problems

- LeetCode 94/144/145: Tree Traversals
- LeetCode 102: Level Order Traversal
- LeetCode 104: Maximum Depth
- LeetCode 236: Lowest Common Ancestor
- LeetCode 98: Validate BST
- LeetCode 297: Serialize and Deserialize
