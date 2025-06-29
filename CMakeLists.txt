cmake_minimum_required(VERSION 3.10)
project(AlarmEngine)

set(CMAKE_CXX_STANDARD 17)

include_directories(src)

file(GLOB SOURCES "src/*.cpp")

add_executable(alarm-engine ${SOURCES})
