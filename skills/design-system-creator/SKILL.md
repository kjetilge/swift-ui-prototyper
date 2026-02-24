---
name: design-system-creator
description: Create a SwiftUI design system from text descriptions or reference images for macOS/iPadOS apps
---

# Design System Creator

Create custom SwiftUI design systems from text descriptions or reference images, optimized for macOS and iPadOS applications.

## When to Use

Activate this skill when the user:
- Wants to create a "design system", "theme", or "color palette"
- Provides a reference image of an app they want to match
- Describes a visual style ("professional", "minimal", "playful", etc.)
- Says "/design-system" followed by a description or image
- Wants consistent styling across multiple prototypes

## Input Types

### 1. Reference Image
User provides a screenshot of an existing app (DaVinci Resolve, Figma, Final Cut, etc.)

**Analysis steps:**
- Extract dominant colors (background, foreground, accent)
- Identify contrast ratios and hierarchy
- Note UI patterns (sidebar style, list style, button style)
- Detect light/dark mode preference

### 2. Text Description
User describes the desired style in words.

**Keywords to parse:**
- **Professional/Pro**: Dark grays, subtle contrasts, muted accents
- **Minimal/Clean**: High contrast, lots of whitespace, monochrome
- **Playful/Fun**: Vibrant colors, rounded corners, bold accents
- **Corporate/Business**: Blue accents, structured layouts, formal typography
- **Creative/Artistic**: Rich colors, unique typography, expressive spacing

### 3. Combined Input
User provides both image and description for refinement.

## Output: DesignSystem.swift

Generate a complete design system file in `swift-ui-prototype/DesignSystem.swift`:

```swift
import SwiftUI

// MARK: - Design System
// Generated from: [description or "Reference image analysis"]
// Style: [detected style name]

enum DesignSystem {

    // MARK: - Colors

    enum Colors {
        // Backgrounds
        static let backgroundPrimary = Color(white: 0.12)
        static let backgroundSecondary = Color(white: 0.15)
        static let backgroundTertiary = Color(white: 0.18)

        // Text
        static let textPrimary = Color(white: 0.95)
        static let textSecondary = Color(white: 0.7)
        static let textTertiary = Color(white: 0.5)

        // Accents
        static let accent = Color(white: 0.6)        // Or Color.blue, etc.
        static let accentHighlight = Color(white: 0.8)

        // Semantic
        static let success = Color.green
        static let warning = Color.orange
        static let error = Color.red

        // Components
        static let sidebarBackground = Color(white: 0.10)
        static let sidebarSelected = Color(white: 0.25)
        static let listRowEven = Color(white: 0.18)
        static let listRowOdd = Color(white: 0.15)
        static let divider = Color(white: 0.25)
        static let placeholder = Color(white: 0.25)
    }

    // MARK: - Typography

    enum Typography {
        static let largeTitle = Font.largeTitle.weight(.bold)
        static let title = Font.title.weight(.semibold)
        static let headline = Font.headline
        static let body = Font.body
        static let caption = Font.caption
        static let mono = Font.system(.body, design: .monospaced)
    }

    // MARK: - Spacing

    enum Spacing {
        static let xxs: CGFloat = 4
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    // MARK: - Corner Radius

    enum Radius {
        static let sm: CGFloat = 4
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
        static let full: CGFloat = 9999
    }

    // MARK: - Shadows

    enum Shadows {
        static let sm = Color.black.opacity(0.1)
        static let md = Color.black.opacity(0.2)
        static let lg = Color.black.opacity(0.3)
    }
}

// MARK: - View Extensions

extension View {
    func designBackground(_ style: DesignSystem.Colors.Type = DesignSystem.Colors.self) -> some View {
        self.background(DesignSystem.Colors.backgroundPrimary)
    }

    func cardStyle() -> some View {
        self
            .padding(DesignSystem.Spacing.md)
            .background(DesignSystem.Colors.backgroundSecondary)
            .clipShape(RoundedRectangle(cornerRadius: DesignSystem.Radius.md))
    }
}
```

## Style Presets

### Pro Dark (DaVinci Resolve, Logic Pro)
```swift
// Backgrounds: Very dark grays (0.10 - 0.18)
// Text: Light grays (0.7 - 0.95)
// Accent: Muted gray (no blue)
// Contrast: Subtle, professional
static let backgroundPrimary = Color(white: 0.12)
static let accent = Color(white: 0.6)
```

### Apple Default Dark
```swift
// Backgrounds: System dark colors
// Text: System labels
// Accent: Blue (system default)
static let backgroundPrimary = Color(uiColor: .systemBackground)
static let accent = Color.accentColor
```

### Minimal Light
```swift
// Backgrounds: Near white
// Text: Near black
// Accent: Single color
static let backgroundPrimary = Color(white: 0.98)
static let textPrimary = Color(white: 0.1)
static let accent = Color.blue
```

### Vibrant Creative
```swift
// Backgrounds: Deep colors
// Text: High contrast
// Accent: Vibrant, multiple
static let backgroundPrimary = Color(red: 0.1, green: 0.1, blue: 0.15)
static let accent = Color.purple
```

## Workflow

### Step 1: Analyze Input

**If image provided:**
1. Examine the screenshot for color palette
2. Identify background colors (use color picker mentally)
3. Note text colors and contrast
4. Detect accent colors and their usage
5. Observe component styling (rounded corners, shadows, etc.)

**If text provided:**
1. Parse keywords for style direction
2. Map to closest preset as starting point
3. Adjust based on specific requirements

### Step 2: Generate DesignSystem.swift

1. Create file at `swift-ui-prototype/DesignSystem.swift`
2. Include all color, typography, spacing constants
3. Add comment header with source description
4. Include View extensions for common patterns

### Step 3: Update Existing Views (Optional)

If prototype views already exist, offer to update them:
1. Replace hardcoded colors with `DesignSystem.Colors.*`
2. Replace hardcoded spacing with `DesignSystem.Spacing.*`
3. Apply consistent typography

### Step 4: Verify Build

```bash
cd {project}/swift-ui-prototype
swift build
```

### Step 5: Return Summary

```markdown
### Design System Created

**Style:** Pro Dark (based on DaVinci Resolve reference)

**Color Palette:**
| Role | Value | Preview |
|------|-------|---------|
| Background Primary | `Color(white: 0.12)` | ████ |
| Text Primary | `Color(white: 0.95)` | ████ |
| Accent | `Color(white: 0.6)` | ████ |

**Files:**
- `swift-ui-prototype/DesignSystem.swift` (created)

**Usage:**
```swift
Text("Hello")
    .foregroundStyle(DesignSystem.Colors.textPrimary)
    .background(DesignSystem.Colors.backgroundPrimary)
```
```

## Image Analysis Guidelines

When analyzing a reference image:

1. **Background colors**: Look at main content area, sidebar, headers
2. **Text hierarchy**: Primary text vs secondary vs disabled
3. **Accent usage**: Buttons, selected states, links
4. **Contrast**: High contrast = modern/minimal, low contrast = professional/subtle
5. **Color temperature**: Cool (blue-gray) vs warm (brown-gray) vs neutral

**Color extraction approach:**
- Darkest area → `backgroundPrimary`
- Slightly lighter → `backgroundSecondary`
- Content area → `backgroundTertiary`
- Main text → `textPrimary`
- Metadata/labels → `textSecondary`
- Disabled/placeholder → `textTertiary`
- Interactive elements → `accent`

## Example Interactions

### Example 1: Reference Image

**User:** `/design-system` + [screenshot of DaVinci Resolve]

**Assistant:**
1. Analyzes image: "Dark professional UI with subtle gray contrasts"
2. Extracts colors: Background ~0.12, sidebar ~0.10, text ~0.85
3. Notes: No blue accents, gray icons, alternating list rows
4. Generates DesignSystem.swift with Pro Dark preset
5. Returns summary with color table

### Example 2: Text Description

**User:** `/design-system minimalist light theme for a note-taking app`

**Assistant:**
1. Parses: "minimalist" + "light" + "note-taking"
2. Selects Minimal Light preset as base
3. Adjusts: Lots of whitespace, subtle shadows, focus on readability
4. Generates DesignSystem.swift
5. Returns summary

### Example 3: Refinement

**User:** `Make the accent color more orange, like a sunset`

**Assistant:**
1. Reads existing DesignSystem.swift
2. Updates accent colors to orange palette
3. Adjusts related colors for harmony
4. Rebuilds and verifies

## Dependencies

- swift-ui-prototype project structure (created by prototype-generator)
- SwiftUI (iOS 17.0+ / macOS 14.0+)

## Notes

- Always generate platform-agnostic colors (work on both iOS and macOS)
- Use `Color(white:)` for grayscale, `Color(red:green:blue:)` for colors
- Avoid `UIColor`/`NSColor` directly - use `Color(uiColor:)` or conditional compilation
- Include both light and dark mode support where applicable
