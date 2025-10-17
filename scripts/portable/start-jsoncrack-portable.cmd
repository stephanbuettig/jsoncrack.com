@echo off
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..
set DIST_DIR=%REPO_ROOT%\dist

if not exist "%DIST_DIR%" (
  echo Portable build directory not found: %DIST_DIR%
  echo Run "pnpm electron:build" before launching the portable app.
  exit /b 1
)

pushd "%DIST_DIR%" >nul 2>&1
if errorlevel 1 (
  echo Unable to access portable build directory: %DIST_DIR%
  exit /b 1
)

set TARGET=
for /f "delims=" %%I in ('dir /b /a:-d /o:-d "*-portable.exe" 2^>nul') do (
  set TARGET=%%I
  goto :found
)

:found
if not defined TARGET (
  popd
  echo No portable executable found in %DIST_DIR%.
  echo Run "pnpm electron:build" to generate the portable artifact.
  exit /b 1
)

set TARGET_PATH=%DIST_DIR%\!TARGET!
popd

echo Launching portable build: %TARGET_PATH%
call "%TARGET_PATH%"
set EXIT_CODE=%ERRORLEVEL%

endlocal & exit /b %EXIT_CODE%
