#pragma once
#include <string>

class Task
{
    std::string description;
    bool completed;

public:
    Task(const std::string &desc, bool done = false);

    std::string getDescription() const;
    bool isCompleted() const;

    void markCompleted();
};
