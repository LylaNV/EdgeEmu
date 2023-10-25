@echo off

if "%EDGEEMU_SERVER_PATH%"=="" (
    echo "Error: environment variable EDGEEMU_SERVER_PATH undefined."
	goto end
)

set jline=%EDGEEMU_SERVER_PATH%\libs\jline-2.13.jar
set edgeemu=%EDGEEMU_SERVER_PATH%\libs\Termite2Server.jar
set deps="%jline%;%edgeemu%"
java -cp %deps% pt.inesc.termite.server.Main %*

:end