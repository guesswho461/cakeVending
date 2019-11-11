tar zcvf fw.tar.gz ../ui/client/build
scp fw.tar.gz pi@172.16.228.4:/home/pi
ssh pi@172.16.228.4 < update.sh