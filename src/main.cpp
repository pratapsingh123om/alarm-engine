#include "MainWindow.hpp"
#include <QApplication>
#include <QFontDatabase>
#include <QIcon>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    // Optional: load font (ensure correct path in resources)
    QFontDatabase::addApplicationFont(":/../../assets/fonts/Lexend-VariableFont_wght.ttf");

    MainWindow w;
    w.setWindowTitle("Awakure Alarm");
    w.setWindowIcon(QIcon(":/../../assets/icons/awakure_icon.png"));
    w.show();

    return app.exec();
}
