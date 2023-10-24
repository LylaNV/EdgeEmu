#!/bin/bash

if [ -z "$EDGEEMU_SERVER_PATH" ]
then 
	echo "Error: environment variable EDGEEMU_SERVER_PATH undefined."
	exit -1
fi

jline=$EDGEEMU_SERVER_PATH/libs/jline-2.13.jar
edgeemu=$EDGEEMU_SERVER_PATH/libs/Termite2Server.jar
deps="$jline:$edgeemu"

java -cp $deps pt.inesc.termite.server.Main $@
