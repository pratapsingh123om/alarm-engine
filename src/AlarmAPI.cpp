#include "AlarmAPI.hpp"
#include "AlarmEngine.hpp"
#include "Alarm.hpp"
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonDocument>
#include <QFileDialog>
#include <QUrl>
#include <QProcess>
#include <QDir>
#include <QCoreApplication>
#include <QDebug>
#include <QTemporaryFile>
#include <QFile>
#include <QFileInfo>
#include <QMessageBox>
#include <QStandardPaths>

AlarmAPI::AlarmAPI(QObject *parent)
    : QObject(parent)
{
    m_engine = new AlarmEngine(this);
    connect(m_engine, &AlarmEngine::alarmFired, this, &AlarmAPI::onEngineAlarmFired);
}

AlarmAPI::~AlarmAPI()
{
    delete m_engine;
}

QString AlarmAPI::getAlarms()
{
    QJsonArray arr;
    const auto& alarms = m_engine->getAlarms();
    for (const auto &a : alarms) {
        QJsonObject obj;
        obj["hour"] = a.getHour();
        obj["minute"] = a.getMinute();
        obj["label"] = QString::fromStdString(a.getLabel());
        arr.append(obj);
    }
    return QString(QJsonDocument(arr).toJson(QJsonDocument::Compact));
}

QString AlarmAPI::getAlarms12Hour()
{
    QJsonArray arr;
    const auto& alarms = m_engine->getAlarms();
    for (const auto &a : alarms) {
        QJsonObject obj;
        int hour = a.getHour();
        QString ampm = "AM";
        
        // Convert to 12-hour format
        if (hour >= 12) {
            ampm = "PM";
            if (hour > 12) hour -= 12;
        }
        if (hour == 0) hour = 12;
        
        obj["hour"] = a.getHour();
        obj["hour12"] = hour;
        obj["minute"] = a.getMinute();
        obj["ampm"] = ampm;
        obj["label"] = QString::fromStdString(a.getLabel());
        obj["formatted"] = QString("%1:%2 %3")
            .arg(hour)
            .arg(a.getMinute(), 2, 10, QChar('0'))
            .arg(ampm);
        arr.append(obj);
    }
    return QString(QJsonDocument(arr).toJson(QJsonDocument::Compact));
}

QString AlarmAPI::addAlarm(int hour, int minute, const QString &label)
{
    m_engine->addAlarm(hour, minute, label.toStdString());
    return getAlarms12Hour();
}

QString AlarmAPI::deleteAlarm(int idx)
{
    m_engine->deleteAlarm(idx);
    return getAlarms12Hour();
}

QString AlarmAPI::selectAudioFile()
{
    QString file = QFileDialog::getOpenFileName(nullptr, "Select audio", QDir::homePath(),
                                                "Audio Files (*.mp3 *.wav *.ogg *.m4a *.flac)");
    if (file.isEmpty()) return QString();
    return QUrl::fromLocalFile(file).toString();
}

// Helper function to find Python executable
QString findPython()
{
    QStringList possiblePythonPaths = {
        "python", "python3", "py",
        "C:/Python313/python.exe",
        "C:/Program Files/Python313/python.exe",
        "C:/Users/" + QStandardPaths::writableLocation(QStandardPaths::HomeLocation).section("/", -1) + 
            "/AppData/Local/Programs/Python/Python313/python.exe"
    };
    
    QString pythonExe;
    for (const QString &path : possiblePythonPaths) {
        QProcess process;
        process.start(path, QStringList() << "--version");
        if (process.waitForFinished(1000) && process.exitCode() == 0) {
            pythonExe = path;
            break;
        }
    }
    
    return pythonExe;
}

void AlarmAPI::announceTasks()
{
    qDebug() << "Announcing tasks...";
    
    // Load tasks from JSON file
    QFile file("tasks.json");
    if (!file.open(QIODevice::ReadOnly)) {
        qWarning() << "Could not open tasks.json";
        QMessageBox::warning(nullptr, "Error", "Could not load tasks.json file");
        return;
    }
    
    QByteArray data = file.readAll();
    file.close();
    
    QJsonDocument doc = QJsonDocument::fromJson(data);
    if (doc.isNull()) {
        qWarning() << "Invalid JSON in tasks.json";
        QMessageBox::warning(nullptr, "Error", "Invalid JSON format in tasks.json");
        return;
    }
    
    QJsonArray tasks = doc.array();
    
    // Filter pending tasks
    QStringList pendingTasks;
    for (const QJsonValue &value : tasks) {
        QJsonObject task = value.toObject();
        if (!task["completed"].toBool()) {
            pendingTasks.append(task["description"].toString());
        }
    }
    
    if (pendingTasks.isEmpty()) {
        qDebug() << "No pending tasks to announce";
        QMessageBox::information(nullptr, "Info", "No pending tasks to announce");
        return;
    }
    
    // Create announcement text
    QString announcement;
    if (pendingTasks.size() == 1) {
        announcement = "You have one pending task: " + pendingTasks.first();
    } else {
        announcement = "You have " + QString::number(pendingTasks.size()) + 
                      " pending tasks: " + pendingTasks.join(", ");
    }
    
    qDebug() << "Announcement:" << announcement;
    
    // Try to find Python
    QString pythonExe = findPython();
    if (pythonExe.isEmpty()) {
        qWarning() << "Python not found!";
        QMessageBox::warning(nullptr, "Error", "Python not found. Please install Python.");
        return;
    }
    
    // Create a temporary Python script for TTS
    QTemporaryFile tempFile;
    if (tempFile.open()) {
        QString ttsScript = 
            "import sys\n"
            "text = sys.argv[1]\n"
            "print(f\"Announcing: {text}\")\n"
            "try:\n"
            "    # Try to use pyttsx3 for TTS\n"
            "    import pyttsx3\n"
            "    engine = pyttsx3.init()\n"
            "    engine.say(text)\n"
            "    engine.runAndWait()\n"
            "except ImportError:\n"
            "    # Fallback to platform-specific TTS\n"
            "    import os\n"
            "    if sys.platform == 'darwin':  # macOS\n"
            "        os.system('say ' + repr(text))\n"
            "    elif sys.platform == 'linux':  # Linux\n"
            "        os.system('spd-say ' + repr(text))\n"
            "    elif sys.platform == 'win32':  # Windows\n"
            "        try:\n"
            "            import comtypes.client\n"
            "            speaker = comtypes.client.CreateObject('SAPI.SpVoice')\n"
            "            speaker.Speak(text)\n"
            "        except:\n"
            "            print('\\a')  # Fallback to system beep\n"
            "            import winsound\n"
            "            winsound.Beep(1000, 1000)\n";
        
        tempFile.write(ttsScript.toUtf8());
        tempFile.close();
        
        // Execute the Python script with the announcement text
        QProcess *process = new QProcess(this);
        process->start(pythonExe, QStringList() << tempFile.fileName() << announcement);
        
        connect(process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
                [process](int exitCode, QProcess::ExitStatus exitStatus) {
                    process->deleteLater();
                    qDebug() << "TTS process finished with code:" << exitCode;
                });
    }
}

void AlarmAPI::openTodoDashboard()
{
    qDebug() << "Opening todo dashboard...";
    
    QString pythonExe = findPython();
    if (pythonExe.isEmpty()) {
        qWarning() << "Python not found!";
        QMessageBox::warning(nullptr, "Error", "Python not found. Please install Python.");
        return;
    }
    
    QString scriptPath = QDir(QCoreApplication::applicationDirPath()).filePath("todo_dashboard.py");
    
    if (!QFile::exists(scriptPath)) {
        qWarning() << "Todo dashboard script not found at:" << scriptPath;
        QMessageBox::warning(nullptr, "Error", "Todo dashboard script not found.");
        return;
    }
    
    QProcess::startDetached(pythonExe, QStringList() << scriptPath);
}

void AlarmAPI::playMusic(const QString &source, const QString &type)
{
    qDebug() << "Playing music:" << type << source;
    
    QString pythonExe = findPython();
    if (pythonExe.isEmpty()) {
        qWarning() << "Python not found!";
        QMessageBox::warning(nullptr, "Error", "Python not found. Please install Python.");
        return;
    }
    
    QString scriptPath = QDir(QCoreApplication::applicationDirPath()).filePath("music_player.py");
    
    if (!QFile::exists(scriptPath)) {
        qWarning() << "Music player script not found at:" << scriptPath;
        QMessageBox::warning(nullptr, "Error", "Music player script not found.");
        return;
    }
    
    if (type == "local") {
        QString filePath = QUrl(source).toLocalFile();
        QProcess::startDetached(pythonExe, QStringList() << scriptPath << type << filePath);
    } else {
        QProcess::startDetached(pythonExe, QStringList() << scriptPath << type << source);
    }
}

QString AlarmAPI::getSpotifyAuthUrl()
{
    // Placeholder - in a real implementation, this would connect to Spotify's API
    return "https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=your-app://callback";
}

bool AlarmAPI::handleSpotifyCallback(const QUrl &callbackUrl)
{
    // Handle the OAuth callback from Spotify
    QString urlStr = callbackUrl.toString();
    if (urlStr.contains("code=")) {
        QMessageBox::information(nullptr, "Success", "Successfully connected to Spotify!");
        return true;
    }
    QMessageBox::warning(nullptr, "Error", "Failed to connect to Spotify");
    return false;
}

void AlarmAPI::onEngineAlarmFired(int index)
{
    // Get the alarm before it's removed
    const auto& alarms = m_engine->getAlarms();
    if(index >= 0 && index < static_cast<int>(alarms.size())) {
        const Alarm& alarm = alarms[index];
        QJsonObject obj;
        obj["hour"] = alarm.getHour();
        obj["minute"] = alarm.getMinute();
        obj["label"] = QString::fromStdString(alarm.getLabel());
        emit alarmTriggered(QString(QJsonDocument(obj).toJson(QJsonDocument::Compact)));
        
        // Announce tasks when alarm fires
        announceTasks();
    }
}