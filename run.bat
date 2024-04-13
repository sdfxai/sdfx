@echo off
call .venv\Scripts\activate
set "python_executable="

where python >nul 2>nul
if %errorlevel% equ 0 (
    set "python_executable=python"
    goto :foundPython
)

where python3 >nul 2>nul
if %errorlevel% equ 0 (
    set "python_executable=python3"
    goto :foundPython
)

if "%python_executable%"=="" (
    for %%i in ("%LOCALAPPDATA%\Programs\Python\Python311\python.exe", "%LOCALAPPDATA%\Programs\Python\Python311\python3.exe",
                "%LOCALAPPDATA%\Programs\Python\Python310\python.exe", "%LOCALAPPDATA%\Programs\Python\Python310\python3.exe",
                "%LOCALAPPDATA%\Programs\Python\Python39\python.exe", "%LOCALAPPDATA%\Programs\Python\Python39\python3.exe",
                "%LOCALAPPDATA%\Programs\Python\Python38\python.exe", "%LOCALAPPDATA%\Programs\Python\Python38\python3.exe") do (
        if exist %%i (
            set "python_executable=%%i"
            goto :foundPython
        )
    )
)

:foundPython
if "%python_executable%"=="" (
    echo "Error: Neither 'python' nor 'python3' found in the system. Please install Python 3.10 or 3.11 and try again."
    echo "Ensure that the Python executable is added to the PATH environment variable (See documentation for more information)."
    echo "https://github.com/sdfxai/sdfx?tab=readme-ov-file#windows"
    exit /b 1
)

%python_executable% setup.py --run