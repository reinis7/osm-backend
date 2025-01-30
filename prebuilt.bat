@echo off
set SOURCE_DIR=%CD%\node_modules\tileserver-gl-styles
set DEST_DIR=%CD%\node_modules\tileserver-gl-light\node_modules\tileserver-gl-styles

:: Check if the destination directory exists, create it if missing
if not exist "%DEST_DIR%" (
    echo Destination directory does not exist. Creating...
    mkdir "%DEST_DIR%"
    :: Copy files if the source directory exists
    if exist "%SOURCE_DIR%" (
        echo Copying files...
        xcopy /E /I "%SOURCE_DIR%" "%DEST_DIR%"
    ) else (
        echo Source directory does not exist. Skipping copy.
    )
)


exit /b 0
