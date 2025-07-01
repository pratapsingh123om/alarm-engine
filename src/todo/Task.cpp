#include "Task.hpp"

Task::Task(const std::string &desc, bool done)
    : description(desc), completed(done) {}

std::string Task::getDescription() const
{
    return description;
}

bool Task::isCompleted() const
{
    return completed;
}

void Task::markCompleted()
{
    completed = true;
}
