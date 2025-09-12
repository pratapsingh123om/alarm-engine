@echo off
echo Deploying alarm-engine application...

REM Change to the build directory
cd C:\Users\gsr33\alarm-engine\alarm-engine\build\bin\Release

REM Run windeployqt to copy Qt dependencies
C:\Qt\6.7.3\msvc2022_64\bin\windeployqt.exe alarm-engine.exe

REM Create necessary directories
mkdir html
mkdir resources
mkdir translations
mkdir plugins

REM Copy web files
copy C:\Users\gsr33\alarm-engine\alarm-engine\src\html\index.html html\
copy C:\Users\gsr33\alarm-engine\alarm-engine\src\html\app.js html\
copy C:\Users\gsr33\alarm-engine\alarm-engine\src\html\style.css html\

REM Copy Python files
copy C:\Users\gsr33\alarm-engine\alarm-engine\src\todo_dashboard.py .
copy C:\Users\gsr33\alarm-engine\alarm-engine\requirements.txt .

REM Copy Qt resources
xcopy /E C:\Qt\6.7.3\msvc2022_64\resources\* resources\
xcopy /E C:\Qt\6.7.3\msvc2022_64\translations\qtwebengine_locales\* translations\qtwebengine_locales\
xcopy /E C:\Qt\6.7.3\msvc2022_64\plugins\multimedia\* plugins\multimedia\

echo Deployment complete!
pause