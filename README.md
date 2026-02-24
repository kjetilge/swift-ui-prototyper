# swift-ui-prototyper

Claude Code plugin for generating SwiftUI prototypes with stub data for PRD documentation.

## Why This Plugin?

When creating PRDs for macOS/iOS apps, you need:
- **High-quality mockups** that accurately represent the design
- **Reusable code** that can be copied to production
- **Multiple UI states** visualized (empty, loading, error, active)
- **Fast iteration** from natural language to screenshot

This plugin generates SwiftUI code with automatic stub data, builds it on iPad Pro simulator, and captures high-resolution screenshots for documentation.

## Quick Start

```bash
# Use plugin with Claude Code CLI
claude --plugin-dir ~/Developer/claude-plugins/swift-ui-prototyper

# Or symlink for Cowork
ln -sf ~/Developer/claude-plugins/swift-ui-prototyper ~/.claude/plugins/swift-ui-prototyper
```

Then in your project:

```
/prototype Task list with sidebar navigation, search field, and priority badges
```

## Features

- **Natural language to SwiftUI**: Describe UI, get working code
- **Mini-Storybook pattern**: Multiple `#Preview` macros for each UI state
- **High-resolution output**: 2752x1892 pixel screenshots (iPad Pro 13")
- **Cowork live preview**: Real-time preview in embedded browser
- **Responsive design**: Apps support all orientations
- **Design system support**: Optional custom colors, typography, spacing
- **Production-ready code**: Copy directly to your app

## Skills

### prototype-generator

Generate SwiftUI prototypes with stub data.

**Activation:** `/prototype`, "lag prototype", "mockup", "UI-skisse"

```
/prototype Task list with sidebar navigation, search, and priority badges
```

**Creates:**
- `Views/TaskListView.swift` - SwiftUI implementation
- `Stubs/TaskStubs.swift` - Data for empty, single, typical, many states
- Multiple `#Preview` macros for each state
- Navigation entry in `ContentView.swift`
- Screenshots in `docs/mockups/`

### design-system-creator

Create custom design systems from reference images or text descriptions.

**Activation:** `/design-system`, "design system", "extract colors from"

```
/design-system professional dark theme for video editing app
```

Or attach a screenshot:

```
/design-system [attach screenshot of DaVinci Resolve]
```

**Creates:**
- `DesignSystem.swift` with colors, typography, spacing constants
- View extensions for common patterns
- Consistent styling across all prototypes

## Project Structure

The plugin creates this structure in your project:

```
your-project/
├── swift-ui-prototype/
│   ├── swift-ui-prototype.xcodeproj/   # iOS/iPadOS target
│   ├── Info.plist                       # All orientations (responsive)
│   ├── App.swift
│   ├── ContentView.swift                # Sidebar navigation
│   ├── DesignSystem.swift               # Optional: custom styling
│   ├── Views/
│   │   └── TaskListView.swift
│   └── Stubs/
│       └── TaskStubs.swift
└── docs/
    └── mockups/
        ├── tasks-empty.jpg
        ├── tasks-typical.jpg
        └── tasks-many.jpg
```

## Screenshot Workflow

Uses XcodeBuildMCP with iPad Pro 13" simulator:

### Simulator Setup (for macOS-style apps)

1. Move simulator to external display (iPad Pro 13" is large)
2. Use "Fit Screen" (Window menu) for full visibility
3. Rotate to landscape (Device → Rotate Right)

### Quick Screenshots (800x600)

```
boot_sim()           → Start iPad Pro simulator
build_run_sim()      → Build and launch app
screenshot()         → Capture current screen
```

### High-Resolution Screenshots (2752x1892)

For production-quality screenshots without iPad chrome:

```bash
# 1. Capture raw screenshot
xcrun simctl io booted screenshot /tmp/raw.png --type png

# 2. Process with included script
python3 scripts/process_ipad_screenshot.py /tmp/raw.png docs/mockups/screen.jpg
```

The script:
- Rotates from portrait framebuffer to landscape
- Crops status bar (top 130px) and home indicator (bottom 42px)
- Outputs clean 2752x1892 pixel JPEG

## Mini-Storybook Pattern

Each view includes multiple preview states:

```swift
#Preview("Empty") {
    TaskListView(tasks: TaskStubs.empty)
        .frame(width: 900, height: 600)
}

#Preview("Typical") {
    TaskListView(tasks: TaskStubs.typical)
        .frame(width: 900, height: 600)
}

#Preview("Many Items") {
    TaskListView(tasks: TaskStubs.many)
        .frame(width: 900, height: 600)
}
```

Benefits:
- Visualize all UI states in Xcode previews
- Export screenshots for each state
- Test edge cases (empty, error, overflow)
- Document expected data structures

## Design System Example

```swift
// DesignSystem.swift
enum DesignSystem {
    enum Colors {
        static let backgroundPrimary = Color(white: 0.12)
        static let backgroundSecondary = Color(white: 0.18)
        static let textPrimary = Color(white: 0.95)
        static let textSecondary = Color(white: 0.6)
        static let accent = Color.blue
    }

    enum Spacing {
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
    }
}

// TaskListView.swift
Text("Oppgaver")
    .foregroundStyle(DesignSystem.Colors.textPrimary)
    .padding(DesignSystem.Spacing.medium)
    .background(DesignSystem.Colors.backgroundPrimary)
```

## Cowork Live Preview

For real-time preview in Claude Cowork's embedded browser:

### Setup

1. Copy the preview server to your prototype folder:
   ```bash
   cp scripts/preview-server.js your-project/swift-ui-prototype/
   ```

2. Create `.claude/launch.json` in the prototype folder:
   ```json
   {
     "version": "0.0.1",
     "autoVerify": true,
     "configurations": [
       {
         "name": "SwiftUI Preview",
         "runtimeExecutable": "node",
         "runtimeArgs": ["preview-server.js"],
         "port": 3000
       }
     ]
   }
   ```

3. Boot the iPad Pro simulator before opening the project in Cowork.

### How It Works

```
Edit Swift file → Server detects change → xcodebuild → screenshot → Browser refreshes
```

The preview server:
- Watches Views/ and Stubs/ for `.swift` file changes
- Triggers incremental builds via xcodebuild
- Captures simulator screenshots automatically
- Serves an auto-refreshing HTML page (every 2 seconds)
- Shows build status (ready/building/error)

### Preview Server API

| Endpoint | Description |
|----------|-------------|
| `/` | HTML preview page |
| `/screenshot.png` | Latest screenshot |
| `/api/status` | Build status JSON |
| `/api/rebuild` | Trigger manual rebuild |

No npm dependencies required - uses only Node.js built-in modules.

## Requirements

- macOS 14.0+ (Sonoma)
- Xcode 15+
- iOS 17.0+ SDK
- Swift 5.9+
- Node.js (for Cowork live preview)
- Python 3 + Pillow (for screenshot processing)
- XcodeBuildMCP (for automated builds and screenshots)

## License

MIT
