---
title: "C++ 排序算法全解：快排、归并、堆排"
description: "系统讲解三大经典排序算法的原理、实现和复杂度对比，附带 C++ 完整代码。"
pubDate: 2026-07-01
category: "C++算法"
tags: ["C++", "算法", "排序", "快速排序", "归并排序", "堆排序"]
lang: "zh"
---

## 排序算法概览

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|----------|----------|------|--------|
| 快速排序 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |

## 快速排序

核心思想：选一个基准值，把数组分成两部分，左边都比基准小，右边都比基准大，然后递归排序。

```cpp
#include <vector>
#include <algorithm>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
```

### 优化：三路快排

处理大量重复元素时效率更高：

```cpp
void quickSort3Way(std::vector<int>& arr, int low, int high) {
    if (low >= high) return;

    int lt = low, gt = high;
    int pivot = arr[low];
    int i = low + 1;

    while (i <= gt) {
        if (arr[i] < pivot) {
            std::swap(arr[lt++], arr[i++]);
        } else if (arr[i] > pivot) {
            std::swap(arr[i], arr[gt--]);
        } else {
            i++;
        }
    }

    quickSort3Way(arr, low, lt - 1);
    quickSort3Way(arr, gt + 1, high);
}
```

## 归并排序

核心思想：把数组拆成两半，分别排序后合并。稳定排序的经典选择。

```cpp
void merge(std::vector<int>& arr, int left, int mid, int right) {
    std::vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }

    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];

    for (int p = 0; p < k; p++) {
        arr[left + p] = temp[p];
    }
}

void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left >= right) return;

    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}
```

## 堆排序

核心思想：利用最大堆的性质，每次取出堆顶（最大值）放到数组末尾。

```cpp
void heapify(std::vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest])
        largest = left;

    if (right < n && arr[right] > arr[largest])
        largest = right;

    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(std::vector<int>& arr) {
    int n = arr.size();

    // 建堆
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    // 逐个取出最大值
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
```

## STL 排序

```cpp
#include <algorithm>
#include <vector>

std::vector<int> arr = {5, 2, 8, 1, 9, 3};

// 默认升序
std::sort(arr.begin(), arr.end());

// 降序
std::sort(arr.begin(), arr.end(), std::greater<int>());

// 自定义比较
std::sort(arr.begin(), arr.end(), [](int a, int b) {
    return a > b;
});

// 部分排序（前 k 个）
std::partial_sort(arr.begin(), arr.begin() + 3, arr.end());

// 稳定排序
std::stable_sort(arr.begin(), arr.end());

// 第 k 小元素
int kth = *std::nth_element(arr.begin(), arr.begin() + 2, arr.end());
```

## 练习题

- LeetCode 912: 排序数组
- LeetCode 75: 颜色分类（三路快排）
- LeetCode 215: 数组中的第K个最大元素
- LeetCode 148: 排序链表（归并排序）
