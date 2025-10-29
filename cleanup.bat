@echo off
echo Cleaning up build files...
echo.

echo [1/3] Deleting .next folder...
if exist .next rmdir /s /q .next
echo Done!
echo.

echo [2/3] Deleting node_modules...
if exist node_modules rmdir /s /q node_modules
echo Done!
echo.

echo [3/3] Reinstalling dependencies...
call npm install
echo Done!
echo.

echo ========================================
echo Cleanup complete! Now run: npm run dev
echo ========================================
pause
