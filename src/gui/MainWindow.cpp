#include "MainWindow.hpp"
#include "Bridge.hpp"
#include <QUrl>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent),
      tts(new QTextToSpeech(this)),
      webView(new QWebEngineView(this)),
      webChannel(new QWebChannel(this))
{
    // Use a web view as the central widget
    setCentralWidget(webView);

    // Bridge will be created and registered here after class is implemented
    // Create bridge and register to channel
    Bridge *bridge = new Bridge(this);
    bridge->setTts(tts);
    webChannel->registerObject("bridge", bridge);
    webView->page()->setWebChannel(webChannel);

    // Load the web UI from resources
    webView->setUrl(QUrl("qrc:/web/index.html"));
}

MainWindow::~MainWindow() = default;
 
