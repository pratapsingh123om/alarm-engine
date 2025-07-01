#include "MainWindow.hpp"
#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    // Optional: load font
    QFontDatabase::addApplicationFont(":/../../assets/fonts/Lexend-Regular.ttf");
    QApplication::setFont(QFont("Lexend", 10));

    MainWindow w;
    w.setWindowTitle("Awakure Alarm");
    w.setWindowIcon(QIcon(":/../../assets/icons/awakure_icon.png"));
    w.show();

    return app.exec();
}
