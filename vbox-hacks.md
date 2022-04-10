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

# KVM

## virsh

* https://libvirt.org/sources/virshcmdref/html-single/
* https://blog.programster.org/kvm-cheatsheet

```sh
virt-host-validate

virsh nodeinfo
virsh domcapabilities | less
virsh net-info default
virsh net-dumpxml default

virsh start <vm-name>
virsh shutdown <vm-name>
virsh destroy <vm-name>
virsh undefine <vm-name>

virsh dumpxml <vm-name>  > /some/file
virsh define /path/to/xml

#list all vm's
virsh list

#list all networks
virsh net-list --all
#get info of a network
virsh net-dumpxml <name>
virsh net-info <name>

virsh net-destory <name>
virsh net-undefine <name>

virsh pool-list --all
virsh pool-info <pool-name>

virsh vol-list <pool-name>
virsh vol-delete --pool <pool-name> <vol-name>

# gui
virt-manager
```

* Xml snippet to add a cdrom-device (or just add a iso)

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


