#!/bin/bash
PYTHON_VERSION="3.11"
python_executable=""

if command -v python >/dev/null 2>&1; then
    python_executable="python3"
elif command -v python3 >/dev/null 2>&1; then
    python_executable="python"
else
    echo "Error: Neither 'python' nor 'python3' found in the system."
    exit 1
fi

# Get the installed Python version and extract major and minor components
python_version=$($python_executable --version 2>&1 | cut -d' ' -f2 | cut -d. -f1,2)

# Compare the version using awk
if awk 'BEGIN { if ("'"$python_version"'" <= "'"$PYTHON_VERSION"'") exit 1; else exit 0; }'; then
    echo "Error: Python version $PYTHON_VERSION or later is required."
    exit 1
fi

$python_executable -m venv .venv
source .venv/bin/activate

$python_executable setup.py "$@"