@echo off
call .venv\Scripts\activate
set "python_executable="

where python >nul 2>nul
if %errorlevel% equ 0 (
    set "python_executable=python"
)

where python3 >nul 2>nul
if %errorlevel% equ 0 (
    set "python_executable=python3"
)

if "%python_executable%"=="" (
    echo Error: Neither 'python' nor 'python3' found in the system.
    exit /b 1
)

%python_executable% setup.py --run