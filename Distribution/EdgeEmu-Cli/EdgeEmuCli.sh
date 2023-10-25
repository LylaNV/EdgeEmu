#!/bin/bash

if [ -z "$EDGEEMU_CLI_PATH" ]
then 
	echo "Error: environment variable EDGEEMU_CLI_PATH undefined."
	exit -1
fi

jline=$EDGEEMU_CLI_PATH/libs/jline-2.13.jar
commonios=$EDGEEMU_CLI_PATH/libs/commons-io-2.6.jar
edgeemu=$EDGEEMU_CLI_PATH/libs/Termite2-Cli.jar
deps="$jline:$commonios:$edgeemu"

java -cp $deps src.main.pt.inesc.termite2.cli.Main $@
