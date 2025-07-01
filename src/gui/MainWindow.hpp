#pragma once

#include <QMainWindow>
#include <QTime>
#include <QTextToSpeech>

QT_BEGIN_NAMESPACE
namespace Ui
{
    class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void onAddAlarm();
    void onAddTask();

private:
    Ui::MainWindow *ui;
    QTextToSpeech *tts;
};
