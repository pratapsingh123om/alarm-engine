#include "ToDoList.hpp"
#include <iostream>

void ToDoList::addTask(const std::string &desc)
{
    tasks.emplace_back(desc);
}

void ToDoList::listTasks() const
{
    for (size_t i = 0; i < tasks.size(); ++i)
    {
        std::cout << i + 1 << ". [" << (tasks[i].isCompleted() ? "x" : " ") << "] "
                  << tasks[i].getDescription() << "\n";
    }
}

void ToDoList::markDone(size_t index)
{
    if (index < 1 || index > tasks.size())
        return;
    tasks[index - 1].markCompleted();
}

void ToDoList::removeTask(size_t index)
{
    if (index < 1 || index > tasks.size())
        return;
    tasks.erase(tasks.begin() + index - 1);
}

size_t ToDoList::taskCount() const
{
    return tasks.size();
}
