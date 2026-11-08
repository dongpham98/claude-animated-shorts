@echo off
rem Titanic vertical Shorts (3 x 1080x1920). Safe to re-run: finished parts are skipped. Each part retries up to 3 times.
cd /d C:\YouTube\titanic-pilot
set BROWSER=C:\YouTube\browser\chrome-headless-shell\win64-133.0.6943.141\chrome-headless-shell-win64\chrome-headless-shell.exe
if not exist out\shorts mkdir out\shorts
if exist out\shorts\render_error.txt del out\shorts\render_error.txt
echo %date% %time% shorts render started >> out\shorts\render_log.txt
echo rules: part 1 of 2 ...
call :part TitanicShortRules rules1 0 999 || goto fail
echo rules: part 2 of 2 ...
call :part TitanicShortRules rules2 1000 1777 || goto fail
if exist out\shorts\rules_list.txt del out\shorts\rules_list.txt
echo file 'rules1.mp4'>> out\shorts\rules_list.txt
echo file 'rules2.mp4'>> out\shorts\rules_list.txt
call npx remotion ffmpeg -y -f concat -safe 0 -i out\shorts\rules_list.txt -i public\titanic_short_rules.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest out\shorts\titanic_short_rules.mp4 || goto fail
echo %date% %time% rules done >> out\shorts\render_log.txt
echo oneback: part 1 of 2 ...
call :part TitanicShortOneBack oneback1 0 999 || goto fail
echo oneback: part 2 of 2 ...
call :part TitanicShortOneBack oneback2 1000 1645 || goto fail
if exist out\shorts\oneback_list.txt del out\shorts\oneback_list.txt
echo file 'oneback1.mp4'>> out\shorts\oneback_list.txt
echo file 'oneback2.mp4'>> out\shorts\oneback_list.txt
call npx remotion ffmpeg -y -f concat -safe 0 -i out\shorts\oneback_list.txt -i public\titanic_short_oneback.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest out\shorts\titanic_short_oneback.mp4 || goto fail
echo %date% %time% oneback done >> out\shorts\render_log.txt
echo law: part 1 of 3 ...
call :part TitanicShortLaw law1 0 999 || goto fail
echo law: part 2 of 3 ...
call :part TitanicShortLaw law2 1000 1999 || goto fail
echo law: part 3 of 3 ...
call :part TitanicShortLaw law3 2000 2278 || goto fail
if exist out\shorts\law_list.txt del out\shorts\law_list.txt
echo file 'law1.mp4'>> out\shorts\law_list.txt
echo file 'law2.mp4'>> out\shorts\law_list.txt
echo file 'law3.mp4'>> out\shorts\law_list.txt
call npx remotion ffmpeg -y -f concat -safe 0 -i out\shorts\law_list.txt -i public\titanic_short_law.m4a -map 0:v -map 1:a -c:v copy -c:a copy -shortest out\shorts\titanic_short_law.mp4 || goto fail
echo %date% %time% law done >> out\shorts\render_log.txt
echo DONE > out\shorts\render_done.txt
echo %date% %time% ALL DONE >> out\shorts\render_log.txt
echo ALL DONE: C:\YouTube\titanic-pilot\out\shorts
exit /b 0
:part
if exist out\shorts\%2.mp4 exit /b 0
set TRY=0
:again
set /a TRY+=1
echo %date% %time% %2 try %TRY% start >> out\shorts\render_log.txt
call npx remotion render src/index.ts %1 out\shorts\%2.tmp.mp4 --frames=%3-%4 --muted --codec=h264 --crf=17 --gl=angle --concurrency=2 --timeout=600000 --browser-executable="%BROWSER%"
if errorlevel 1 (
  echo %date% %time% %2 try %TRY% FAILED >> out\shorts\render_log.txt
  if %TRY% LSS 3 goto again
  exit /b 1
)
move /y out\shorts\%2.tmp.mp4 out\shorts\%2.mp4 >nul
echo %date% %time% %2 done >> out\shorts\render_log.txt
exit /b 0
:fail
echo RENDER FAILED - see out\shorts\render_log.txt > out\shorts\render_error.txt
echo RENDER FAILED. Leave this window open and tell Claude.
pause
exit /b 1
