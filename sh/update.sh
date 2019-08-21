sudo systemctl stop nginx.service
tar zxvf fw.tar.gz
rm -rf fw.tar.gz
sudo systemctl restart nginx.service