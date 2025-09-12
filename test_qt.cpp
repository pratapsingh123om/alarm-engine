#include <QApplication>
#include <QMainWindow>
#include <QLabel>
#include <QVBoxLayout>
#include <QPushButton>
#include <QMessageBox>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    
    QMainWindow window;
    window.setWindowTitle("Qt Test - Basic Functionality");
    window.resize(400, 300);
    
    QWidget *centralWidget = new QWidget(&window);
    window.setCentralWidget(centralWidget);
    
    QVBoxLayout *layout = new QVBoxLayout(centralWidget);
    
    QLabel *titleLabel = new QLabel("Qt Basic Test", centralWidget);
    titleLabel->setAlignment(Qt::AlignCenter);
    titleLabel->setStyleSheet("font-size: 24px; font-weight: bold; margin: 20px;");
    layout->addWidget(titleLabel);
    
    QLabel *statusLabel = new QLabel("Testing basic Qt functionality...", centralWidget);
    statusLabel->setAlignment(Qt::AlignCenter);
    statusLabel->setStyleSheet("font-size: 14px; margin: 20px; color: #666;");
    layout->addWidget(statusLabel);
    
    QPushButton *testButton = new QPushButton("Test Button", centralWidget);
    testButton->setStyleSheet("font-size: 16px; padding: 10px; margin: 20px;");
    layout->addWidget(testButton);
    
    QPushButton *quitButton = new QPushButton("Quit", centralWidget);
    quitButton->setStyleSheet("font-size: 16px; padding: 10px; margin: 20px; background-color: #dc3545; color: white;");
    layout->addWidget(quitButton);
    
    // Connect signals
    connect(testButton, &QPushButton::clicked, [&statusLabel]() {
        statusLabel->setText("Button clicked! Qt is working!");
        statusLabel->setStyleSheet("font-size: 14px; margin: 20px; color: #28a745;");
    });
    
    connect(quitButton, &QPushButton::clicked, &app, &QApplication::quit);
    
    layout->addStretch();
    
    window.show();
    
    return app.exec();
} 