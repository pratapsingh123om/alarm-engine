#include "WakeTask.hpp"
#include <iostream>
#include <cstdlib>

bool WakeTask::runTask()
{
    int a = rand() % 10 + 1;
    int b = rand() % 10 + 1;
    int answer;

    std::cout << "🧠 Solve: " << a << " + " << b << " = ";
    std::cin >> answer;

    return (answer == a + b);
}