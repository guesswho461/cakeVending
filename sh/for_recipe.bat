@echo off

for /l %%x in (1, 1, %1) do (
   echo %%x
   node test.js
)

pause