@echo off
set PYTHON_VERSION=3.10

:: Check Python version
for /f "tokens=2" %%A in ('python --version 2^>^&1') do set current_python_version=%%A

if not "%current_python_version%" geq "%PYTHON_VERSION%" (
    echo Error: Python version %PYTHON_VERSION% or later is required.
    exit /b 1
)

python -m venv .venv
call .venv\Scripts\activate

python setup.py %*

pause