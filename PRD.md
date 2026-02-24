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

A Claude Code plugin that generates SwiftUI prototypes with automatic PNG screenshots.

### Workflow

```
User describes UI → Claude generates SwiftUI + Stubs → XcodeBuildMCP screenshots → PNG in docs/
```

1. **Describe**: User describes the UI in natural language
2. **Generate**: Claude creates SwiftUI View + stub data for multiple states
3. **Screenshot**: XcodeBuildMCP builds and captures simulator screenshots
4. **Document**: PNGs are saved to `docs/mockups/` with markdown references

### Key Features

- **SwiftUI as source of truth**: Code can be reused in production
- **Mini-Storybook**: Stub data shows multiple UI states per view
- **Automatic screenshots**: XcodeBuildMCP captures simulator output
- **Consistent structure**: `swift-ui-prototype/` folder in any project

## Architecture

### Project Structure (in target project)

```
any-project/
├── swift-ui-prototype/                 # Standard folder name
│   ├── swift-ui-prototype.xcodeproj
│   ├── App.swift
│   ├── ContentView.swift
│   ├── Views/
│   │   ├── LibraryView.swift
│   │   └── DeliveryView.swift
│   └── Stubs/
│       ├── VideoStubs.swift
│       └── EncodingStubs.swift
└── docs/
    └── mockups/
        ├── library-empty.png
        ├── library-loaded.png
        └── delivery-active.png
```

### Plugin Structure

```
swift-ui-prototyper/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── prototype-generator/
│       └── SKILL.md
├── commands/
│   └── prototype.md
├── PRD.md
└── README.md
```

## Skills

### prototype-generator

**Activation:** "lag prototype", "mockup", "UI-skisse", "/prototype"

**Workflow:**
1. Parse user's UI description
2. Identify relevant UI states (empty, loading, error, active, complete)
3. Generate stub data in `Stubs/`
4. Generate SwiftUI View with multiple `#Preview` macros
5. Build project with XcodeBuildMCP
6. Boot simulator and navigate to view
7. Capture screenshots for each preview state
8. Save to `docs/mockups/{view}-{state}.png`
9. Return markdown with image references

**Example Input:**
```
/prototype Library screen with sidebar navigation and video list
```

**Example Output:**
```markdown
### Library View

| State | Preview |
|-------|---------|
| Empty | ![Empty](docs/mockups/library-empty.png) |
| Loaded | ![Loaded](docs/mockups/library-loaded.png) |
| Loading | ![Loading](docs/mockups/library-loading.png) |

**Files created:**
- `swift-ui-prototype/Views/LibraryView.swift`
- `swift-ui-prototype/Stubs/VideoStubs.swift`
```

## Dependencies

- **XcodeBuildMCP**: For building and simulator screenshots
- **Xcode**: Must be installed on the machine
- **macOS**: Plugin targets Apple platform development

## Test Project

**Reference project:** `/Users/kjetilge/GitHubReposNye/FAGFILM_REPOS/fagfilm-encoder`

This is a macOS video encoder app specification with:
- 5 main screens (Library, Delivery, Chapters, Posters, Subtitles)
- Existing mockups in `mockups/` for comparison
- Complete PRD to guide prototype creation

## Success Metrics

1. **Time to mockup**: < 2 minutes from description to PNG
2. **Code reuse**: Prototypes can be copied to production project
3. **State coverage**: Each view shows 3+ UI states
4. **Quality**: Screenshots match Xcode preview quality

## Future Enhancements

- [ ] Multiple platform support (iOS, watchOS, visionOS)
- [ ] Component library extraction
- [ ] Design token generation
- [ ] Animation preview support
- [ ] Accessibility audit integration
