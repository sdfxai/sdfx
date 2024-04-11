#!/bin/bash
source .venv/bin/activate
python_executable=""

if command -v python >/dev/null 2>&1; then
    python_executable="python3"
elif command -v python3 >/dev/null 2>&1; then
    python_executable="python"
else
    echo "Error: Neither 'python' nor 'python3' found in the system."
    exit 1
fi

$python_executable setup.py --run