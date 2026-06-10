#!/bin/zsh

cd "$(dirname "$0")"

IP_ADDRESS="$(ifconfig en0 2>/dev/null | awk '/inet / { print $2; exit }')"
if [ -z "$IP_ADDRESS" ]; then
  IP_ADDRESS="$(ifconfig 2>/dev/null | awk '/inet 192\.168\.|inet 10\.|inet 172\./ { print $2; exit }')"
fi

clear
echo "Daily Adventure iPhone Preview"
echo
echo "Keep this window open while testing on the iPhone."
echo

if [ -n "$IP_ADDRESS" ]; then
  echo "Open this on the iPhone:"
  echo "http://$IP_ADDRESS:8080"
  echo
fi

echo "If macOS asks to allow incoming connections, choose Allow."
echo
echo "Starting preview..."
echo

python3 -m http.server 8080 --bind 0.0.0.0
