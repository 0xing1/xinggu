---
title: "C++ Sorting Algorithms: Quick Sort, Merge Sort, Heap Sort"
description: "Comprehensive guide to three classic sorting algorithms with principles, implementations, and complexity comparison in C++."
pubDate: 2026-07-01
category: "C++ Algorithm"
tags: ["C++", "Algorithm", "Sorting", "Quick Sort", "Merge Sort", "Heap Sort"]
lang: "en"
---

## Sorting Overview

| Algorithm | Average | Worst | Space | Stable |
|-----------|---------|-------|-------|--------|
| Quick Sort | O(n log n) | O(n²) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes |
| Heap Sort | O(n log n) | O(n log n) | O(1) | No |

## Quick Sort

Core idea: Pick a pivot, partition the array so left elements are smaller and right elements are larger, then recurse.

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

### Three-Way Quick Sort

More efficient with many duplicate elements:

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

## Merge Sort

Core idea: Split array in half, sort each half, then merge. Classic stable sort.

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

## Heap Sort

Core idea: Use max-heap property, repeatedly extract the maximum to the end of array.

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

    // Build heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    // Extract elements
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
```

## STL Sorting

```cpp
#include <algorithm>
#include <vector>

std::vector<int> arr = {5, 2, 8, 1, 9, 3};

// Default ascending
std::sort(arr.begin(), arr.end());

// Descending
std::sort(arr.begin(), arr.end(), std::greater<int>());

// Custom comparator
std::sort(arr.begin(), arr.end(), [](int a, int b) {
    return a > b;
});

// Partial sort (top k)
std::partial_sort(arr.begin(), arr.begin() + 3, arr.end());

// Stable sort
std::stable_sort(arr.begin(), arr.end());

// Kth smallest element
auto it = std::nth_element(arr.begin(), arr.begin() + 2, arr.end());
```

## Practice Problems

- LeetCode 912: Sort an Array
- LeetCode 75: Sort Colors (Three-Way Quick Sort)
- LeetCode 215: Kth Largest Element
- LeetCode 148: Sort List (Merge Sort)
