# Graph Report - .  (2026-06-18)

## Corpus Check
- 34 files · ~50,008 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 136 nodes · 167 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Pygame To-Do Dashboard|Pygame To-Do Dashboard]]
- [[_COMMUNITY_Qt Alarm API Bridge|Qt Alarm API Bridge]]
- [[_COMMUNITY_Qt Alarm Engine Manager|Qt Alarm Engine Manager]]
- [[_COMMUNITY_C++ Alarm API Implementation|C++ Alarm API Implementation]]
- [[_COMMUNITY_Project Documents and Concepts|Project Documents and Concepts]]
- [[_COMMUNITY_C++ Alarm Data Model|C++ Alarm Data Model]]
- [[_COMMUNITY_MainWindow Interface Definition|MainWindow Interface Definition]]
- [[_COMMUNITY_C++ Alarm Engine Logic|C++ Alarm Engine Logic]]
- [[_COMMUNITY_Python Music Player Script|Python Music Player Script]]
- [[_COMMUNITY_HTML Web App Logic|HTML Web App Logic]]
- [[_COMMUNITY_C++ MainWindow GUI Implementation|C++ MainWindow GUI Implementation]]
- [[_COMMUNITY_WakeTask Console Puzzle Interface|WakeTask Console Puzzle Interface]]

## God Nodes (most connected - your core abstractions)
1. `AlarmAPI` - 18 edges
2. `AlarmEngine` - 18 edges
3. `TodoDashboard` - 14 edges
4. `QString` - 10 edges
5. `Alarm` - 8 edges
6. `getAlarms12Hour()` - 5 edges
7. `findPython()` - 5 edges
8. `MainWindow` - 5 edges
9. `Best Practices Guidelines` - 5 edges
10. `getAlarms()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Best Practices Guidelines` --references--> `Awakure Overview`  [EXTRACTED]
  best_practices.md → README.md
- `Embedded HTML View` --references--> `Qt WebChannel Communication`  [INFERRED]
  src/html/index.html → best_practices.md
- `Legacy Web UI` --references--> `Qt WebChannel Communication`  [INFERRED]
  assets/web/index.html → best_practices.md
- `Awakure Overview` --references--> `CMake Build Configuration`  [EXTRACTED]
  README.md → CMakeLists.txt

## Import Cycles
- None detected.

## Communities (19 total, 3 thin omitted)

### Community 0 - "Pygame To-Do Dashboard"
Cohesion: 0.15
Nodes (7): Handle Pygame events and return whether to continue running, Draw the dashboard interface, Run the GUI version of the dashboard, Run the console version of the dashboard, Initialize Pygame with proper settings, Try to bring the Pygame window to the front, TodoDashboard

### Community 1 - "Qt Alarm API Bridge"
Cohesion: 0.12
Nodes (18): QObject, addAlarm, alarmTriggered, announceTasks, deleteAlarm, getAlarms, getAlarms12Hour, getSpotifyAuthUrl (+10 more)

### Community 2 - "Qt Alarm Engine Manager"
Cohesion: 0.14
Nodes (17): Alarm, addAlarm, alarmFired, checkAlarms, deleteAlarm, m_alarms, m_audioOutput, m_player (+9 more)

### Community 3 - "C++ Alarm API Implementation"
Cohesion: 0.26
Nodes (16): QString, QUrl, addAlarm(), announceTasks(), QObject, AlarmAPI(), deleteAlarm(), findPython() (+8 more)

### Community 4 - "Project Documents and Concepts"
Cohesion: 0.22
Nodes (9): Legacy Web UI, Best Practices Guidelines, CMake Build Configuration, Qt WebChannel Communication, Spotify Music Integration, To-Do Task Management, Text-To-Speech Announcements, Embedded HTML View (+1 more)

### Community 5 - "C++ Alarm Data Model"
Cohesion: 0.28
Nodes (5): Alarm, hour, label, minute, string

### Community 6 - "MainWindow Interface Definition"
Cohesion: 0.29
Nodes (4): QMainWindow, Q_OBJECT, MainWindow, public

### Community 7 - "C++ Alarm Engine Logic"
Cohesion: 0.32
Nodes (6): addAlarm(), checkAlarms(), QObject, AlarmEngine(), string, playAlarmSound()

### Community 8 - "Python Music Player Script"
Cohesion: 0.40
Nodes (4): play_local_file(), play_spotify(), Play a Spotify URI (requires Spotify app to be installed and running), Play a local audio file using available players

## Knowledge Gaps
- **41 isolated node(s):** `hour`, `minute`, `label`, `QObject`, `Q_OBJECT` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AlarmEngine` connect `Qt Alarm Engine Manager` to `Qt Alarm API Bridge`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `QString` connect `C++ Alarm API Implementation` to `Qt Alarm API Bridge`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `hour`, `minute`, `label` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pygame To-Do Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.14761904761904762 - nodes in this community are weakly interconnected._
- **Should `Qt Alarm API Bridge` be split into smaller, more focused modules?**
  _Cohesion score 0.11695906432748537 - nodes in this community are weakly interconnected._
- **Should `Qt Alarm Engine Manager` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._