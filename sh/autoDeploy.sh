tar zcvf fw.tar.gz ../ui/client/build ../ui/server ../recipes
scp fw.tar.gz pi@172.16.228.4:/home/pi
ssh pi@172.16.228.4 < update.sh