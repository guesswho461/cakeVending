tar zcvf fw.tar.gz ../ui2/frontend/build
scp fw.tar.gz pi@172.16.228.5:/home/pi
ssh pi@172.16.228.5 < update.sh
