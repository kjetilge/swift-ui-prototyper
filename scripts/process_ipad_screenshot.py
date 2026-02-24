#!/usr/bin/env python3
"""
iPad Screenshot Processor for swift-ui-prototyper plugin.

Processes raw iPad simulator screenshots:
1. Rotates from portrait framebuffer to landscape
2. Crops status bar, camera housing, and home indicator
3. Saves as optimized PNG and JPEG

Usage:
    python process_ipad_screenshot.py <input.png> <output.jpg> [--quality 90]

    Or import as module:
    from process_ipad_screenshot import process_screenshot
    process_screenshot('/tmp/raw.png', '/tmp/clean.jpg')
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow not installed. Run: pip3 install Pillow")
    sys.exit(1)


# iPad Pro 13" crop values (at 2x scale)
# These remove status bar, camera housing, and home indicator
CROP_TOP = 130      # Status bar + camera housing
CROP_BOTTOM = 42    # Home indicator


def process_screenshot(
    input_path: str,
    output_path: str,
    quality: int = 90,
    crop_top: int = CROP_TOP,
    crop_bottom: int = CROP_BOTTOM
) -> tuple[int, int]:
    """
    Process an iPad simulator screenshot.

    Args:
        input_path: Path to raw screenshot (from `xcrun simctl io booted screenshot`)
        output_path: Path for output file (supports .png, .jpg, .jpeg)
        quality: JPEG quality (1-100), ignored for PNG
        crop_top: Pixels to crop from top (default: 130 for iPad Pro 13")
        crop_bottom: Pixels to crop from bottom (default: 42 for iPad Pro 13")

    Returns:
        Tuple of (width, height) of final image
    """
    # Load raw screenshot (portrait framebuffer orientation)
    img = Image.open(input_path)

    # Rotate 90 degrees counter-clockwise to get landscape
    img_rotated = img.rotate(90, expand=True)

    # Crop to remove iPad chrome
    width, height = img_rotated.size
    crop_box = (0, crop_top, width, height - crop_bottom)
    cropped = img_rotated.crop(crop_box)

    # Save based on output extension
    output = Path(output_path)
    if output.suffix.lower() in ['.jpg', '.jpeg']:
        # Convert RGBA to RGB for JPEG
        if cropped.mode == 'RGBA':
            cropped = cropped.convert('RGB')
        cropped.save(output_path, 'JPEG', quality=quality, optimize=True)
    else:
        cropped.save(output_path, 'PNG', optimize=True)

    return cropped.size


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # Parse optional quality argument
    quality = 90
    for i, arg in enumerate(sys.argv):
        if arg == '--quality' and i + 1 < len(sys.argv):
            quality = int(sys.argv[i + 1])

    if not Path(input_path).exists():
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    width, height = process_screenshot(input_path, output_path, quality)
    print(f"Processed: {width}x{height} -> {output_path}")


if __name__ == '__main__':
    main()
