#!/bin/bash
PYTHON_VERSION="3.11"

# Get the installed Python version and extract major and minor components
python_version=$(python --version 2>&1 | cut -d' ' -f2 | cut -d. -f1,2)

# Compare the version using awk
if awk 'BEGIN { if ("'"$python_version"'" <= "'"$PYTHON_VERSION"'") exit 1; else exit 0; }'; then
    echo "Error: Python version $PYTHON_VERSION or later is required."
    exit 1
fi

python3 -m venv .venv
source .venv/bin/activate

python setup.py "$@"