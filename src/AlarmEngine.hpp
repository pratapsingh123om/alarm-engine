#ifndef ALARMENGINE_HPP
#define ALARMENGINE_HPP

#include <QObject>
#include <vector>

class QTimer;
class Alarm;
class QMediaPlayer;
class QAudioOutput;

class AlarmEngine : public QObject
{
    Q_OBJECT
public:
    explicit AlarmEngine(QObject *parent = nullptr);
    ~AlarmEngine();

    void addAlarm(int hour, int minute, const std::string &label);
    void deleteAlarm(int index);
    const std::vector<Alarm> &getAlarms() const;
    void playAlarmSound();

signals:
    void alarmFired(int index);

private slots:
    void checkAlarms();

private:
    std::vector<Alarm> m_alarms;
    QTimer *m_timer = nullptr;
    QMediaPlayer *m_player = nullptr;
    QAudioOutput *m_audioOutput = nullptr;
};

#endif // ALARMENGINE_HPP