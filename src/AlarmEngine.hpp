#pragma once
#include "Alarm.hpp"
#include <vector>

class AlarmEngine
{
public:
    void addAlarm(int hour, int minute, const std::string &label);
    void deleteAlarm(int index);
    const std::vector<Alarm> &getAlarms() const;

private:
    std::vector<Alarm> alarms;
};
