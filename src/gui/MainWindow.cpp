#include "MainWindow.hpp"
#include "ui_MainWindow.h"
#include <QInputDialog>
#include <QListWidgetItem>
#include <QTimeEdit>
#include <QTimer>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent),
      ui(new Ui::MainWindow),
      tts(new QTextToSpeech(this))
{
    ui->setupUi(this);

    connect(ui->addAlarmButton, &QPushButton::clicked, this, &MainWindow::onAddAlarm);
    connect(ui->addTaskButton, &QPushButton::clicked, this, &MainWindow::onAddTask);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onAddAlarm()
{
    bool ok;
    QTime time = QTime::currentTime();
    time = QInputDialog::getText(this, "Set Alarm", "Enter time (HH:MM)", QLineEdit::Normal, time.toString("HH:mm"), &ok).isEmpty()
               ? QTime::currentTime()
               : QTime::fromString(QInputDialog::getText(this, "Time", "HH:mm", QLineEdit::Normal), "HH:mm");

    if (ok && time.isValid())
    {
        // Logic to add alarm
        QListWidgetItem *item = new QListWidgetItem("Alarm set for " + time.toString("hh:mm"));
        ui->alarmList->addItem(item);

        QTimer *timer = new QTimer(this);
        int msecsUntilAlarm = QTime::currentTime().msecsTo(time);
        if (msecsUntilAlarm < 0)
            msecsUntilAlarm += 86400000; // Add a day if it's past

        QTimer::singleShot(msecsUntilAlarm, this, [this]()
                           {
                               tts->say("Good morning! Here is your task list.");
                               // Speak tasks here (next step)
                           });
    }
}

void MainWindow::onAddTask()
{
    bool ok;
    QString task = QInputDialog::getText(this, "Add Task", "Enter task:", QLineEdit::Normal, "", &ok);
    if (ok && !task.isEmpty())
    {
        ui->taskList->addItem(task);
    }
}
