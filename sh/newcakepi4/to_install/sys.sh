#!/bin/sh

ETH0_CFG_DIR_DST=/etc/
ETH0_CFG_FILE_SRC=./sys/dhcpcd.conf

FIREWALL_CFG_DIR_DST=/etc/network/
FIREWALL_CFG_FILE_DST=/etc/network/iptables
FIREWALL_CFG_FILE_SRC=./sys/iptables

# setup the firewall
[ ! -d $FIREWALL_CFG_DIR_DST ] && sudo mkdir -p $FIREWALL_CFG_DIR_DST
sudo cp $FIREWALL_CFG_FILE_SRC $FIREWALL_CFG_FILE_DST
sudo iptables-restore $FIREWALL_CFG_FILE_DST

# set the eth0 ip is 192.168.1.99 when dhcp fallback
[ ! -d $ETH0_CFG_DIR_DST ] && sudo mkdir -p $ETH0_CFG_DIR_DST
if [ -f $ETH0_CFG_FILE_SRC ]; then
  sudo cp $ETH0_CFG_FILE_SRC $ETH0_CFG_DIR_DST
else
  echo "error: eth0 cfg file is not exists"
fi

# set the resolution, rotate 180, completely blank when boot
sudo cp ./sys/*.txt /boot

# set the 4G
sudo apt -y install ppp pppconfig
sudo cp ./sys/etc_chatscripts_4GLTE /etc/chatscripts/4GLTE
sudo cp ./sys/etc_ppp_pap-secrets /etc/ppp/pap-secrets
sudo cp ./sys/etc_ppp_peers_4GLTE /etc/ppp/peers/4GLTE
sudo cp ./sys/etc_network_interfaces /etc/network/interfaces
sudo cp ./sys/*.rules /etc/udev/rules.d/
sudo udevadm control --reload
sudo cp ./sys/ifup@.service /lib/systemd/system
sudo systemctl daemon-reload

# share the 4G via wifi
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g' /etc/sysctl.conf

# dhcp server
sudo apt -y install dnsmasq
sudo cp ./sys/dnsmasq.conf /etc
sudo cp /etc/resolv.conf /etc/resolv.dnsmasq
sudo sed -i 's/127.0.0.1/192.168.4.1/g' /etc/resolv.dnsmasq
sudo systemctl enable dnsmasq

# wifi hotspot
sudo apt -y install hostapd
sudo cp ./sys/hostapd.conf /etc/hostapd
sudo sed -i 's/#DAEMON_CONF=""/DAEMON_CONF="\/etc\/hostapd\/hostapd.conf"/g' /etc/default/hostapd
sudo systemctl enable hostapd
