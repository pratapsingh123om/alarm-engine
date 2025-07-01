#include "AlarmEngine.hpp"

void AlarmEngine::addAlarm(int hour, int minute, const std::string &label)
{
    alarms.emplace_back(hour, minute, label);
}

void AlarmEngine::deleteAlarm(int index)
{
    if (index >= 0 && index < static_cast<int>(alarms.size()))
    {
        alarms.erase(alarms.begin() + index);
    }
}

const std::vector<Alarm> &AlarmEngine::getAlarms() const
{
    return alarms;
}
