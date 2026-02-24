---
name: design-system
description: Create a custom design system from reference images or text descriptions
---

# Design System Command

This command creates custom design systems for SwiftUI prototypes from reference images or text descriptions.

## Usage

```
/swift-ui-prototyper:design-system [description or attach reference image]
```

## Examples

```
/swift-ui-prototyper:design-system professional dark theme for video editing app
/swift-ui-prototyper:design-system extract colors from [attached screenshot]
/swift-ui-prototyper:design-system minimal light theme with blue accents
```

## Output

Creates `swift-ui-prototype/DesignSystem.swift` with:
- Color palette (background, text, accent colors)
- Typography scale
- Spacing constants
- View extensions for common patterns

All subsequent prototypes will use these design tokens for consistent styling.
