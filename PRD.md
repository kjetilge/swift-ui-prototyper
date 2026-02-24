# swift-ui-prototyper

**Version:** 1.0.0
**Author:** Kjetil Geirbo
**License:** MIT

## Problem

When creating PRDs (Product Requirements Documents) for macOS/iOS apps, we need:
1. High-quality UI mockups that accurately represent the design
2. Code that can be reused when implementing the actual app
3. Multiple UI states visualized (empty, loading, error, active, etc.)
4. Fast iteration using natural language descriptions

Current approaches have limitations:
- **Design tools (Figma, Sketch)**: Separate from code, manual export, no code reuse
- **Pencil.dev**: Good for design, but bidirectional SwiftUI sync is impractical
- **Manual Xcode**: Slow iteration, manual screenshot process

## Solution

A Claude Code plugin that generates SwiftUI prototypes with automatic high-resolution screenshots via iPad Pro simulator.

### Workflow

```
User describes UI → Claude generates SwiftUI + Stubs → XcodeBuildMCP builds → iPad simulator screenshots → JPEG in docs/
```

1. **Describe**: User describes the UI in natural language
2. **Generate**: Claude creates SwiftUI View + stub data for multiple states
3. **Build**: XcodeBuildMCP builds and runs on iPad Pro 13" simulator
4. **Screenshot**: High-resolution capture via `xcrun simctl io`
5. **Process**: Python script rotates and crops iPad chrome
6. **Document**: JPEGs saved to `docs/mockups/` with markdown references

### Key Features

- **SwiftUI as source of truth**: Code can be reused in production
- **Mini-Storybook pattern**: Multiple `#Preview` macros show different UI states
- **High-resolution output**: 2752x1892 pixels (after processing)
- **Responsive design**: Apps support all orientations
- **Design system support**: Optional custom colors, typography, spacing

## Architecture

### Project Structure (in target project)

```
any-project/
├── swift-ui-prototype/
│   ├── swift-ui-prototype.xcodeproj/   # iOS/iPadOS target
│   ├── Info.plist                       # All orientations supported
│   ├── App.swift
│   ├── ContentView.swift                # Sidebar navigation
│   ├── DesignSystem.swift               # Optional custom styling
│   ├── Views/
│   │   ├── TaskListView.swift
│   │   └── DeliveryView.swift
│   └── Stubs/
│       ├── TaskStubs.swift
│       └── EncodingStubs.swift
└── docs/
    └── mockups/
        ├── tasks-empty.jpg
        ├── tasks-typical.jpg
        └── delivery-active.jpg
```

### Plugin Structure

```
swift-ui-prototyper/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── prototype-generator/
│   │   └── SKILL.md              # Main prototype generation skill
│   └── design-system-creator/
│       └── SKILL.md              # Design system extraction skill
├── scripts/
│   └── process_ipad_screenshot.py  # Screenshot post-processing
├── commands/                       # (reserved for future use)
├── PRD.md
└── README.md
```

## Skills

### prototype-generator

**Activation:** "lag prototype", "mockup", "UI-skisse", "/prototype"

**Workflow:**
1. Parse user's UI description
2. Identify View name, data model, and UI states
3. Create/verify `swift-ui-prototype/` folder structure
4. Generate stub data in `Stubs/{ModelName}Stubs.swift`
5. Generate SwiftUI View with multiple `#Preview` macros
6. Update `ContentView.swift` navigation
7. Build and run via XcodeBuildMCP on iPad Pro 13" simulator
8. Capture high-resolution screenshots
9. Process screenshots (rotate, crop iPad chrome)
10. Save to `docs/mockups/{view}-{state}.jpg`
11. Return markdown with image references

**Example Input:**
```
/prototype Task list with sidebar navigation, search, and priority badges
```

**Example Output:**
```markdown
### TaskListView

| State | Preview |
|-------|---------|
| Empty | ![Empty](docs/mockups/tasks-empty.jpg) |
| Typical | ![Typical](docs/mockups/tasks-typical.jpg) |
| Many | ![Many](docs/mockups/tasks-many.jpg) |

**Files created:**
- `swift-ui-prototype/Views/TaskListView.swift`
- `swift-ui-prototype/Stubs/TaskStubs.swift`
```

### design-system-creator

**Activation:** "design system", "create design system", "extract colors from"

**Purpose:** Creates a `DesignSystem.swift` file with custom colors, typography, and spacing based on reference apps or user preferences.

**Workflow:**
1. Analyze reference (app screenshot, color palette, or description)
2. Generate `DesignSystem.swift` with:
   - Color palette (backgrounds, text, accents)
   - Typography scale
   - Spacing constants
   - Component styles
3. Update prototype views to use design system constants

## Screenshot Processing

### iPad Pro 13" Simulator

We use iPad Pro 13" (1024x1366 pt) as the simulation target because:
- Provides desktop-like canvas for macOS-style apps
- `NavigationSplitView` works identically on iPadOS and macOS
- Large enough for sidebar + content layouts
- XcodeBuildMCP automation support

### Screenshot Workflow

1. **Capture raw screenshot** (portrait framebuffer):
   ```bash
   xcrun simctl io booted screenshot /tmp/raw-screenshot.png --type png
   ```

2. **Process with Python script**:
   ```bash
   python scripts/process_ipad_screenshot.py /tmp/raw-screenshot.png output.jpg
   ```

3. **Processing steps**:
   - Rotate based on simulator orientation (Landscape Right: -90°, Landscape Left: 90°)
   - Crop top 130px (status bar + camera housing)
   - Crop bottom 42px (home indicator)
   - Convert to JPEG (quality 90)

4. **Output**: 2752x1892 pixel high-resolution screenshot

### Simulator Configuration

For macOS-style apps with sidebar navigation:
1. Move simulator to external display (iPad Pro 13" is large)
2. Use "Fit Screen" (Window menu) to ensure full visibility
3. Rotate to landscape mode (Device → Rotate Right)
4. Apps support all orientations but landscape preferred for documentation

## Dependencies

- **XcodeBuildMCP**: For building, running, and simulator management
- **Xcode 15+**: Must be installed
- **macOS 14+ (Sonoma)**: For development
- **Python 3 + Pillow**: For screenshot processing
- **iOS 17.0+ SDK**: Target deployment

## Test Project

**Test project:** `/Users/kjetilge/Developer/test-swift-prototype-plugin/`

Simple Task Manager app demonstrating:
- Sidebar navigation with NavigationSplitView
- TaskListView with search, priority badges, due dates
- Multiple UI states via TaskStubs (empty, single, typical, many)
- Dark mode styling
- Responsive design (all orientations)

**Reference project:** `/Users/kjetilge/GitHubReposNye/FAGFILM_REPOS/fagfilm-encoder`

macOS video encoder app specification with complex UI requirements.

## Success Metrics

1. **Time to mockup**: < 2 minutes from description to JPEG
2. **Code reuse**: Prototypes can be copied to production project
3. **State coverage**: Each view shows 3+ UI states via #Preview macros
4. **Quality**: 2752x1892 pixel screenshots (high-resolution)
5. **Responsive**: Apps work in all orientations

## Implemented Features

- [x] Prototype generation from natural language
- [x] Stub data with multiple UI states
- [x] Mini-Storybook pattern (#Preview macros)
- [x] XcodeBuildMCP integration
- [x] iPad Pro 13" simulator workflow
- [x] High-resolution screenshot capture
- [x] Screenshot post-processing (rotate, crop)
- [x] Design system extraction skill
- [x] Responsive design (all orientations)
- [x] Dark mode support

## Future Enhancements

- [ ] Multiple platform targets (watchOS, visionOS)
- [ ] Component library extraction
- [ ] Animation preview support
- [ ] Accessibility audit integration
- [ ] Automatic GitHub PR with mockup previews
