cmake_minimum_required(VERSION 3.16)
project(alarm-engine)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_CXX_STANDARD 17)

# Support both Qt6 and Qt5
find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Widgets Multimedia TextToSpeech WebEngineWidgets WebChannel)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Widgets Multimedia TextToSpeech WebEngineWidgets WebChannel)

add_executable(alarm-engine
    src/main.cpp
    src/gui/MainWindow.cpp
    src/gui/MainWindow.hpp
    src/gui/resources.qrc
    src/gui/Bridge.cpp
    src/gui/Bridge.hpp
)

target_link_libraries(alarm-engine PRIVATE
    Qt${QT_VERSION_MAJOR}::Widgets
    Qt${QT_VERSION_MAJOR}::Multimedia
    Qt${QT_VERSION_MAJOR}::TextToSpeech
    Qt${QT_VERSION_MAJOR}::WebEngineWidgets
    Qt${QT_VERSION_MAJOR}::WebChannel
)
