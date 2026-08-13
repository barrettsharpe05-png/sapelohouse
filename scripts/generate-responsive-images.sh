#!/bin/sh
set -eu

image_dir="$(CDPATH= cd -- "$(dirname -- "$0")/../public/sapelo-house-webp-seo/images" && pwd)"
output_dir="$image_dir/responsive"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick is required to regenerate responsive image variants." >&2
  exit 1
fi

mkdir -p "$output_dir"

for source in "$image_dir"/*.webp; do
  filename="$(basename "$source" .webp)"
  magick "$source" -resize "960x>" -quality 78 "$output_dir/$filename-960.webp"
  magick "$source" -resize "1600x>" -quality 82 "$output_dir/$filename-1600.webp"
done

echo "Generated responsive variants for 30 source images."
