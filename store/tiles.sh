#!/usr/bin/env bash
# Renders the two promotional tiles from promo/ and the white wordmark.
# Needs librsvg: brew install librsvg
set -eu
cd "$(dirname "$0")/.."

# Without the font librsvg picks another one and says nothing, and the tile
# comes out with the wrong lettering.
if ! fc-list : family | grep -q '^Avenir Next$'; then
  echo 'tiles.sh: the font Avenir Next, which macOS carries, is not installed' >&2
  exit 1
fi

# librsvg loads an image only from the folder of the file it draws, or from
# below it, so the tiles are drawn in a folder that holds the wordmark too.
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cp assets/wordmark-white.svg store/promo/tile.svg store/promo/marquee.svg "$work"

mkdir -p store/images
rsvg-convert "$work/tile.svg" -o store/images/tile-440x280.png
rsvg-convert "$work/marquee.svg" -o store/images/marquee-1400x560.png
