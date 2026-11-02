@echo off
rem Lists the streams (audio/video) of every lecture in lectures.txt, without downloading anything.
cd /d "%~dp0"
set "PY=%USERPROFILE%\anaconda3\python.exe"
if not exist "%PY%" set "PY=python"
set "PATH=%USERPROFILE%\anaconda3;%USERPROFILE%\anaconda3\Library\bin;%USERPROFILE%\anaconda3\Scripts;%PATH%"
echo Checking titles...
"%PY%" -m yt_dlp --cookies cookies.txt --print "%%(title)s %%(id)s" -a lectures.txt > titles.txt 2>&1
echo Checking streams...
"%PY%" -m yt_dlp --cookies cookies.txt -F -a lectures.txt > streams.txt 2>&1
echo.
echo Done: titles.txt and streams.txt are in this folder. Tell Claude.
pause
