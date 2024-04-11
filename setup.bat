@echo off
set PYTHON_VERSION=3.10
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

:: Check Python version
for /f "tokens=2" %%A in ('python --version 2^>^&1') do set current_python_version=%%A

if not "%current_python_version%" geq "%PYTHON_VERSION%" (
    echo Error: Python version %PYTHON_VERSION% or later is required.
    exit /b 1
)

%python_executable% -m venv .venv
call .venv\Scripts\activate

%python_executable% setup.py %*

pause