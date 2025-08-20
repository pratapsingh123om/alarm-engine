#pragma once

#include <QMainWindow>
#include <QTime>
#include <QTextToSpeech>
#include <QWebEngineView>
#include <QWebChannel>

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private:
    QTextToSpeech *tts;
    QWebEngineView *webView;
    QWebChannel *webChannel;
};
