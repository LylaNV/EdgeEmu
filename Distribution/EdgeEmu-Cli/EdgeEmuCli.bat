@echo off

if "%EDGEEMU_CLI_PATH%"=="" (
    echo "Error: environment variable EDGEEMU_CLI_PATH undefined."
	goto end
)

set jline=%EDGEEMU_CLI_PATH%\libs\jline-2.13.jar
set commonios=%EDGEEMU_CLI_PATH%\libs\commons-io-2.6.jar
set edgeemu=%EDGEEMU_CLI_PATH%\libs\Termite2-Cli.jar
set deps="%jline%;%commonios%;%edgeemu%"
java -cp %deps% src.main.pt.inesc.termite2.cli.Main %*

:end

