#ifndef ALARMAPI_HPP
#define ALARMAPI_HPP

#include <QObject>
#include <QString>

class AlarmEngine;

class AlarmAPI : public QObject
{
    Q_OBJECT
public:
    explicit AlarmAPI(QObject *parent = nullptr);
    ~AlarmAPI();

    Q_INVOKABLE QString getAlarms();
    Q_INVOKABLE QString getAlarms12Hour();
    Q_INVOKABLE QString addAlarm(int hour, int minute, const QString &label);
    Q_INVOKABLE QString deleteAlarm(int idx);
    Q_INVOKABLE QString selectAudioFile();
    Q_INVOKABLE void announceTasks();
    Q_INVOKABLE void openTodoDashboard();
    Q_INVOKABLE void playMusic(const QString &source, const QString &type);
    Q_INVOKABLE QString getSpotifyAuthUrl();
    Q_INVOKABLE bool handleSpotifyCallback(const QUrl &callbackUrl);

signals:
    void alarmTriggered(const QString &alarmJson);

private slots:
    void onEngineAlarmFired(int index);

private:
    AlarmEngine *m_engine = nullptr;
};

#endif // ALARMAPI_HPP