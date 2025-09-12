#include "MainWindow.hpp"
#include "AlarmAPI.hpp"
#include <QWebEngineView>
#include <QWebChannel>
#include <QVBoxLayout>
#include <QCoreApplication>
#include <QDir>
#include <QWidget>
#include <QDebug>
#include <QMessageBox>
#include <QIcon>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Set window icon
    QString iconPath = QDir(QCoreApplication::applicationDirPath()).filePath("assets/icons/awakure_icon.png");
    if (QFile::exists(iconPath)) {
        setWindowIcon(QIcon(iconPath));
        qDebug() << "Window icon set from:" << iconPath;
    } else {
        qWarning() << "Icon file not found at:" << iconPath;
    }
    
    QWidget *central = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(central);

    QWebEngineView *view = new QWebEngineView(this);

    // Setup web channel and API
    QWebChannel *channel = new QWebChannel(view->page());
    AlarmAPI *api = new AlarmAPI(this);
    
    // Debug output
    qDebug() << "Creating QWebChannel and AlarmAPI";
    
    channel->registerObject(QStringLiteral("alarmAPI"), api);
    view->page()->setWebChannel(channel);

    // Load local html with better error handling
    QString path = QDir(QCoreApplication::applicationDirPath()).filePath("html/index.html");
    QFileInfo fileInfo(path);
    
    if (fileInfo.exists()) {
        view->setUrl(QUrl::fromLocalFile(path));
        qDebug() << "Loading HTML from:" << path;
        
        // Connect to load finished signal to debug
        connect(view, &QWebEngineView::loadFinished, [this, view, api](bool success) {
            if (success) {
                qDebug() << "Page loaded successfully";
                
                // Test the API connection
                view->page()->runJavaScript("console.log('Testing API connection...');");
                view->page()->runJavaScript("if(typeof alarmAPI !== 'undefined') { console.log('alarmAPI is defined'); } else { console.log('alarmAPI is NOT defined'); }");
                
                // Test a simple method
                view->page()->runJavaScript("if(alarmAPI && typeof alarmAPI.getAlarms === 'function') { console.log('getAlarms function exists'); } else { console.log('getAlarms function does NOT exist'); }");
            } else {
                qWarning() << "Page failed to load";
            }
        });
    } else {
        qWarning() << "HTML file not found at:" << path;
        // Create a simple error page
        QString errorHtml = R"(
            <html><body>
                <h1>Error: HTML Files Not Found</h1>
                <p>Could not find the interface files at: )" + path + R"(</p>
                <p>Please make sure the 'html' directory exists with index.html, app.js, and style.css</p>
            </body></html>)";
        view->setHtml(errorHtml);
    }

    layout->addWidget(view);
    central->setLayout(layout);
    setCentralWidget(central);
    resize(1000, 700);
    setWindowTitle("Awakure Alarm");
}