#include "Alarm.hpp"

Alarm::Alarm(int h, int m, const std::string &lbl, RepeatType rpt)
    : hour(h), minute(m), label(lbl), repeat(rpt) {}

Alarm::Alarm(int h, int m, const std::string &lbl)
    : hour(h), minute(m), label(lbl), repeat(RepeatType::Once) {}

int Alarm::getHour() const
{
    return hour;
}

int Alarm::getMinute() const
{
    return minute;
}

std::string Alarm::getLabel() const
{
    return label;
}

RepeatType Alarm::getRepeat() const
{
    return repeat;
}

bool Alarm::shouldTrigger(int currentHour, int currentMinute) const
{
    return currentHour == hour && currentMinute == minute;
}
