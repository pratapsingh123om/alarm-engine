#include "AlarmEngine.hpp"
#include "Alarm.hpp"
#include <QTimer>
#include <QTime>
#include <QMediaPlayer>
#include <QAudioOutput>
#include <algorithm>

AlarmEngine::AlarmEngine(QObject *parent)
    : QObject(parent)
{
    m_timer = new QTimer(this);
    m_timer->start(1000);
    connect(m_timer, &QTimer::timeout, this, &AlarmEngine::checkAlarms);
    
    // Initialize audio output
    m_audioOutput = new QAudioOutput(this);
    m_audioOutput->setVolume(0.5);
    
    m_player = new QMediaPlayer(this);
    m_player->setAudioOutput(m_audioOutput);
}

AlarmEngine::~AlarmEngine()
{
    delete m_timer;
    delete m_player;
    delete m_audioOutput;
}

void AlarmEngine::addAlarm(int hour, int minute, const std::string &label)
{
    m_alarms.emplace_back(hour, minute, label);
}

void AlarmEngine::deleteAlarm(int index)
{
    if (index < 0 || index >= static_cast<int>(m_alarms.size()))
        return;
    m_alarms.erase(m_alarms.begin() + index);
}

const std::vector<Alarm> &AlarmEngine::getAlarms() const
{
    return m_alarms;
}

void AlarmEngine::playAlarmSound()
{
    // Play a simple beep sound
    m_player->setSource(QUrl::fromLocalFile(":/sounds/alarm.wav"));
    m_player->play();
}

void AlarmEngine::checkAlarms()
{
    if (m_alarms.empty()) return;

    const QTime now = QTime::currentTime();
    std::vector<int> alarmsToRemove;

    for (int i = 0; i < static_cast<int>(m_alarms.size()); ++i) {
        const Alarm &a = m_alarms[i];
        if (a.getHour() == now.hour() && a.getMinute() == now.minute()) {
            // Play alarm sound
            playAlarmSound();
            
            // Emit signal
            emit alarmFired(i);
            alarmsToRemove.push_back(i);
        }
    }

    // Remove alarms after iterating (reverse order to maintain indices)
    std::sort(alarmsToRemove.rbegin(), alarmsToRemove.rend());
    for (int index : alarmsToRemove) {
        m_alarms.erase(m_alarms.begin() + index);
    }
}