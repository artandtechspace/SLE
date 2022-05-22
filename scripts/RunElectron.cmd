@echo off

rem Moves to the working dir
cd %~dp0
cd ..\build\electron\setup\
call electron .
