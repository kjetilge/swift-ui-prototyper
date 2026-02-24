---
name: prototype-generator
description: Generate SwiftUI prototypes with stub data for PRD documentation
---

# SwiftUI Prototype Generator

Generate SwiftUI prototypes with automatic stub data for multiple UI states (mini-Storybook).

## When to Use

Activate this skill when the user:
- Asks to create a "prototype", "mockup", or "UI-skisse"
- Wants to visualize a screen for PRD documentation
- Says "/prototype" followed by a description
- Needs SwiftUI code that can be reused in production

## Mandatory Workflow

### Step 1: Analyze the Request

Parse the user's description to identify:
- **View name**: What to call the SwiftUI View (e.g., LibraryView, DeliveryView)
- **UI elements**: List, sidebar, buttons, forms, etc.
- **Data model**: What data does this view display?
- **UI states**: Empty, loading, error, active, completed

### Step 2: Ensure Project Structure Exists

Check if `swift-ui-prototype/` folder exists in the current project:

```
{project}/
├── swift-ui-prototype/
│   ├── swift-ui-prototype.xcodeproj/   # iOS/iPadOS project for XcodeBuildMCP
│   ├── App.swift
│   ├── ContentView.swift
│   ├── Views/
│   └── Stubs/
└── docs/
    └── mockups/
```

If not, create the minimal structure:
1. Create `swift-ui-prototype/` folder
2. Create `swift-ui-prototype.xcodeproj` targeting iOS 17.0+ (iPad support)
3. Create minimal `App.swift` with @main (cross-platform compatible)
4. Create `ContentView.swift` with navigation to prototypes
5. Create `Views/` and `Stubs/` directories

**Note:** Uses iOS/iPadOS target for XcodeBuildMCP automation. iPad Pro 13" simulator provides desktop-like 1024x1366 pt canvas.

### Step 3: Generate Stub Data

Create stub file in `Stubs/{ModelName}Stubs.swift`:

```swift
import Foundation

struct {ModelName}: Identifiable {
    let id: String
    // ... properties based on user description
}

enum {ModelName}Stubs {
    // Empty state
    static let empty: [{ModelName}] = []

    // Single item state
    static let single: [{ModelName}] = [
        // One realistic example
    ]

    // Typical state (3-5 items)
    static let typical: [{ModelName}] = [
        // Multiple realistic examples
    ]

    // Error/edge case state
    static let withErrors: [{ModelName}] = [
        // Examples showing error states
    ]
}
```

**Important stub guidelines:**
- Use realistic Norwegian content when appropriate
- Include edge cases (long text, missing data, errors)
- Each stub set represents a distinct UI state

### Step 4: Generate SwiftUI View

Create View file in `Views/{ViewName}.swift`:

```swift
import SwiftUI

struct {ViewName}: View {
    let data: [{ModelName}]
    // ... other properties

    var body: some View {
        // Implementation based on user description
    }
}

// MARK: - Previews (Mini-Storybook)

#Preview("Empty") {
    {ViewName}(data: {ModelName}Stubs.empty)
        .frame(width: 900, height: 600)
}

#Preview("Single Item") {
    {ViewName}(data: {ModelName}Stubs.single)
        .frame(width: 900, height: 600)
}

#Preview("Typical") {
    {ViewName}(data: {ModelName}Stubs.typical)
        .frame(width: 900, height: 600)
}

#Preview("With Errors") {
    {ViewName}(data: {ModelName}Stubs.withErrors)
        .frame(width: 900, height: 600)
}
```

### Step 5: Update ContentView Navigation

Add the new view to `ContentView.swift` navigation:

```swift
NavigationLink(value: "{ViewName}") {
    Label("{Display Name}", systemImage: "{sf-symbol}")
}
```

### Step 6: Build and Verify

```bash
cd {project}/swift-ui-prototype
swift build
```

If build fails, fix errors and rebuild.

### Step 7: Generate Screenshots

**Option A: XcodeBuildMCP with iPad Pro Simulator (Recommended)**

The prototype uses iOS/iPadOS for automated screenshots via XcodeBuildMCP:

1. **Set defaults** (once per session):
   ```
   session_set_defaults({
     projectPath: "{project}/swift-ui-prototype/swift-ui-prototype.xcodeproj",
     scheme: "swift-ui-prototype",
     simulatorId: "iPad Pro 13-inch (M5)",
     bundleId: "no.fagfilm.swift-ui-prototype"
   })
   ```

2. **Boot simulator**: `boot_sim()`

3. **Configure simulator for screenshots**:
   - Move simulator to external display if available (iPad Pro 13" is large)
   - Use "Fit Screen" (Window menu) to ensure full visibility
   - **For macOS-style apps with sidebar**: Rotate to landscape mode (Device → Rotate Right)
   - The app should support ALL orientations (responsive design) but landscape is preferred for documentation screenshots

4. **Build and run**: `build_run_sim()`

4. **Take high-resolution screenshot** (requires post-processing):
   ```bash
   # Take raw screenshot (portrait framebuffer)
   xcrun simctl io booted screenshot /tmp/raw-screenshot.png --type png
   ```

5. **Process screenshot** (rotate and crop iPad chrome):
   ```python
   from PIL import Image

   img = Image.open('/tmp/raw-screenshot.png')

   # Rotation depends on simulator orientation:
   # - Landscape Right (Rotate Right): use rotate(-90)
   # - Landscape Left (Rotate Left): use rotate(90)
   img_rotated = img.rotate(-90, expand=True)

   # Crop: top 130px (status bar + camera), bottom 42px (home indicator)
   width, height = img_rotated.size
   cropped = img_rotated.crop((0, 130, width, height - 42))

   # Save as JPEG
   cropped.convert('RGB').save('docs/mockups/{view}-{state}.jpg', quality=90)
   ```

6. **Alternative: Quick screenshots** (lower resolution, no post-processing):
   ```
   screenshot({ returnFormat: "path" })
   cp {screenshot_path} docs/mockups/{view}-{state}.jpg
   ```

**Resolution comparison:**
- Full-resolution (simctl): 2752x1892 (after processing)
- Quick screenshots (XcodeBuildMCP): 800x600

iPad Pro 13" (1024x1366 pt) provides desktop-like layouts with sidebar navigation.

**Option B: Manual (Fallback)**

Instruct user:
1. Open `swift-ui-prototype/swift-ui-prototype.xcodeproj` in Xcode
2. Select a preview in the canvas
3. Right-click → "Export Preview Image..."
4. Save to `docs/mockups/{view}-{state}.png`

### Step 8: Return Markdown Summary

```markdown
### {ViewName}

| State | Preview |
|-------|---------|
| Empty | ![Empty](docs/mockups/{view}-empty.png) |
| Typical | ![Typical](docs/mockups/{view}-typical.png) |
| With Errors | ![Errors](docs/mockups/{view}-errors.png) |

**Files created:**
- `swift-ui-prototype/Views/{ViewName}.swift`
- `swift-ui-prototype/Stubs/{ModelName}Stubs.swift`

**To generate screenshots:**
1. Open Package.swift in Xcode
2. Select preview → Right-click → Export Preview Image
3. Save to docs/mockups/
```

## Using Design Systems

If a `DesignSystem.swift` file exists in the project (created via `design-system-creator` skill), use its constants instead of hardcoded values:

```swift
// WITHOUT design system (system defaults)
Text("Title")
    .foregroundStyle(.primary)
    .background(Color(uiColor: .systemBackground))

// WITH design system (custom styling)
Text("Title")
    .foregroundStyle(DesignSystem.Colors.textPrimary)
    .background(DesignSystem.Colors.backgroundPrimary)
```

**Check for design system:**
1. Look for `swift-ui-prototype/DesignSystem.swift`
2. If exists, import and use its constants
3. If not, use SwiftUI system defaults (works for both light/dark mode)

**Benefits of design systems:**
- Consistent styling across all prototypes
- Easy to update colors/spacing globally
- Matches reference apps (DaVinci Resolve, Figma, etc.)
- Production-ready code

## Code Style Guidelines

### SwiftUI Best Practices
- Use `#Preview` macro (not deprecated PreviewProvider)
- Set explicit frame sizes for consistent screenshots
- Use SF Symbols for icons
- Follow Apple Human Interface Guidelines
- Support dark mode with semantic colors

### iPad/Cross-Platform
- Use `NavigationSplitView` for sidebar layouts (works identically on iPadOS and macOS)
- iPad Pro 13" canvas: 1024x1366 pt (landscape: 1366x1024)
- Minimum touch targets: 44x44 pt (iOS HIG)
- Use conditional compilation for platform-specific modifiers:
  ```swift
  #if os(macOS)
  .windowStyle(.hiddenTitleBar)
  #endif
  ```

### Stub Data Best Practices
- Use realistic content lengths
- Include edge cases in separate stub sets
- Keep data sets small (3-5 items for typical)
- Use Norwegian language for fagfilm-specific content

## Example Interaction

**User:** `/prototype Delivery screen with encoding queue showing progress bars`

**Assistant:**

1. Creates `EncodingJob` model with progress, status, filename
2. Creates `EncodingJobStubs` with states: empty, active encoding, mixed progress, all complete
3. Creates `DeliveryView` with queue list and progress indicators
4. Adds multiple #Preview macros for each state
5. Updates ContentView navigation
6. Builds to verify
7. Returns markdown with file list and screenshot instructions

## Cowork Live Preview

For real-time preview in Claude Cowork's embedded browser, set up the preview server:

### Setup

1. **Copy preview server** to the prototype folder:
   ```bash
   cp {plugin}/scripts/preview-server.js {project}/swift-ui-prototype/
   ```

2. **Create `.claude/launch.json`** in the prototype folder:
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

3. **Ensure simulator is booted** before starting the preview server.

### How It Works

1. Cowork starts the preview server automatically via `launch.json`
2. Server watches `.swift` files in Views/ and Stubs/
3. On file change: xcodebuild → simulator screenshot → updates image
4. HTML page auto-refreshes every 2 seconds
5. Cowork's embedded browser shows live preview

### Preview Server Features

- **Auto-refresh**: Updates every 2 seconds
- **Status indicator**: Green (ready), Yellow (building), Red (error)
- **File watching**: Monitors Views/ and Stubs/ directories
- **Debouncing**: Prevents rapid rebuilds on multiple saves
- **Error display**: Shows build errors in the preview
- **No dependencies**: Uses only Node.js built-in modules

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | HTML preview page |
| `/screenshot.png` | Latest screenshot |
| `/api/status` | Build status JSON |
| `/api/rebuild` | Trigger manual rebuild |

### Project Structure with Live Preview

```
{project}/
├── swift-ui-prototype/
│   ├── .claude/
│   │   └── launch.json           # Cowork server config
│   ├── preview-server.js         # Live preview server
│   ├── swift-ui-prototype.xcodeproj/
│   ├── Views/
│   ├── Stubs/
│   └── docs/mockups/
│       └── preview-latest.png    # Auto-updated screenshot
└── docs/
    └── mockups/
```

## Dependencies

- iOS 17.0+ / iPadOS 17.0+ (for simulator)
- macOS 14.0+ (Sonoma) for development
- Swift 5.9+
- Xcode 15+ (for building and previews)
- XcodeBuildMCP (required for automated screenshots via iPad Pro simulator)
- Node.js (for Cowork live preview server)
