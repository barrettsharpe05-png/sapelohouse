#!/bin/sh
set -eu

project_dir="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
image_dir="$project_dir/public/sapelo-house-webp-seo/images"
output_dir="$project_dir/public/og"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick is required to regenerate social preview images." >&2
  exit 1
fi

mkdir -p "$output_dir"

make_card() {
  source_name="$1"
  output_name="$2"
  gravity="$3"
  magick "$image_dir/$source_name" -auto-orient -resize "1200x630^" -gravity "$gravity" -extent 1200x630 -quality 86 "$output_dir/$output_name"
}

make_card "sapelo-house-sapelo-river-view-live-oaks-townsend-georgia.webp" "home.jpg" "Center"
make_card "sapelo-house-vacation-rental-exterior-townsend-georgia.webp" "house.jpg" "Center"
make_card "sapelo-house-covered-porch-seating.webp" "experience.jpg" "Center"
make_card "sapelo-house-sapelo-river-through-spanish-moss.webp" "location.jpg" "Center"
make_card "sapelo-house-riverfront-yard-live-oaks.webp" "gallery.jpg" "Center"
make_card "sapelo-house-back-deck-outdoor-lounge.webp" "booking.jpg" "Center"
make_card "sapelo-house-riverfront-yard-live-oaks.webp" "faq.jpg" "Center"

node "$project_dir/scripts/generate-social-card.js"

echo "Generated seven page crops and the branded Sapelo House social card."
