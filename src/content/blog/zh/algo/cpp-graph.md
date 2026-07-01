---
title: "C++ 图算法：BFS、DFS、最短路径"
description: "全面讲解图的表示方法和经典算法，包含 BFS、DFS、Dijkstra、拓扑排序的 C++ 实现。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "图", "BFS", "DFS", "Dijkstra", "拓扑排序"]
lang: "zh"
---

## 图的表示

### 邻接矩阵

```cpp
// 适用于稠密图
std::vector<std::vector<int>> graph(n, std::vector<int>(n, 0));
graph[u][v] = weight;  // 添加边 u -> v
```

### 邻接表

```cpp
// 适用于稀疏图
std::vector<std::vector<std::pair<int, int>>> graph(n);
graph[u].push_back({v, weight});  // 添加边 u -> v，权重 weight
```

## 广度优先搜索（BFS）

按层级遍历，适合求最短路径（无权图）。

```cpp
#include <vector>
#include <queue>

// 返回从 start 到所有节点的最短距离
std::vector<int> bfs(std::vector<std::vector<int>>& graph, int start) {
    int n = graph.size();
    std::vector<int> dist(n, -1);
    std::queue<int> q;

    dist[start] = 0;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        for (int v : graph[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }

    return dist;
}
```

### BFS 求最短路径（网格）

```cpp
// LeetCode 542: 01 矩阵
std::vector<std::vector<int>> updateMatrix(std::vector<std::vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    std::vector<std::vector<int>> dist(m, std::vector<int>(n, -1));
    std::queue<std::pair<int, int>> q;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (mat[i][j] == 0) {
                dist[i][j] = 0;
                q.push({i, j});
            }
        }
    }

    int dirs[] = {0, 1, 0, -1, 0};
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();

        for (int d = 0; d < 4; d++) {
            int nx = x + dirs[d], ny = y + dirs[d + 1];
            if (nx >= 0 && nx < m && ny >= 0 && ny < n && dist[nx][ny] == -1) {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }

    return dist;
}
```

## 深度优先搜索（DFS）

沿一条路径走到底再回溯，适合连通性检测、拓扑排序。

```cpp
#include <vector>

void dfs(std::vector<std::vector<int>>& graph, int u, std::vector<bool>& visited) {
    visited[u] = true;
    // 处理节点 u
    for (int v : graph[u]) {
        if (!visited[v]) {
            dfs(graph, v, visited);
        }
    }
}

// 连通分量计数
int countComponents(int n, std::vector<std::vector<int>>& graph) {
    std::vector<bool> visited(n, false);
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(graph, i, visited);
            count++;
        }
    }
    return count;
}
```

## Dijkstra 最短路径

适用于**非负权重**的有向/无向图。

```cpp
#include <vector>
#include <queue>
#include <climits>

std::vector<int> dijkstra(std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    int n = graph.size();
    std::vector<int> dist(n, INT_MAX);
    // {距离, 节点}
    std::priority_queue<std::pair<int, int>,
        std::vector<std::pair<int, int>>,
        std::greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, weight] : graph[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}
```

## 拓扑排序

适用于有向无环图（DAG），常用于任务调度。

```cpp
#include <vector>
#include <queue>

// Kahn 算法（BFS）
std::vector<int> topoSort(int n, std::vector<std::vector<int>>& graph) {
    std::vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : graph[u]) {
            inDegree[v]++;
        }
    }

    std::queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    std::vector<int> result;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);

        for (int v : graph[u]) {
            if (--inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    return result.size() == n ? result : {};  // 有环则返回空
}
```

## 并查集

处理连通性问题的高效数据结构。

```cpp
class UnionFind {
public:
    std::vector<int> parent, rank;

    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // 路径压缩
        }
        return parent[x];
    }

    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;

        if (rank[px] < rank[py]) std::swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;

        return true;
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }
};
```

## 练习题

- LeetCode 200: 岛屿数量（DFS/BFS）
- LeetCode 207: 课程表（拓扑排序）
- LeetCode 743: 网络延迟时间（Dijkstra）
- LeetCode 684: 冗余连接（并查集）
- LeetCode 127: 单词接龙（BFS）
- LeetCode 133: 克隆图（DFS）
