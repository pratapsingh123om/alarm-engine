#include "AlarmEngine.hpp"
#include <iostream>

int main()
{
    AlarmEngine engine;
    int choice;

    while (true)
    {
        std::cout << "\n=== Alarm Menu ===\n";
        std::cout << "1. Set new alarm\n";
        std::cout << "2. View alarms\n";
        std::cout << "3. Delete an alarm\n";
        std::cout << "4. Run alarms\n";
        std::cout << "0. Exit\n";
        std::cout << "Choice: ";
        std::cin >> choice;

        switch (choice)
        {
        case 1:
            engine.setAlarm();
            break;
        case 2:
            engine.viewAlarms();
            break;
        case 3:
            engine.deleteAlarm();
            break;
        case 4:
            engine.runAlarms();
            break;
        case 0:
            return 0;
        default:
            std::cout << "❌ Invalid choice.\n";
            break;
        }
    }
}
