# VirtualBox Hacks

## If NTP time lags

In virtual box gues, type

```
sudo VBoxService --timesync-set-threshold 1000
```

```
resetclipvm () {
        op=$(ps -ef | grep VBoxClient | grep clip)
        lines=$(echo $op | wc -l)
        if [ $lines -ne 1 ]
        then
                echo "Got more than one line - $op"
                return 1
        fi
        pid=$(echo $op | awk '{print $2}')
        echo "killing pid: $pid, op:$op"
        kill -9 $pid
        echo "starting again"
        /usr/bin/VBoxClient --clipboard
}
```

# detect if a machine is baremetal of vm

https://www.pc-freak.net/blog/check-server-physical-virtual-machine/

```sh

onyxedge@awsasbaremetal1:/var/opt/magma/configs$ sudo dmesg | grep "Hypervisor detected"
[    0.000000] Hypervisor detected: KVM
onyxedge@awsasbaremetal1:/var/opt/magma/configs$


onyxedge@awsasbaremetal1:/var/opt/magma/configs$ hostnamectl status
   Static hostname: awsasbaremetal1
         Icon name: computer-vm
           Chassis: vm                                   <---   You might see desktop for baremetal
        Machine ID: ec23ef244fa01db178471411db8e9be9
           Boot ID: d6ef0a81f57446168b2d9c3bc7c60d46
    Virtualization: kvm
  Operating System: Ubuntu 20.04.6 LTS
            Kernel: Linux 5.4.0-1105-aws
      Architecture: x86-64
onyxedge@awsasbaremetal1:/var/opt/magma/configs$


# none for bare metal
onyxedge@awsasbaremetal1:/var/opt/magma/configs$ sudo systemd-detect-virt
kvm
onyxedge@awsasbaremetal1:/var/opt/magma/configs$

```


# KVM

## virsh

* https://libvirt.org/sources/virshcmdref/html-single/
* https://blog.programster.org/kvm-cheatsheet

```sh

export LIBVIRT_DEFAULT_URI="qemu:///system"

virt-host-validate

virsh nodeinfo
virsh domcapabilities | less
# get the sizes of disk
virsh domstats <vm-name>
virsh net-info default
virsh net-dumpxml default
# bring interface down for a running vm
virsh domif-setlink <vm-name> <mac-addr> up    #  add --config if you want to this go to xml as well (persistent)
virsh domif-setlink <vm-name> <mac-addr> down

virsh start <vm-name>
virsh shutdown <vm-name>
virsh destroy <vm-name>
virsh undefine <vm-name>
virsh undefine <vm-name>
virsh undefine --remove-all-storage <vm-name>
virsh undefine --nvram --remove-all-storage <vm-name>

virsh dumpxml <vm-name>  > /some/file
virsh define /path/to/xml

virt-clone --original $oldvm --name $newvm --auto-clone

## set / unset autostart of vm
virsh autostart $vmname
virsh autostart --disable $vmname

#list all vm's
virsh list --all
##  list those with autostart enabled
virsh list --all --autostart

#list all networks
virsh net-list --all
#get info of a network
virsh net-dumpxml <name>
virsh net-info <name>

#start a network
virsh net-start <name>
#start on m/c reboot(kvm start)
virsh net-autostart --network <name>

virsh net-destory <name>
virsh net-undefine <name>

# search dhclient
virsh net-dhcp-leases --network <net-name>

virsh pool-list --all
virsh pool-info <pool-name>

virsh vol-list <pool-name>
virsh vol-delete --pool <pool-name> <vol-name>

## increase memory
 virsh dominfo hemanth
 virsh setmaxmem hemanth 16G --config
 virsh setmem hemanth 16G --config

# gui
virt-manager

```

## virt-install

```sh

## to install kvm search for qemu-kvm



## create a new vm
vmname=mynewvm
osvariant=ubuntu20.04   ## use `virt-install --os-variant list` to find options
cpu=4
ram=16384               ## in KB
image_path=/path/to/iso
bridge=virbr0
hdsize=256              ## in GB
virt-install --name=${vmname} --os-variant=${osvariant} \
             --vcpu=${cpu} --ram=${ram} --graphics vnc \
             --cdrom=${image_path} --network bridge=${bridge},model=virtio \
             --disk size=${hdsize}


## todelete:
vmname=mynewvm
virsh destroy $vmname
virsh undefine --remove-all-storage --nvram $vmname


#import from a qcow2 .. note the imported qcow2 will be used.
# if you want to start from a backup and still have the backup
# your should cp your backup first and then import from the new file!
## copy the image
vmname=mynewimportedvm
src_path=.../wherever/source.qcow2
target_path=/var/lib/libvirt/images/${vmname}.qcow2
sudo qemu-img convert -O qcow2 $src_path $target_path
#sudo cp $src_path $target_path

osvariant=ubuntu20.04
cpu=4
ram=16384    ## in KB
importimage=$target_path     ## W-A-R-N-I-N-G: copy from your source image. This will be the img of the new VM
bridge=virbr0
graphics=none   # or vnc if u want
virt-install --name=${vmname} --os-variant=${osvariant} \
             --vcpu=${cpu} --ram=${ram} --graphics ${graphics} \
             --disk ${importimage},bus=sata --import --network bridge=${bridge},model=virtio \
             --noautoconsole
## args
##   --name=<name>         .. name
##   --description=<str>   .. description
##   --vpcu=<num>          .. num cpus
##   --ram=<value>         .. ran in KB
##   --graphics <none|vnc>
##   --graphics vnc,listen=0.0.0.0,port=5921   .. listen on the chosen port
##   --cdrom=${image_path}
##   --location ftp://...iso
##   --network bridge=${bridge},model=virtio          <-- simply repeat this for a second interf with a diff bridge
##   --disk=${hd-path}     .. path to image disk, use --disk none to avoid creating a disk
##   --import              .. import from the disk
##   --noautoconsole       .. will avoid the console, and return immediately
##   --extra-args='console=ttyS0,115200n8 serial'
##   --boot uefi
##   --boot loader=/usr/share/OVMF/OVMF_CODE.fd,loader_ro=yes,loader_type=pflash,nvram_template=/usr/share/OVMF/OVMF_VARS.fd
##   --watchdog i6300esb,action=reset
##   --print-xml [STEP]    .. USEFUL TO GET XML AND NOT START VM!!
##                         .. step is 1/2 if (--cdrom, --location, --pxe or --install) AND (withouth --no-install) is used.
##                         .. you probably want 1st step, define it.. and once done, explicitly remove the cd/onreboot-destory elements later

## To create a nvme disk:

##            --qemu-commandline="-drive file=${target_path},format=raw,if=none,id=NVME1" \
##            --qemu-commandline='-device nvme,drive=NVME1,serial=nvme1' \
```

* note for uefi build , we have to install `sudo apt install ovmf`

* notes on emulating various block devices
    * https://blogs.oracle.com/linux/post/how-to-emulate-block-devices-with-qemu


### To replace xml args during install

search: spice

https://unix.stackexchange.com/a/620880

```
    --xml 'xpath.delete=./devices/graphics' \
    --xml './devices/graphics/@defaultMode=insecure' \
    --xml './devices/graphics/@autoport=no' \
    --xml './devices/graphics/@type=spice' \
    --xml "./devices/graphics/@port=20001"
```

## create a new network

. network.xml
```xml
<network>
  <name>tr0second</name>
  <uuid>a67395a7-dda8-4a97-8bee-75ae9c30ee46</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='tr0second' stp='on' delay='0'/>
  <mac address='52:54:00:df:14:7b'/>
  <ip address='192.168.123.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.123.10' end='192.168.123.100'/>
    </dhcp>
  </ip>
</network>
```

* Bridged network
  * Not clear - in this mode, looks like kvm wont create the bridge itself.
```xml
<network>
  <name>br0</name>
  <forward mode='bridge'/>
  <bridge name='br0'/>
</network>
```

* Routed mode
```xml
<network>
  <name>routeds1</name>
  <forward mode='route' dev='br1'/>
  <bridge name='routeds1' stp='on' delay='2'/>
  <ip address='10.0.3.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='10.0.3.5' end='10.0.3.10'/>
    </dhcp>
  </ip>
</network>

```



```sh
virsh net-define network.xml
virsh net-start tr0second
virsh net-autostart tr0second
```

## attach a cd to a running vm

* Create a xml
```xml
    <disk type='file' device='cdrom'>
      <driver name='qemu'/>
      <target dev='sda' bus='sata'/>
      <source file='/path/to/your/file.iso'/>
      <readonly/>
    </disk>
```
* and


```sh
virsh update-device vmname file_with_details.xml

##or
vmname=
PATH=
virsh update-device $vmname <(cat <<EOF
<disk type='file' device='cdrom'>
  <driver name='qemu'/>
  <target dev='sda' bus='sata'/>
  <source file='$PATH'/>
  <readonly/>
</disk>
EOF
)

```

* you may have to `virsh edit vmname` and adjust boot settings

### Althernate commands


```sh
iso_path=/tmp/ipxe.iso
virsh attach-disk $vmname $iso_path hda --config --type cdrom --mode readonly

# attach host device
virsh attach-disk $vmname /dev/sr0 hdc --config --type cdrom

```


## qemu-img

```
args:
-p        ---   show progress
-n        ---   write to an existing image instead of a new one

```


* information on a qcow2
```sh
qemu-img info $file

```


* compress a qcow2 .. requires sudo permission

```sh
src_image=/var/lib/libvirt/iamges/auto_orc8vm.qcow2
dst_image=$HOME/compressed.qcow2
sudo qemu-img convert -O qcow2 ${src_image} ${dst_image}
```

* increase size of a image

```sh
sudo qemu-img resize /var/lib/libvirt/images/whatever.qcow2 +10G
```

* create a raw image file

```sh
image_name=path/to/image.raw
sudo qemu-img create -f raw ${image_name} 128G
```



* attach a network after starting the vm
```sh
# this adds when the vm is down.
## remove --config if the vm is running (not sure how the guest os will respond though).
virsh attach-interface --domain lakshmantrfvm --type bridge \
        --source virbr0 --model virtio \
        --mac 52:54:00:4b:73:5f --config


```

* attach a disk to a vm

```sh
virsh attach-disk ${vmname} --source ${diskfile} --target vdb --persistent

```

## mounting a qcow2

```sh

## check if module is already there
lsmod | grep nbd

## load the module if needed
modprobe nbd max_part=8

## connect qcow2
qemu-nbd --connect=/dev/nbd0 /path/to/your/qcow2.img

## find the partition name..
fdisk /dev/nbd0 -l
## or
lsblk

## mount
mount /dev/nbd0p1 /mnt/somepoint/

## once done: cleanup
umount /mnt/somepoint/
qemu-nbd --disconnect /dev/nbd0
rmmod nbd

```



## snapshots

```sh
#shut first
virsh shutdown freebsd
virsh snapshot-create-as --domain freebsd \
    --name "5Sep2016_S1" \
    --description "My First Snapshpot"

#continue running
virsh start freebsd

# list snapshots
virsh snapshot-list --domain freebsd
# detailed view of one snaphost
virsh snapshot-info --domain freebsd --snapshotname 5Sep2016_S1

#revert to a snapshot
virsh shutdown --domain freebsd
virsh snapshot-revert --domain freebsd --snapshotname 5Sep2016_S1 --running

#delete a snapshot
virsh snapshot-delete --domain freebsd --snapshotname 5Sep2016_S2

```


## Boot order

* Under the devices block, call this out:
  * This is better as you can call our order even among hard-drives
```
    <disk type='file' device='cdrom'>
      <driver name='qemu'/>
      <target dev='sda' bus='sata'/>
      ...
      <boot order='1'/>
    </disk>
```
* Or, you can call out type-order in os-block (good enuf if you have one instance of each):
```
<os>
  <type>hvm</type>
  <loader>/usr/lib/xen/boot/hvmloader</loader>
  <boot dev='network'/>
  <boot dev='cdrom'/>
  <boot dev='hd'/>
  <bootmenu enable='yes'/>
</os>
```

## adjust memory of a guest

```sh
virsh setmem <vm name> 16G --live
virsh setmaxmem <vm name> 16G --config
virsh setmem <vm name> 16G --config

```


## Put in a image-file as usb device

```
virsh attach-disk vmName --source /path/to/imagefile.raw --targetbus usb --target hda --cache none
virsh detach-disk vmName /path/to/imagefile.raw
```
* Genreated xml:
```
    <disk type='file' device='disk'>
      <driver name='qemu' type='raw' cache='none'/>
      <source file='/home/lakshman/tr0-images/lakshmanTr0BuilderBootDiskImage.raw' index='4'/>
      <backingStore/>
      <target dev='hda' bus='usb'/>
      <alias name='usb-disk0'/>
      <address type='usb' bus='0' port='2'/>
    </disk>
```

## networks

References: https://linuxconfig.org/how-to-use-bridged-networking-with-libvirt-and-kvm

* natted mode

```xml
<network>
  <name>tr0second</name>
  <uuid>a67395a7-dda8-4a97-8bee-75ae9c30ee46</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='tr0second' stp='on' delay='0'/>
  <mac address='52:54:00:df:14:7b'/>
  <ip address='192.168.124.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.124.10' end='192.168.124.100'/>
    </dhcp>
  </ip>
</network>
```

* bridged mode

```xml
<network>
    <name>bridged-network</name>
    <forward mode="bridge" />
    <bridge name="br0" />
</network>
```

```sh
virsh net-define network.xml
```


## guest agent

Install on guest
```sh
apt install -y qemu-guest-agent
```
then run this on host:
```sh
vmname=...
vmname=test_vm
virsh qemu-agent-command $vmname '{"execute":"guest-network-get-interfaces"}'

##or
virsh domifaddr --source agent lakshmanAgw

## execute any random command -- 2 stage thing
virsh qemu-agent-command $vmname   '{"execute": "guest-exec", "arguments": { "path": "apt", "arg": [ "install","cowsay","-y" ], "capture-output": true }}'  --pretty
## that gives you the pid of the prcess. you have to now get the result of the pid
virsh qemu-agent-command $vmname   '{"execute": "guest-exec-status", "arguments": { "pid": 1993 }}' --pretty
## and do base64 decode to get both stdout/stderr

```


* confirm if a guest has agent channel enabled:

```sh
vm_name=whatever
virsh dumpxml $vm_name | sed -n '/<channel/,/channel>/ p'

```

## install kvm

```sh
sudo apt install -y qemu qemu-kvm qemu-utils libvirt-daemon libvirt-daemon-system libvirt-clients bridge-utils virt-manager dnsmasq libosinfo-bin cpu-checker virt-viewer qemu-efi ovmf
sudo reboot

```

## install a macvtap


https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#macvtap_ipvtap
https://www.ibm.com/docs/en/linux-on-systems?topic=configurations-kvm-guest-virtual-network-configuration-using-macvtap

ip link add link eth0 macvlan0 type macvlan mode bridge

```

<interface type="direct">
  <mac address="12:34:56:78:9a:bc"/>
  <source dev="o5s_10g_1" mode="bridge"/>
  <model type="virtio"/>
  <driver name="vhost"/>
</interface>

```

## sriov

https://www.intel.com/content/www/us/en/developer/articles/technical/configure-sr-iov-network-virtual-functions-in-linux-kvm.html

option-1 : direct pci using hostdev

```xml
    <hostdev mode='subsystem' type='pci' managed='yes'>
      <source>
        <address domain='0x0000' bus='0x19' slot='0x01' function='0x0'/>
      </source>
    </hostdev>
```

option-2 : passthrough interface using name

```xml
<devices>
   <interface type='direct'>
      <source dev='enp3s16f1' mode='passthrough'/>
   </interface>
</devices>
```

option-3: create a network first , and add a interface into the network

```xml
<network>
 <name>sr-iov-net-40G-XL710</name>
 <forward mode='hostdev' managed='yes'>
  <pf dev='ens802f0'/>
 </forward>
</network>
```

```xml
<interface type='network'>
  <source network='sr-iov-net-40G-XL710'/>
</interface>
```

## pinning cpu

* https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/5/html/virtualization/ch33s08#idm140366063444128

```

## its just a matter  of adding cpuset to the vcpu item in xml
<vcpus cpuset='4-7'>4</vcpus>

## to dump the current cpus/pin info
virsh vcpuinfo <dom-name>

## to pin vcpu to a set of cpus
##  virsh vcpupin <domname> <vcpu> <hostcpu>
virsh vcpupin guest1 0 4

```


# secure linux

search : modprobe permitted

```sh

#install pkg
sudo apt-get install mokutil

#verify state
mokutil --sb-state

#enable modification
# give exactly this password - 12345678
sudo mokutil --disable-validation

## reboot press any key
## on prompt type the individual letters of the passwd
## disable.


```

# ubuntu install from cloud image


ubuntu images -https://cloud-images.ubuntu.com/focal/current/

* Prepare a cloud-init user-data
* To understand how to get this - you have to study the cloud-data-sensitive logs generated in a
  spinned up image.

```sh
second_disk_src=/home/gxcautotest/lakshman/from_official_ubuntu_qcow2/user-data.src
cat >${second_disk_src} <<EOF
#cloud-config
ssh_pwauth: True
password: onyxedge
chpasswd: { expire: False }
hostname: onyxedge-agw
system_info:
  default_user:
    gecos: Ubuntu
    groups:
      - adm
      - audio
      - cdrom
      - dialout
      - dip
      - floppy
      - lxd
      - netdev
      - plugdev
      - sudo
      - video
    lock_passwd: False
    name: onyxedge
    shell: /bin/bash
    sudo:
      - "ALL=(ALL) NOPASSWD:ALL"
EOF
```

```sh
## copy the cloud image downloaded to your vm-img. This will be its hard-disk
## you will have to increase the qcow if you want to at this stage. - TODO
vmname=ubuntu_imported
src_path=/home/gxcautotest/lakshman/from_official_ubuntu_qcow2/focal-server-cloudimg-amd64.img
target_path=/var/lib/libvirt/images/${vmname}.qcow2
sudo cp $src_path $target_path

## optional -- whatever size.. it gets auto-reized .. how cool is that.
sudo qemu-img resize ${target_path} +20G

## prepare a iso image of the cloud-data
second_disk=/home/gxcautotest/lakshman/from_official_ubuntu_qcow2/user-data.img
second_disk_src=/home/gxcautotest/lakshman/from_official_ubuntu_qcow2/user-data.src
cloud-localds ${second_disk} ${second_disk_src}

vmname=ubuntu_imported
osvariant=ubuntu20.04
cpu=2
ram=8192
importimage=${target_path}
bridge=virbr0
graphics=vnc
virt-install --name=${vmname} --os-variant=${osvariant} \
             --vcpu=${cpu} --ram=${ram} --graphics ${graphics} \
             --disk ${importimage},bus=sata --disk path=${second_disk},format=raw --import --network bridge=${bridge},model=virtio \
             --noautoconsole

vncof ${vmname}

vmname=ubuntu_imported
virsh destroy $vmname
virsh undefine --remove-all-storage $vmname
```



# vagrant stuff

```sh
#list all vms
vagrant status

# power up a vm
vagrant up vmname

## dump ssh config
vagrant ssh-config vmname

## stop a vm
vagrant halt vmname

## delete a vm fully
vagrant destroy vmname

```

# vboxmanage

References: https://networkengineer.me/2014/07/11/more-than-4-network-cards-in-virtualbox/

```sh

"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm ubuntu

vboxmanage list vms

vboxmanage showvminfo ubuntu

vboxmanage startvm ubuntu

vboxmanage controlvm NAMEOFVM poweroff

vboxmanage unregistervm NAMEOFVM --delete


#bridge-adapter
VBoxManage modifyvm network-test --nic5 bridged
VBoxManage modifyvm network-test --bridgeadapter5 "eth1"

#hostonly
VBoxManage modifyvm network-test --nic5 hostonly
VBoxManage modifyvm network-test --hostonlyadapter5 "vboxnet0"

#nat
VBoxManage modifyvm network-test --nic5 nat

#internal network
VBoxManage modifyvm network-test --nic5 intnet
VBoxManage modifyvm network-test --intnet5 "test01"

VBoxManage modifyvm network-test --nicpromisc5 allow-all
VBoxManage modifyvm network-test --nictype5 82545EM
VBoxManage modifyvm network-test --cableconnected5 off

```

## Getting console for a virtual box console

```sh
## Add a console to the vm
vboxmanage modifyvm vm_name --uart1 0x3F8 4  --uartmode1 server /tmp/magma_dev_pip1

## Add a socat piping the unix-socket above to pty
socat UNIX-CONNECT:/tmp/magma_dev_pip1 PTY,link=/tmp/magma_dev_pip1-pty &

## now start a pty reader program like screen
screen /tmp/magma_dev_pip1-pty


## Note: If you exit screen somehow it doesn't reconnect again. Just kill/start socat again and it seems to work

```
links:
* https://gist.github.com/snb/284940/11e6354f170be602c9c2f67b59d489ed49ebd143
* https://www.linuxquestions.org/questions/slackware-14/virtualbox-serial-port-setup-frustration-586971/


# proxmox

```sh

## list all vms
qm list

## list settings of one vm
qm config <vmid>
## or just cat /etc/pve/qemu-server/<vmid>.conf

## add a termial to a vm (when its off)
qm set 103 -serial0 socket

## open the terminal
qm terminal 103

## show the kvm commands
qm showcmd 103

## monitor --> place hwere you can type other commands
qm monitor <vmid>
## command eg:
## change vnc password

## force shut a vm
qm stop <vmid>

## start a vm
qm start <vmid>

## extra vnc access: https://pve.proxmox.com/wiki/VNC_Client_Access
## In  /etc/pve/local/qemu-server/<VMID>.conf,
args: -vnc 0.0.0.0:5977

## Grab.. untested
### create a backup of a existing vm
vzdump <VMID> --mode stop --compress zstd --storage local
### and Copy the vzdump-qemu-<VMID>-<date>.vma.zst to wherever you want

### resotre a vm from a disk image
qmrestore /var/lib/vz/dump/vzdump-qemu-<VMID>-<date>.vma.zst <new-VMID> --storage local-lvm

```


# setting up vnc on a desktop ubuntu

install mate
```sh
sudo apt update
sudo apt install -y ubuntu-mate-desktop mate-session-manager mate-desktop-environment-core

sudo apt install -y tightvncserver


```



* contents of `~/.vnc/xstartup`
```sh

mkdir -p $HOME/.vnc
cat <<'EOF' > $HOME/.vnc/xstartup
#!/bin/bash

# Load .Xresources if it exists
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources

# Set background
xsetroot -solid grey

# Get the correct UID for this user
USER_UID=$(id -u)

# Set up ICE authority file in the user's home directory
export ICEAUTHORITY="$HOME/.ICEauthority"

# Set up D-Bus and XDG environment
export XDG_RUNTIME_DIR="/tmp/runtime-$USER"
export DBUS_SESSION_BUS_ADDRESS="unix:path=$XDG_RUNTIME_DIR/bus"

# Create runtime directory
mkdir -p $XDG_RUNTIME_DIR
chmod 700 $XDG_RUNTIME_DIR

# Start D-Bus session
dbus-launch --sh-syntax > /tmp/dbus-session-$USER
source /tmp/dbus-session-$USER

# Environment variables for MATE
export XKL_XMODMAP_DISABLE=1
export DESKTOP_SESSION=mate
export XDG_CURRENT_DESKTOP=MATE
export XDG_SESSION_DESKTOP=mate

# Start MATE session
exec mate-session
EOF
chmod +x $HOME/.vnc/xstartup

## install chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install google-chrome-stable

```


```sh
vncserver -kill :2
vncserver :2

## to use different passwd
vncpaswd .vnc/another_passwd_file
vncserver :2 -rfbauth ~/.vnc/another_passwd_file


```

