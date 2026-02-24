---
name: prototype
description: Generate a SwiftUI prototype with stub data for PRD documentation
---

# SwiftUI Prototype Command

This command generates SwiftUI prototypes with automatic stub data for multiple UI states (mini-Storybook pattern).

## Usage

```
/swift-ui-prototyper:prototype [description]
```

## Examples

```
/swift-ui-prototyper:prototype Task list with sidebar navigation and search
/swift-ui-prototyper:prototype Dashboard with encoding queue and progress bars
/swift-ui-prototyper:prototype Settings page with toggle switches and sliders
```

## Workflow

1. Parse the prototype description
2. Create/verify swift-ui-prototype/ project structure
3. Generate stub data with multiple states (empty, single, typical, error)
4. Generate SwiftUI View with #Preview macros for each state
5. Update ContentView navigation
6. Build and verify
7. Optionally capture simulator screenshots

## Output

Creates the following files:
- `swift-ui-prototype/Views/{ViewName}.swift` - SwiftUI implementation
- `swift-ui-prototype/Stubs/{ModelName}Stubs.swift` - Stub data for all states
- Updates `swift-ui-prototype/ContentView.swift` with navigation entry

Returns markdown summary with file list and preview instructions.
