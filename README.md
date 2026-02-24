# swift-ui-prototyper

Claude Code plugin for generating SwiftUI prototypes with automatic stub data for PRD documentation.

## Features

- Generate SwiftUI Views from natural language descriptions
- Auto-create stub data for multiple UI states (mini-Storybook)
- Create custom design systems from reference images or text descriptions
- Multiple `#Preview` macros for each view state
- Automated screenshots via XcodeBuildMCP (iPad Pro simulator)
- Reusable code for production implementation
- Consistent project structure across all projects

## Skills

### 1. prototype-generator

Generate SwiftUI prototypes with stub data.

```
/prototype Library screen with sidebar navigation and video list
```

**Creates:**
- `LibraryView.swift` with SwiftUI implementation
- `VideoStubs.swift` with empty, single, typical, error states
- Multiple `#Preview` macros for each state
- Navigation entry in `ContentView.swift`

### 2. design-system-creator

Create custom design systems from reference images or text descriptions.

```
/design-system [attach screenshot of DaVinci Resolve]
```

Or with text:

```
/design-system professional dark theme for video editing app
```

**Creates:**
- `DesignSystem.swift` with colors, typography, spacing constants
- View extensions for common patterns
- Consistent styling across all prototypes

## Installation

### Claude Code CLI

```bash
claude --plugin-dir ~/Developer/claude-plugins/swift-ui-prototyper
```

### Symlink for Cowork

```bash
ln -sf ~/Developer/claude-plugins/swift-ui-prototyper ~/.claude/plugins/swift-ui-prototyper
```

## Project Structure

The plugin expects/creates this structure in your project:

```
your-project/
├── swift-ui-prototype/
│   ├── swift-ui-prototype.xcodeproj/   # iOS/iPadOS project
│   ├── Info.plist                       # Landscape-only orientation
│   ├── App.swift
│   ├── ContentView.swift
│   ├── DesignSystem.swift               # Optional: custom colors/typography
│   ├── Views/
│   │   └── LibraryView.swift
│   └── Stubs/
│       └── VideoStubs.swift
└── docs/
    └── mockups/
        ├── library-empty.jpg
        └── library-typical.jpg
```

## Automated Screenshots

Uses XcodeBuildMCP with iPad Pro 13" simulator for automated screenshots:

### Quick Screenshots (800x600)

```
1. boot_sim()           → Start iPad Pro simulator
2. build_run_sim()      → Build and launch app
3. screenshot()         → Capture current screen
4. cp to docs/mockups/  → Save for documentation
```

### High-Resolution Screenshots (2752x1892)

For production-quality screenshots without iPad chrome (status bar, home indicator):

```bash
# 1. Take raw screenshot
xcrun simctl io booted screenshot /tmp/raw.png --type png

# 2. Process with included script
python3 scripts/process_ipad_screenshot.py /tmp/raw.png docs/mockups/screen.jpg
```

The processing script:
- Rotates from portrait framebuffer to landscape
- Crops status bar (top 130px) and home indicator (bottom 42px)
- Outputs clean, chrome-free screenshots

iPad Pro 13" (1366x1024 pt in landscape) provides desktop-like layouts with sidebar navigation.

## Mini-Storybook Concept

Each view includes multiple preview states:

```swift
#Preview("Empty") {
    LibraryView(videos: VideoStubs.empty)
}

#Preview("Typical") {
    LibraryView(videos: VideoStubs.typical)
}

#Preview("Many Items") {
    LibraryView(videos: VideoStubs.many)
}
```

This allows you to:
- Visualize all UI states
- Export screenshots for each state
- Test edge cases
- Document expected data structures

## Design System Example

With a design system, prototypes use consistent styling:

```swift
// DesignSystem.swift
enum DesignSystem {
    enum Colors {
        static let backgroundPrimary = Color(white: 0.12)
        static let textPrimary = Color(white: 0.95)
        static let accent = Color(white: 0.6)
    }
}

// LibraryView.swift
Text("Bibliotek")
    .foregroundStyle(DesignSystem.Colors.textPrimary)
    .background(DesignSystem.Colors.backgroundPrimary)
```

## Requirements

- macOS 14.0+ (Sonoma)
- iOS 17.0+ / iPadOS 17.0+ (for simulator)
- Xcode 15+
- Swift 5.9+
- XcodeBuildMCP (for automated screenshots)

## License

MIT
