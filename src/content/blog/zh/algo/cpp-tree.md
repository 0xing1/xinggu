---
title: "C++ 二叉树：遍历、性质与经典算法"
description: "全面讲解二叉树的遍历方式、重要性质和经典算法题，附带 C++ 递归与迭代实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "二叉树", "数据结构", "遍历"]
lang: "zh"
---

## 树的定义

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
```

## 四种遍历方式

### 前序遍历（根-左-右）

```cpp
// 递归
void preorder(TreeNode* root, std::vector<int>& result) {
    if (!root) return;
    result.push_back(root->val);
    preorder(root->left, result);
    preorder(root->right, result);
}

// 迭代
std::vector<int> preorderIter(TreeNode* root) {
    std::vector<int> result;
    if (!root) return result;

    std::stack<TreeNode*> st;
    st.push(root);

    while (!st.empty()) {
        TreeNode* node = st.top();
        st.pop();
        result.push_back(node->val);

        if (node->right) st.push(node->right);
        if (node->left) st.push(node->left);
    }

    return result;
}
```

### 中序遍历（左-根-右）

```cpp
// 迭代
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

### 后序遍历（左-右-根）

```cpp
// 迭代（双栈法）
std::vector<int> postorderIter(TreeNode* root) {
    std::vector<int> result;
    if (!root) return result;

    std::stack<TreeNode*> st1, st2;
    st1.push(root);

    while (!st1.empty()) {
        TreeNode* node = st1.top();
        st1.pop();
        st2.push(node);

        if (node->left) st1.push(node->left);
        if (node->right) st1.push(node->right);
    }

    while (!st2.empty()) {
        result.push_back(st2.top()->val);
        st2.pop();
    }

    return result;
}
```

### 层序遍历（BFS）

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

## 重要性质

### 树的最大深度

```cpp
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + std::max(maxDepth(root->left), maxDepth(root->right));
}
```

### 判断对称树

```cpp
bool isSymmetric(TreeNode* root) {
    if (!root) return true;

    std::function<bool(TreeNode*, TreeNode*)> isMirror = [&](TreeNode* l, TreeNode* r) {
        if (!l && !r) return true;
        if (!l || !r) return false;
        return l->val == r->val
            && isMirror(l->left, r->right)
            && isMirror(l->right, r->left);
    };

    return isMirror(root->left, root->right);
}
```

### 路径总和

```cpp
bool hasPathSum(TreeNode* root, int targetSum) {
    if (!root) return false;
    if (!root->left && !root->right) return root->val == targetSum;

    return hasPathSum(root->left, targetSum - root->val)
        || hasPathSum(root->right, targetSum - root->val);
}
```

## 经典算法

### 最近公共祖先（LCA）

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;

    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);

    if (left && right) return root;
    return left ? left : right;
}
```

### 二叉搜索树验证

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

### 序列化与反序列化

```cpp
class Codec {
public:
    std::string serialize(TreeNode* root) {
        if (!root) return "null";
        return std::to_string(root->val) + ","
            + serialize(root->left) + ","
            + serialize(root->right);
    }

    TreeNode* deserialize(std::string data) {
        std::istringstream ss(data);
        return build(ss);
    }

private:
    TreeNode* build(std::istringstream& ss) {
        std::string token;
        std::getline(ss, token, ',');
        if (token == "null") return nullptr;

        TreeNode* node = new TreeNode(std::stoi(token));
        node->left = build(ss);
        node->right = build(ss);
        return node;
    }
};
```

## 练习题

- LeetCode 94/144/145: 二叉树遍历
- LeetCode 102: 二叉树层序遍历
- LeetCode 104: 二叉树最大深度
- LeetCode 236: 最近公共祖先
- LeetCode 98: 验证二叉搜索树
- LeetCode 105: 从前序与中序遍历构造二叉树
- LeetCode 297: 二叉树的序列化
