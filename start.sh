#!/bin/sh

if [ -f "$CACHE_DIR/package-lock.json" ] && [ ! -f "$APP_DIR/package-lock.json" ]; then
  cp -f "$CACHE_DIR/package-lock.json" "$APP_DIR/package-lock.json"
fi

if [ -f "$CACHE_DIR/package.json" ] && [ ! -f "$APP_DIR/package.json" ]; then
  cp -f "$CACHE_DIR/package.json" "$APP_DIR/package.json"
fi

if [ -d "$CACHE_DIR/node_modules" ] && [ ! -f "$APP_DIR/node_modules" ]; then
  cp -rfu  "$CACHE_DIR/node_modules/." "$APP_DIR/node_modules/"
fi

if [ -d "$CACHE_DIR" ]; then
  rm -rf "$CACHE_DIR"
fi

tail -f /dev/null