#include "AlarmEngine.hpp"
#include <iostream>
#include <thread>
#include <chrono>

void AlarmEngine::setAlarm()
{
    int hour, minute;
    std::string label;
    int repeatChoice;
    RepeatType repeat;

    std::cout << "⏰ Set your alarm:\n";
    std::cout << "░ Hour (0-23): ";
    std::cin >> hour;
    std::cout << "░ Minute (0-59): ";
    std::cin >> minute;
    std::cout << "🕒 Label: ";
    std::cin.ignore();
    std::getline(std::cin, label);
    std::cout << "Repeat (0: Once, 1: Daily, 2: Weekly): ";
    std::cin >> repeatChoice;

    switch (repeatChoice)
    {
    case 1:
        repeat = RepeatType::Daily;
        break;
    case 2:
        repeat = RepeatType::Weekly;
        break;
    default:
        repeat = RepeatType::Once;
        break;
    }

    alarms.emplace_back(hour, minute, label, repeat);
    std::cout << "📢 Alarm set for " << hour << ":" << (minute < 10 ? "0" : "") << minute << " - " << label << "\n";
}

void AlarmEngine::viewAlarms() const
{
    std::cout << "📋 Alarms:\n";
    for (size_t i = 0; i < alarms.size(); ++i)
    {
        std::cout << i + 1 << ". " << alarms[i].getHour() << ":"
                  << (alarms[i].getMinute() < 10 ? "0" : "") << alarms[i].getMinute()
                  << " - " << alarms[i].getLabel() << "\n";
    }
}

void AlarmEngine::deleteAlarm()
{
    viewAlarms();
    int index;
    std::cout << "Enter alarm number to delete: ";
    std::cin >> index;
    if (index > 0 && index <= alarms.size())
    {
        alarms.erase(alarms.begin() + index - 1);
        std::cout << "🗑️ Alarm deleted.\n";
    }
    else
    {
        std::cout << "❌ Invalid choice.\n";
    }
}

void AlarmEngine::runAlarms()
{
    std::cout << "⌛ Monitoring alarms...\n";

    while (!alarms.empty())
    {
        auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
        struct tm *timeinfo = localtime(&now);
        int hour = timeinfo->tm_hour;
        int minute = timeinfo->tm_min;

        for (size_t i = 0; i < alarms.size(); ++i)
        {
            if (alarms[i].shouldTrigger(hour, minute))
            {
                std::cout << "🔔 Alarm [" << alarms[i].getLabel() << "] is ringing!\n";
                int a, b = rand() % 10 + 1;
                int answer;
                std::cout << "🧠 Solve: 2 + " << b << " = ";
                std::cin >> answer;
                if (answer == 2 + b)
                {
                    std::cout << "✔️ Correct! Alarm dismissed.\n";
                }
                else
                {
                    std::cout << "❌ Wrong answer. Try again later.\n";
                }

                if (alarms[i].getRepeat() == RepeatType::Once)
                {
                    alarms.erase(alarms.begin() + i);
                    --i;
                }
            }
        }

        std::this_thread::sleep_for(std::chrono::seconds(30));
    }

    std::cout << "📭 All alarms done. Returning to menu.\n";
}
