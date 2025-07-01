#pragma once
#include <string>

class Alarm
{
public:
    Alarm(int h, int m, const std::string &lbl);
    int getHour() const;
    int getMinute() const;
    std::string getLabel() const;
    bool shouldTrigger(int currentHour, int currentMinute) const;

private:
    int hour;
    int minute;
    std::string label;
};
