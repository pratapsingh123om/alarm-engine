#include "Alarm.hpp"

Alarm::Alarm(int h, int m, const std::string &lbl)
    : hour(h), minute(m), label(lbl) {}

int Alarm::getHour() const { return hour; }
int Alarm::getMinute() const { return minute; }
std::string Alarm::getLabel() const { return label; }

bool Alarm::shouldTrigger(int currentHour, int currentMinute) const
{
    return hour == currentHour && minute == currentMinute;
}
// This method checks if the alarm should trigger based on the current time.