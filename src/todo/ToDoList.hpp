#pragma once
#include "Task.hpp"
#include <vector>

class ToDoList
{
    std::vector<Task> tasks;

public:
    void addTask(const std::string &desc);
    void listTasks() const;
    void markDone(size_t index);
    void removeTask(size_t index);
    size_t taskCount() const;
};
