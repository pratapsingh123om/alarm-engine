# 📘 Project Best Practices

## 1. Project Purpose
Awakure is a desktop alarm application that helps users wake up intentionally by combining a quick cognitive nudge and a spoken rundown of morning to‑dos. It is built primarily in C++17 using Qt Widgets, with an embedded modern Web UI (HTML/CSS/JavaScript) rendered via Qt WebEngine and connected to C++ through Qt WebChannel. Optional Text‑to‑Speech (TTS) reads tasks when an alarm fires or on demand.

## 2. Project Structure
- Root
  - CMakeLists.txt: Primary build configuration. Options: BUILD_TESTS, ENABLE_WEB_UI, ENABLE_TTS. Supports Qt5.15+ and Qt6.
  - README.md: Overview, build instructions, and architecture summary.
  - best_practices.md: This document.
  - requirements.txt: Python dependencies (for optional utilities/integrations). Prefer this over the misspelled duplicate.
  - requirments.txt: Duplicate/misspelled; avoid adding here.
  - build/: Out‑of‑source build directory (generated).
  - venv/: Optional Python virtual environment (not required for C++ build).
- assets/
  - fonts/: Application fonts (e.g., Lexend).
  - icons/: Application icons (e.g., awakure_icon.png).
  - web/: Embedded Web UI (index.html, style.css, app.js). Loaded via Qt resource system (qrc aliases under src/gui/resources.qrc).
- src/
  - main.cpp: Qt application entry point; loads font, sets window metadata, shows MainWindow.
  - gui/
    - MainWindow.[hpp|cpp]: Hosts QWebEngineView (when available) and sets up QWebChannel.
    - Bridge.[hpp|cpp]: QObject exposed to JavaScript via WebChannel. Manages in‑memory alarms/tasks, signals, timers, and TTS.
    - resources.qrc: Resource collection mapping assets (web, fonts, icons) into the binary with aliases (e.g., qrc:/web/index.html).
  - todo/
    - Task.[hpp|cpp], ToDoList.[hpp|cpp]: Simple domain models for tasks (C++ std types). Currently not wired into the Web UI bridge.
  - Alarm.[hpp|cpp], AlarmEngine.[hpp|cpp]: Simple alarm domain models using std containers.
  - WakeTask.[hpp|cpp]: Prototype for a cognitive wake task (CLI math puzzle).
  - py/: Experimental/legacy Python utilities colocated; prefer top‑level py/.
- tests/
  - main.cpp: TestSprite test runner using a QApplication for WebEngine.
  - BridgeTests.cpp: Unit tests for Bridge API and signals.
  - WebUITests.cpp: Integration tests for WebEngine/WebChannel and UI presence.
  - README.md: Test guidance and CI hints.
- test/
  - preview.html, app.js, style.css: Standalone browser preview of the Web UI (no C++ required; uses Web Speech API where applicable).
- py/
  - streaming_api.py: Optional Spotify integration via spotipy (requires SPOTIFY_CLIENT_ID/SECRET).
  - alarm_interface.py: Placeholder for future Python integrations.

## 3. Test Strategy
- Framework: TestSprite for C++ tests; QtTest helpers (QSignalSpy), and Qt WebEngine components for integration coverage.
- Organization:
  - All C++ tests live under tests/.
  - Test runner in tests/main.cpp registers suites by name.
  - Unit tests: BridgeTests.cpp (logic, signal emissions, boundary checks).
  - Integration tests: WebUITests.cpp (page load, WebChannel connectivity, JS invocations, UI elements, CSS presence).
- Conventions:
  - Name suites <Feature>TestSuite and register with TEST_SUITE_REGISTRATION.
  - Use QSignalSpy for signal assertions; prefer explicit counts and content checks.
  - For async operations (page load, JS eval), wrap with QEventLoop and timeouts (QTimer::singleShot) to avoid hangs.
  - Keep tests deterministic; avoid relying on wall‑clock time when possible.
- Build toggle:
  - BUILD_TESTS ON by default; tests only built if TestSprite is found. CI should ensure availability via vcpkg or system install.
- Mocking/Isolation:
  - Prefer real Bridge with minimal environment; for WebEngine tests, use a dedicated QWebEngineProfile with NoCache.
  - TTS: Use HAVE_TTS and a real QTextToSpeech instance where possible; tests assert no crashes rather than audio output.
- Unit vs Integration:
  - Unit: Validate Bridge API shape, error handling, and signal emission with no WebEngine.
  - Integration: Validate WebChannel wiring, resource loading, and JS ↔ C++ interoperability.

## 4. Code Style
- Language & Standards:
  - C++17. Enable CMAKE_AUTOMOC/AUTORCC/AUTOUIC. Prefer const correctness, early returns, RAII, and Qt parent‑child ownership for QObjects.
- Qt Patterns:
  - Use QObject, signals/slots, and Q_INVOKABLE to expose methods to JS via WebChannel.
  - Prefer QString/QVariant for bridge boundaries; convert to std types only in domain layers.
  - Emit signals immediately after state changes to keep UI consistent.
- Naming:
  - Classes: PascalCase (MainWindow, Bridge, AlarmEngine).
  - Methods/variables: lowerCamelCase (addAlarm, alarmTimers).
  - Files: Match class names (Bridge.hpp/cpp), resources via qrc aliases (web/index.html).
- Error Handling & Logging:
  - Use qWarning/qDebug for recoverable issues (invalid inputs, missing TTS). Avoid throwing exceptions in Qt event‑driven code paths.
  - Validate inputs at boundaries (e.g., hour/minute ranges, index bounds).
- Memory Management:
  - Give QObjects a parent where possible; rely on Qt ownership. For container‑held QTimers, parent them to the Bridge and manage lifecycle carefully (stop/deleteLater on rebuild).
- Threading:
  - Keep Bridge interactions on the GUI thread. Avoid blocking calls in slots. If background work is needed, use QThread or QtConcurrent and marshal back to the main thread for UI updates.
- Web UI Integration:
  - Keep WebChannel object name stable ("bridge"). Use QVariantMap/QVariantList with stable keys that match UI expectations (e.g., { hour, minute, label } for alarms; { text } for tasks).
  - Access the channel via qrc:///qtwebchannel/qwebchannel.js in HTML.
- Documentation:
  - Keep concise comments explaining non‑obvious logic (e.g., next‑day rescheduling math). Prefer self‑documenting names.

## 5. Common Patterns
- Bridge Pattern for JS ↔ C++:
  - Expose a single Bridge QObject to the web layer; keep UI‑facing data in QVariant containers.
- Timer‑based Scheduling:
  - Use QTimer single shots for next occurrence and re‑arm for +24h in timeout handlers.
- Feature Flags via Compile Definitions:
  - HAVE_TTS and HAVE_WEB_UI set by CMake based on discovered Qt modules. Use #ifdef guards in code.
- Resource Management:
  - Load assets via qrc aliases. Keep resources.qrc authoritative for web, fonts, and icons.
- Signal‑First UI Updates:
  - After mutating state (add/delete), construct QVariantList snapshots and emit alarmsUpdated/tasksUpdated.

## 6. Do's and Don'ts
- ✅ Do
  - Validate all external inputs (hour/minute ranges, list indices).
  - Keep Bridge API stable; maintain backward‑compatible QVariant key shapes expected by app.js.
  - Parent all QObjects; stop and deleteLater timers when rescheduling.
  - Use qrc aliases to reference web assets and icons from C++ and HTML.
  - Gate optional features with CMake options and compile definitions.
  - Write tests for new Bridge methods (unit) and any WebChannel surface change (integration).
  - Keep Python utilities optional and isolated; document environment variables.
  - Prefer requirements.txt for Python deps; keep it in sync.
- ❌ Don’t
  - Block the GUI thread (avoid long I/O or sleep in slots).
  - Introduce breaking changes to signal signatures or bridge method names without updating UI and tests.
  - Mix std::string with QString at boundaries without explicit conversion.
  - Reference filesystem paths directly from the web UI; use qrc aliases.
  - Commit secrets; rely on environment variables for credentials (e.g., Spotify).

## 7. Tools & Dependencies
- C++/Qt
  - Qt Widgets (core UI), WebEngineWidgets + WebChannel (embedded web), TextToSpeech (optional).
  - CMake options:
    - ENABLE_WEB_UI: Controls WebEngine/WebChannel usage and HAVE_WEB_UI.
    - ENABLE_TTS: Controls TextToSpeech usage and HAVE_TTS.
    - BUILD_TESTS: Builds tests only if TestSprite is found.
  - Build examples (Windows):
    - cmake -S . -B build -G "Ninja" -DCMAKE_PREFIX_PATH="C:/Qt/6.x/msvcXXXX_64"
    - cmake --build build --config Release
- Testing
  - TestSprite via vcpkg or system install (see tests/README.md). Uses QApplication for WebEngine tests.
- Web UI
  - Static HTML/CSS/JS under assets/web; included in qrc and loaded via qrc:/web/index.html.
- Python (optional)
  - spotipy in py/streaming_api.py for Spotify integration.
  - Environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET.
  - Prefer a virtual environment and requirements.txt; do not rely on requirments.txt.

## 8. Other Notes
- For LLM‑generated code
  - Preserve Bridge method names, signal signatures, and data shapes used by assets/web/app.js.
  - If adding new fields to alarms/tasks, version them or provide defaults to avoid breaking existing UI code.
  - When adding new resources, update src/gui/resources.qrc and reference via qrc aliases.
  - Maintain compatibility with both Qt5.15+ and Qt6 (avoid using APIs not available in Qt5 unless guarded).
  - In tests, prefer deterministic timing and bounded waits; avoid depending on real time passing for alarm triggers.
  - Keep separation between UI glue (Bridge, WebChannel, qrc) and domain models (Alarm, AlarmEngine, ToDoList). Consider gradual integration of domain models behind the Bridge to unify logic.
