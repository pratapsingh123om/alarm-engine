cmake_minimum_required(VERSION 3.16)
project(alarm-engine)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_CXX_STANDARD 17)

find_package(Qt5 COMPONENTS Widgets Multimedia TextToSpeech REQUIRED)

add_executable(alarm-engine
    src/main.cpp
    src/gui/MainWindow.cpp
    src/gui/MainWindow.hpp
    src/gui/MainWindow.ui
    src/gui/resources.qrc
)

target_link_libraries(alarm-engine PRIVATE
    Qt5::Widgets
    Qt5::Multimedia
    Qt5::TextToSpeech
)
