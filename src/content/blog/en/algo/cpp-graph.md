---
title: "C++ Graph Algorithms: BFS, DFS, Shortest Path"
description: "Comprehensive guide to graph representations and classic algorithms including BFS, DFS, Dijkstra, and Topological Sort with C++ implementations."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Graph", "BFS", "DFS", "Dijkstra", "Topological Sort"]
lang: "en"
---

## Graph Representations

### Adjacency Matrix

```cpp
// For dense graphs
std::vector<std::vector<int>> graph(n, std::vector<int>(n, 0));
graph[u][v] = weight;
```

### Adjacency List

```cpp
// For sparse graphs
std::vector<std::vector<std::pair<int, int>>> graph(n);
graph[u].push_back({v, weight});
```

## BFS (Breadth-First Search)

Level-by-level traversal, ideal for shortest path in unweighted graphs.

```cpp
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

## DFS (Depth-First Search)

Go deep along one path before backtracking. Good for connectivity and topological sort.

```cpp
void dfs(std::vector<std::vector<int>>& graph, int u, std::vector<bool>& visited) {
    visited[u] = true;
    for (int v : graph[u]) {
        if (!visited[v]) {
            dfs(graph, v, visited);
        }
    }
}
```

## Dijkstra's Algorithm

For graphs with **non-negative** edge weights.

```cpp
std::vector<int> dijkstra(std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    int n = graph.size();
    std::vector<int> dist(n, INT_MAX);
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

## Topological Sort

For Directed Acyclic Graphs (DAG). Used in task scheduling.

```cpp
std::vector<int> topoSort(int n, std::vector<std::vector<int>>& graph) {
    std::vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : graph[u]) inDegree[v]++;
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
            if (--inDegree[v] == 0) q.push(v);
        }
    }

    return result.size() == n ? result : {};
}
```

## Union-Find

Efficient data structure for connectivity queries.

```cpp
class UnionFind {
public:
    std::vector<int> parent, rank;

    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
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
};
```

## Practice Problems

- LeetCode 200: Number of Islands
- LeetCode 207: Course Schedule
- LeetCode 743: Network Delay Time
- LeetCode 684: Redundant Connection
- LeetCode 127: Word Ladder
