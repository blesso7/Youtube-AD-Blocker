# Icon Files

This directory contains the icon files for YouTube AdBlock Pro in various sizes:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Icon Design

The icon design features a shield with a checkmark, representing protection from ads and successful ad blocking. The primary colors used are:

- Primary: #6366f1 (Indigo)
- White: #ffffff

## Usage

These icons are used in various places throughout the extension:

1. Browser toolbar icon
2. Extension management page
3. Extension popup header
4. Store listing (when published)

## Disabled State

When the extension is disabled, a grayscale version of the icon is shown. This is achieved programmatically by changing the icon path in the background script.

## Requirements

- All icons must maintain the same design across different sizes
- Icons should be in PNG format with transparency
- The design should be recognizable even at small sizes

## Creating New Icons

If you need to create new icons or modify existing ones:

1. Use the source vector files in the `source` directory
2. Export to PNG in the required sizes
3. Optimize the PNGs using a tool like ImageOptim or TinyPNG
4. Place the optimized files in this directory

Please maintain the naming convention: `icon<size>.png`
