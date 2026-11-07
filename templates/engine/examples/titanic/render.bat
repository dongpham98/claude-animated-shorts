@echo off
rem Titanic's Lifeboats - full video render in 21 small parts. Safe to re-run: finished parts are skipped.
rem Each part retries up to 3 times by itself. Progress is written to out\render_log.txt
cd /d C:\YouTube\titanic-pilot
set BROWSER=C:\YouTube\browser\chrome-headless-shell\win64-133.0.6943.141\chrome-headless-shell-win64\chrome-headless-shell.exe
if not exist out mkdir out
if exist out\render_error.txt del out\render_error.txt
echo %date% %time% render started >> out\render_log.txt
echo Rendering part 1 of 21 ...
call :part 01 0 999 || goto fail
echo Rendering part 2 of 21 ...
call :part 02 1000 1999 || goto fail
echo Rendering part 3 of 21 ...
call :part 03 2000 2999 || goto fail
echo Rendering part 4 of 21 ...
call :part 04 3000 3999 || goto fail
echo Rendering part 5 of 21 ...
call :part 05 4000 4999 || goto fail
echo Rendering part 6 of 21 ...
call :part 06 5000 5999 || goto fail
echo Rendering part 7 of 21 ...
call :part 07 6000 6999 || goto fail
echo Rendering part 8 of 21 ...
call :part 08 7000 7999 || goto fail
echo Rendering part 9 of 21 ...
call :part 09 8000 8999 || goto fail
echo Rendering part 10 of 21 ...
call :part 10 9000 9999 || goto fail
echo Rendering part 11 of 21 ...
call :part 11 10000 10999 || goto fail
echo Rendering part 12 of 21 ...
call :part 12 11000 11999 || goto fail
echo Rendering part 13 of 21 ...
call :part 13 12000 12999 || goto fail
echo Rendering part 14 of 21 ...
call :part 14 13000 13999 || goto fail
echo Rendering part 15 of 21 ...
call :part 15 14000 14999 || goto fail
echo Rendering part 16 of 21 ...
call :part 16 15000 15999 || goto fail
echo Rendering part 17 of 21 ...
call :part 17 16000 16999 || goto fail
echo Rendering part 18 of 21 ...
call :part 18 17000 17999 || goto fail
echo Rendering part 19 of 21 ...
call :part 19 18000 18999 || goto fail
echo Rendering part 20 of 21 ...
call :part 20 19000 19999 || goto fail
echo Rendering part 21 of 21 ...
call :part 21 20000 20090 || goto fail
echo Joining parts and adding the sound ...
cd out
if exist list.txt del list.txt
echo file 'p01.mp4'>> list.txt
echo file 'p02.mp4'>> list.txt
echo file 'p03.mp4'>> list.txt
echo file 'p04.mp4'>> list.txt
echo file 'p05.mp4'>> list.txt
echo file 'p06.mp4'>> list.txt
echo file 'p07.mp4'>> list.txt
echo file 'p08.mp4'>> list.txt
echo file 'p09.mp4'>> list.txt
echo file 'p10.mp4'>> list.txt
echo file 'p11.mp4'>> list.txt
echo file 'p12.mp4'>> list.txt
echo file 'p13.mp4'>> list.txt
echo file 'p14.mp4'>> list.txt
echo file 'p15.mp4'>> list.txt
echo file 'p16.mp4'>> list.txt
echo file 'p17.mp4'>> list.txt
echo file 'p18.mp4'>> list.txt
echo file 'p19.mp4'>> list.txt
echo file 'p20.mp4'>> list.txt
echo file 'p21.mp4'>> list.txt
call npx remotion ffmpeg -y -f concat -safe 0 -i list.txt -i ..\public\titanic_full_mix.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest titanic_lifeboats.mp4 || goto fail
echo DONE > render_done.txt
echo %date% %time% ALL DONE >> render_log.txt
echo.
echo ALL DONE: C:\YouTube\titanic-pilot\out\titanic_lifeboats.mp4
exit /b 0
:part
if exist out\p%1.mp4 exit /b 0
set TRY=0
:again
set /a TRY+=1
echo %date% %time% part %1 try %TRY% start >> out\render_log.txt
call npx remotion render src/index.ts TitanicFull out\p%1.tmp.mp4 --frames=%2-%3 --muted --codec=h264 --crf=17 --gl=angle --concurrency=2 --timeout=600000 --browser-executable="%BROWSER%"
if errorlevel 1 (
  echo %date% %time% part %1 try %TRY% FAILED >> out\render_log.txt
  if %TRY% LSS 3 goto again
  exit /b 1
)
move /y out\p%1.tmp.mp4 out\p%1.mp4 >nul
echo %date% %time% part %1 done >> out\render_log.txt
exit /b 0
:fail
echo RENDER FAILED - see out\render_log.txt > out\render_error.txt
echo RENDER FAILED. Leave this window open and tell Claude.
pause
exit /b 1
