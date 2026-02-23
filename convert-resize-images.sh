#!/bin/bash

# Image Converter & Resizer
# Converts images to target format and resizes to fixed height

# Default values
HEIGHT=392
FORMAT="jpeg"
QUALITY=85
FOLDER="."

# Help message
show_help() {
    echo "Usage: ./convert-resize-images.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dir FOLDER       Source directory (default: current directory)"
    echo "  -h, --height HEIGHT    Target height in pixels (default: 392)"
    echo "  -f, --format FORMAT    Target format: jpeg, png, gif, etc (default: jpeg)"
    echo "  -q, --quality QUALITY  JPEG quality 0-100 (default: 85)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./convert-resize-images.sh -d ./photos -h 320 -f jpeg -q 90"
    echo "  ./convert-resize-images.sh --dir ./images --height 500 --format png"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            FOLDER="$2"
            shift 2
            ;;
        -h|--height)
            HEIGHT="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate folder exists
if [ ! -d "$FOLDER" ]; then
    echo "Error: Directory '$FOLDER' does not exist"
    exit 1
fi

# Get file extension for target format
case $FORMAT in
    jpeg|jpg)
        EXT="jpg"
        FORMAT="jpeg"
        ;;
    png)
        EXT="png"
        FORMAT="png"
        ;;
    gif)
        EXT="gif"
        FORMAT="gif"
        ;;
    *)
        EXT="$FORMAT"
        ;;
esac

echo "Converting images in: $FOLDER"
echo "Target format: $FORMAT"
echo "Target height: ${HEIGHT}px"
if [ "$FORMAT" = "jpeg" ]; then
    echo "JPEG quality: $QUALITY%"
fi
echo "---"

# Counter for processed files
count=0

# Process all files in the directory
cd "$FOLDER" || exit 1

for file in *; do
    # Skip if not a file
    [ -f "$file" ] || continue

    output_file="${file%.*}.$EXT"

    # If file is already target format, process in-place
    if [[ "$file" == *."$EXT" ]]; then
        output_file="${file%.*}.$EXT"
    fi

    # Try to process the file (sips will handle if it's an image)
    if [ "$FORMAT" = "jpeg" ]; then
        # JPEG with quality option
        if sips -s format "$FORMAT" -s formatOptions "$QUALITY" --resampleHeight "$HEIGHT" "$file" --out "$output_file" 2>/dev/null; then
            echo "✓ Converted: $file → $output_file"
            ((count++))
        fi
    else
        # Other formats without quality option
        if sips -s format "$FORMAT" --resampleHeight "$HEIGHT" "$file" --out "$output_file" 2>/dev/null; then
            echo "✓ Converted: $file → $output_file"
            ((count++))
        fi
    fi
done

echo "---"
echo "Done! Processed $count image(s)"
