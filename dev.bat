@echo off

start cmd /c npm run watch
start cmd /c npm run watch-test
call npm run test

pause