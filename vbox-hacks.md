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

#list all vm's
virsh list

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

## create a new vm
vmname=mynewvm
osvariant=ubuntu20.04   ## use virt-install --os-variant list to find options
cpu=4
ram=16384               ## in KB
image_path=/path/to/iso
bridge=virbr0
hdsize=256              ## in GB
virt-install --name=${vmname} --os-variant=${osvariant} \
             --vcpu=${cpu} --ram=${ram} --graphics vnc \
             --cdrom=${image_path} --network bridge=${bridge},model=virtio \
             --disk size=${hdsize}

# gui
virt-manager

#import from a qcow2 .. note the imported qcow2 will be used.
# if you want to start from a backup and still have the backup
# your should cp your backup first and then import from the new file!
vmname=mynewimportedvm
osvariant=ubuntu20.04
cpu=4
ram=16384    ## in KB
importimage=/path/to/import.qcow2
bridge=virbr0
virt-install --name=${vmname} --os-variant=${osvariant} \
             --vcpu=${cpu} --ram=${ram} --graphics vnc \
             --disk ${importimage},bus=sata --import --network bridge=${bridge},model=virtio
             --noautoconsole
## args
##   --name=<name>         .. name
##   --description=<str>   .. description
##   --vpcu=<num>          .. num cpus
##   --ram=<value>         .. ran in KB
##   --graphics <none|vnc>
##   --cdrom=${image_path}
##   --location ftp://...iso
##   --network bridge=${bridge},model=virtio
##   --disk=${hd-path}     .. path to image disk
##   --import              .. import from the disk
##   --noautoconsole       .. will avoid the console, and return immediately
##   --extra-args='console=ttyS0,115200n8 serial'
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



* xml snippet to add a cdrom-device (or just add a iso)

```
    <disk type='file' device='cdrom'>
      <driver name='qemu'/>
      <target dev='sda' bus='sata'/>
      <source file='/path/to/your/file.iso'/>         <!-- Mostly this is what you should add -->
      <readonly/>
      <alias name='sata0-0-0'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
```

* attach a network after starting the vm
```sh
# this adds when the vm is down.
## remove --config if the vm is running (not sure how the guest os will respond though).
virsh attach-interface --domain lakshmantrfvm --type bridge \
        --source virbr0 --model virtio \
        --mac 52:54:00:4b:73:5f --config


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
  <ip address='192.168.123.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.123.10' end='192.168.123.100'/>
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


# vagrant stuff

```sh
vagrant status
vagrant up vmname

## dump ssh config
vagrant ssh-config vmname

```

# vboxmanage

References: https://networkengineer.me/2014/07/11/more-than-4-network-cards-in-virtualbox/

```sh
"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm ubuntu

vboxmanage list vms

vboxmanage showvminfo ubuntu

vboxmanage startvm ubuntu


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

