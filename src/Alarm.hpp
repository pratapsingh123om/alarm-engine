#ifndef ALARM_HPP
#define ALARM_HPP

#include <string>

class Alarm
{
public:
    Alarm() = default;
    Alarm(int h, int m, const std::string &lbl)
        : hour(h), minute(m), label(lbl) {}

    int getHour() const { return hour; }
    int getMinute() const { return minute; }
    const std::string &getLabel() const { return label; }

private:
    int hour = 0;
    int minute = 0;
    std::string label;
};

#endif // ALARM_HPP