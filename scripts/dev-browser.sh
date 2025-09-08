#!/bin/bash

# Start Next.js development server in the background
npm run dev &

# Get the process ID
DEV_PID=$!

# Wait for the server to start
sleep 4

# Try to detect which port is being used
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    PORT=3000
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    PORT=3001
elif curl -s http://localhost:3002 > /dev/null 2>&1; then
    PORT=3002
else
    echo "Could not detect development server port"
    exit 1
fi

# Open the browser
case "$1" in
    "chrome")
        open -a 'Google Chrome' "http://localhost:$PORT"
        ;;
    "safari")
        open -a 'Safari' "http://localhost:$PORT"
        ;;
    *)
        open "http://localhost:$PORT"
        ;;
esac

# Wait for the development server
wait $DEV_PID
