cmake_minimum_required(VERSION 3.21)
project(alarm-engine LANGUAGES CXX)

# Set Qt path
set(CMAKE_PREFIX_PATH "C:/Qt/6.7.3/msvc2022_64")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable Qt auto features
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)

# Find Qt components
find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets WebEngineWidgets WebChannel PrintSupport Multimedia)

# List all source files
file(GLOB SOURCES "src/*.cpp")
file(GLOB HEADERS "src/*.hpp")
file(GLOB UI_FILES "src/*.ui")

# Create executable
add_executable(${PROJECT_NAME}
    ${SOURCES}
    ${HEADERS}
    ${UI_FILES}
)

# Link Qt libraries
target_link_libraries(${PROJECT_NAME} PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Widgets
    Qt6::WebEngineWidgets
    Qt6::WebChannel
    Qt6::PrintSupport
    Qt6::Multimedia
)

# Copy web resources - SIMPLIFIED VERSION
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    # Create directories
    COMMAND ${CMAKE_COMMAND} -E make_directory "$<TARGET_FILE_DIR:${PROJECT_NAME}>/html"
    
    # Copy essential web files
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/src/html/index.html" "$<TARGET_FILE_DIR:${PROJECT_NAME}>/html/"
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/src/html/app.js" "$<TARGET_FILE_DIR:${PROJECT_NAME}>/html/"
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/src/html/style.css" "$<TARGET_FILE_DIR:${PROJECT_NAME}>/html/"
    
    # Copy Python scripts
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/src/todo_dashboard.py" "$<TARGET_FILE_DIR:${PROJECT_NAME}>/"
    COMMAND ${CMAKE_COMMAND} -E copy "${CMAKE_SOURCE_DIR}/src/music_player.py" "$<TARGET_FILE_DIR:${PROJECT_NAME}>/"
    
    COMMENT "Copying essential application resources..."
)

# Set output directory
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Create a custom target to copy additional files manually if needed
add_custom_target(copy-resources-manually
    COMMAND ${CMAKE_COMMAND} -E echo "Manual resource copying completed"
    COMMENT "Use this target for manual resource copying if needed"
)