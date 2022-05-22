@echo off

rem Moves to the working dir
cd %~dp0 && ^
cd ..  && ^

rem Deletes any previously compiled code
rmdir build\electron\ /S /Q  && ^

rem Compiles the typescript of the project
call tsc --outDir build\electron\application\ && ^

rem Compiles the scss of the project
call node-sass --include-path scss src/styles/Main.scss build/electron/resources/main.css && ^

rem Copies the electron integration code
xcopy /E /I src\resources\ build\electron\resources\ && ^
mkdir build\electron\setup\ && ^
xcopy /E /I src\electron\ build\electron\setup\ && ^

rem Copies the webpage
copy src\index.html build\electron\index.html
