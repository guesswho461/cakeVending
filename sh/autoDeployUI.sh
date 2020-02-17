tar zcvf fw.tar.gz ../ui/client/build ../ui/server
scp fw.tar.gz pi@192.168.1.99:/home/pi
ssh pi@192.168.1.99 < update.sh