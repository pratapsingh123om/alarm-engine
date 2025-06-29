#pragma once
#include "Alarm.hpp"
#include <vector>

class AlarmEngine
{
private:
    std::vector<Alarm> alarms;

public:
    void setAlarm();
    void viewAlarms() const;
    void deleteAlarm();
    void runAlarms();
};
