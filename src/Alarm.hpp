#pragma once
#include <string>
#include <chrono>

enum class RepeatType
{
    Once,
    Daily,
    Weekly
};

class Alarm
{
private:
    int hour;
    int minute;
    std::string label;
    RepeatType repeat;

public:
    Alarm(int h, int m, const std::string &lbl, RepeatType rpt);
    Alarm(int h, int m, const std::string &lbl); // optional overload

    int getHour() const;
    int getMinute() const;
    std::string getLabel() const;
    RepeatType getRepeat() const;

    bool shouldTrigger(int currentHour, int currentMinute) const;
};
