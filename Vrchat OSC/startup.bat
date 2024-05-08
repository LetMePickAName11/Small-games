@echo off
setlocal

set SERVER_URL=http://localhost:3000/heartbeat
set /a TIMEOUT=1
set /a MAX_ATTEMPTS=10

echo Starting Node server...
start cmd /K "cd "OSC Vrchat server" && npm run test"

echo Waiting for Node server to start...

:wait_for_server
echo Attempt %TIMEOUT% of %MAX_ATTEMPTS% to connect to the server...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%SERVER_URL%' -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if %ERRORLEVEL% == 0 (
    echo Node server is up.
    goto start_client
)

if %TIMEOUT% == %MAX_ATTEMPTS% (
    echo Server did not start in time.
    pause
    exit /b 1
)

timeout /t 2 /nobreak > nul
set /a TIMEOUT+=1
goto wait_for_server

:start_client
echo Starting Angular client...
start cmd /K "cd "OSC GUI" && ng serve"

endlocal