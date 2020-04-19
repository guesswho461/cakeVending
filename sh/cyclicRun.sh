#!/bin/sh   
for i in $(seq 1 1 $1)
do  
        echo "cyclic run $i times"
	node $2  
done  
