# Stuff in bash file

* ps
* xargs
* od

# rdesktop args

* go full screen
```
rdesktop <hostname/ip> -u "DOMAIN\Username" -z -f -x 0x81
```

* choose a resolution and dont go full screen
```
rdesktop <hostname/ip> -u "DOMAIN\Username" -z -g "80%" -x 0x81
```

* what works in dell laptop VM
```
rdesktop 135.227.232.97 -u 'ENG\lnara002' -p - -z  -x 0x81 -g 1152x648 -a 32
```

# tmux

* move a window form one session to another
```
#  come to the window to be moved
:move-window -t target_session_name
```
* Easy-peasy way
    * mark window1 first `<backtick> m`
    * come to other window and type `:swap-window`

* capture a pane
```
tmux capture-pane -S- -t <target>
tmux save-buffer <path-to-dest-filename>
```

* clipboard
```
#copy into tmux
... | tmux loadb -

#paste from tmux
tmux saveb - | ...
```

## bg-color

* bg-color change of current pane
```
tmux select-pane -t:.1 -P 'bg=red'
```
* bg-color of  a target pane
```
tmux select-pane -t:.1 -P 'bg=red'
```
* restore to detaul
```
-P 'default'
-P 'fg=red,bg=yellow'
-P 'fg=colour48,bg=black'
```
* some good fg colors that stand distinct in our sol-background
```
colour45  <- bluish
colour48  <- greenish
colour201 <- pinkish
colour190 <- yellowish
colour196 <- reddish
```

## Note too many fd/files open issue in tmux
Ensure your original tmux and the attached-client version are same!

## layouts

```
#change layout .. for vsplits
:select-layout even-horizontal
# for h-splits
:select-layout even-vertical
# otherones
main-vertical
```

* To resize a pane
```
C-S up/down/left/right (my own maps)
```


* switch off window rename
```
set-option allow-rename off
```

* new-session
```
tmux new-session -s name
```
* new-session duplicated to another
```
tmux new-session -s dup_name -t exist_name
```
* kill a session
```
tmux kill-session -t dup_name
```

* Show all options
```
#global
tmux show-options -g
#this window
tmux show-options -w
```

# screen

* Minimal screenrc

```sh
hardstatus alwayslastline "%H %-Lw%{= BW}%50>%n%f* %t%{-}%+Lw%<"
```


# ssh

* Authenticate only with password

```
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no example.com
```

## forwarding

* Local forwarding
    ```
    ssh -L myport:someserver:serverport user@sshed_server
    ```
    * listens in client-machine at myport, and whatever is send there will be sent to someserver:serverport as if going out of sshed_server
    * you can use localhost, which will make sshed_server forward to itself.
* Remote forwarding
    ```
    ssh -R port_at_sshed_server:to_fwd_server:to_fwd_port user@sshed_server
    ```
    * listens in sshed_server at port_at_sshed_server, and whatever is sent there will be sent to to_fwd_server:to_fwd_port as if going out of client_machine
    * you can use localhost, which will make client forward to itself.
    * This is useful when you wnat to reverse ssh back into thi client mc from server mc.

* To put ssh in background

```
ssh -fN -L 'whatever' user@host

-f  -- go to background
-N  -- dont execute any command at host
```
* Useful ssh and scp options
```
-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes
-o LogLevel=ERROR   # suppresses the host-added warnings
```

## ssh_config setting

Search: sshconfig

```sh
# file is in ~/.ssh/config

## Typical config showing a jumper host proxy-command
Host testvm
    Hostname IP_OF_FINAL_HOST_AT_JUMPER
    ProxyCommand ssh -p jumper_host_port -l jmp_host_usr JUMPER_HOST_IP -W %h:%p
    User final_mc_user
    Port final_mc_port
    IdentityFile ~/.ssh/insecure_private_key
    UserKnownHostsFile /dev/null
    StrictHostKeyChecking no
```

## ssh-key gen

```sh
# create key pair
### -N ""  .. for no passphrase
### -q        for  quiet mode
### -C ""     for  comment
### -f ""     specifies key file
ssh-keygen -t rsa -f /path/to/output/dir/with/private_key -N "passphrase" -C "comment"

### change paraphrase for existing key
### -p        change paraphrase
### -P ""     old paraphrase
### -N ""     new paraphrase
ssh-keygen -p -P old-paraphrase -N new-paraphrase -f file

### other args
## -l     show fingerprint of public-key
## -lv    show fingerprint of public-key and its ascii art
## -E md5 show fingerprint in md5 hex format instead of base64
ssh-keygen -lf ~/.ssh/id_rsa.pub -E md5

### get public key from private key
##  -y     print public key
ssh-keygen -f private_key.pem -y

```






## Mosh command to pick a particular port

```
mosh-server new -s -c 8 -p 60000 -l LANG=en_US.UTF-8 -l LANGUAGE=en_US -l LC_CTYPE=en_US.UTF-8
```

# Restarting network in centos

```
service network stop
service network start
service network restart
```

# Fireup a quick http-server

* See more info in pynotes.md

```
#for 2.7
python -m SimpleHTTPServer 8000
#for 3
python3 -m http.server 8000
```

# zip

* create a zip
```
zip combined.zip file1 file2
```

* list files in a zip
```sh
unzip -l zipfile.zip

#extract one specific file
# -p prints to stdout
unzip -p zipfile.zip path/in/zip/to/file > file
```

* 7z
```
sudo apt install p7zip-full

#extract
7z x file.7z

#list files
7z l file.7z

```


# grep

## options

```sh
-q       # quiet. quit after first occurence
-m<N>    # stop after getting max N occurences
-P       # perl regex
```


## Highlight non-ascii chars

```
(find unicode)
\grep --color=auto -nH -P  '[^\x00-\x7F]' /tmp/a
```

### Perl regex

search : pcre
https://www.pcre.org/original/doc/html/pcrepattern.html

```
\K - pretend match began here.. usually combined with the -o grep option.
        grep -Po 'hello \Kworld'   # prints only world
?= - positive assertion, but not in pattern
        grep -Po 'hello (?=world)' # prints hello that is followed by world, but just hello
?! - negative assertion

```

# compilation tools

```sh
# stop at preprocessing
gcc -E 

# disassemble all function in a binary
objdump -S binary > disassembled.S

# list all functions in a binary
nm -C binary > func_list.S
## arg explanation
##   -g .. display extern symbols
##   -C .. demangle

# another otions 
readelf -sW a.out | awk '$4 == "FUNC"' | c++filt
## args of readelf
##   -s  .. list symbols
##   -W  .. don't cut too long names


```


# core mgmt in linux

search: coredump

```sh
cat /proc/sys/kernel/core_pattern


echo "/tmp/cores/core.%e.%p.%h.%t" > /proc/sys/kernel/core_pattern

## notes
%e: executable filename
%p: pid (in its namespace)
%P: pid (in intiial namespace)
%t: UNIX time of dump

%%: output one '%'
%u: uid
%g: gid
%s: signal number
%h: hostname
%: both are dropped
%: '%' is dropped

```



# Draw ascii figures in web

* tag: ascii diagram
```
textik.com
```

# Excel stuff

```
SUMIF(range, criteria, sum-range)
```

# lsof

* find all fd's of a process
```sh
lsof -Pn -p <pid>
## args
###  -P  .. dont convert ports to names
###  -n  .. dont convert ips to names
```

* find the process listeing on a given port
```sh
lsof -i :<port>

#search for all processes on a tcp port
#search: ssh detect
sudo lsof -Pn -i4TCP:61111
sudo lsof -Pn -i4TCP:25020
```


# Sequence Diagrams

https://www.websequencediagrams.com/


```
title: Some Title for the Entire Seq Diag

A -> B: Just introduce A and B and a directed msg between then
note right of A: boxed message.
A --> B: Dotted line from A to B.

A->+B: start of vertical box at B
B->A:  B's response to A.

destroy B     // Put a x at B.


alt cond1
  A->B:
else cond2
  A->B:
```

# Encrypt  / Decrypt

* See more openssl notes in general_reading_notes/ssl_tls.md

* encrypt
```
openssl enc -in foo.bar -aes-256-cbc -pass stdin > foo.bar.enc
```

* decrypt
```
openssl enc -in foo.bar.enc -d -aes-256-cbc -pass stdin > foo.bar
```

# strongswan

swanctl

See general_reading_notes/ipsec_notes.md

# curl

```
# -f        --> be quiet on failures (Not sure, what failures are okay and what shouldn't be quietened)
# -s        --> silent or quiet mode. What you usually want - no progress bars
# -S        --> when used with -s, -S will show errors
# -L        --> Track redirects
# -C        --> continue from where you left
# -o <file> --> choose output file
# --interface <ip> -- choose a local-bind-ip
# -X/--request <cmd> -- specifies a custom command to use (eg: -X GET)
# -H/--header <hdr>  -- extra header to include in request (eg: -H "accept: application/json")
# -m, --max-time <fractional seconds>  -- max time for each transfer to take
# -w <format>  -- write given format-string(expaned to values) to stdout
#                 eg format:
#                    '\\n%{response_code}'
### ssl stuff:
### server auth
# --cacert $cacert
### client auth
# --cert $mycert
# --key $mykey
### resolve
# -- resolve server_url:port:ip

curl 'http://...link' -o out_file
```

# wget

```
Args
-O <file>           -- output to a file     use -O- to output to stdin (typically coupled with -nv)
--limit-rate=RATE   -- limit to the rate    eg: --limit-rate=20k  (will limit to 20kB/s)
-q                  -- completely quiet
-nv                 -- noverbose (error and basic info get printed)
--user <username>
--password <passwd>
--http-user <username>   (overrides user)
--http-password <passwd>   (overrides user)
--ask-password


wget '..' -O out_file
```

# dpkg

* list files in a package
```
dpkg-query -L <package-name>
```
* extract files in a deb package
```sh
ar x file.deb
## you will see like this
## ls
control.tar.gz  data.tar.gz  debian-binary
## your data file are in data.tar.gz
tar xf data.tar.gz
```

* find which package provides a file
```
sudo apt install -y apt-file
sudo apt-file update
apt-file search /path/to/file
```

* list packages provided by a repostiry
```sh
# check into the files in
grep -h -P -o "^Package: \K.*" /var/lib/apt/lists/repo_name_*_Packages | sort -u

```

```sh
# add a apt key
wget -q -O- http://whatever.io/key/path/key | sudo apt-key add -

```


## remove a pkg

```
apt-get remove --purge libav-tools
```

## Ubuntu pkg mgmt

https://askubuntu.com/questions/170348/how-to-create-a-local-apt-repository

### Installation of ubuntu

search: autoinstall cloudinit

links:
* https://gist.github.com/s3rj1k/55b10cd20f31542046018fcce32f103e
* https://ubuntu.com/server/docs/install/autoinstall-reference



# yum

```
yum install yum-utils
```

* list files in a package that is installed
    ```
    rpm -ql <package-name>
    ```
* list files in a rpm-package
    ```
    rpm -qlp <file.rpm>
    ```
* Information from a rpm
    ```
    rpm -qip rpname.rpm
    ```
* Force install a rpm
    ```sh
    rpm -ivh --force --nodeps whatever.rpm
    ```
* Just extract files of a rpm
    ```sh
    rpm2cpio ./your-rpm.rpm | cpio -idmv
    rpm2cpio ./your-rpm.rpm | cpio -iv --to-stdout ./some/specfic/file/mind/the/dot > your_file
    ```
* List all repos
    ```
    yum repolist
    ```
* List all packages in a repo
    ```
    yum --disablerepo="*" --enablerepo="google" list available
    ```



* find rpm that installed a binary
```
# rpm -q --whatprovides /usr/bin/ssh
openssh-clients-5.5p1-24.fc14.2.i686
```

* List all installed packages
```
rpm -qa
```

* Centos debug info - http://debuginfo.centos.org/


# grub

```sh
# edit what you want here
vi /etc/default/grub

# then build the config
grub2-mkconfig -o /boot/grub2/grub.cfg

#reboot

```


# tar

## args

```sh
##create a tar
tar zcvf /path/to/target/file.tgz file1 dir2 relative/path/to/dir3
### args
###   c         -- create
###   v         -- list files that's worked on
###   z         -- compress (gzip)
###   f <file>  -- tarfile

### extract
tar zxvf /path/to/tarfile.tgz

# -a               -- automatically detect the compression algo from file suffix
# -O, --to-stdout  -- cat to stdout

### add to a tar file
tar rf tarfile.tgz newfileu

```


## create
```sh
tar cf newtarball.tar some_folder1/ some_folder2/ file3
tar cf newtarball.tar -T filelist.txt
find . -name 'whatsoever' | tar cf newtarball.tar -T -

# tar a folder but exclude the path to that folder
tar cf target.tar -C path/to/where/your/tar/should/begin .
# however if you want to glob files in that path, then
# its better to cd there
(cd path/to/where/your/tar/should/begin ; tar cf /abs/path/target.tar *glob* )
```

## list
```sh
tar tf tarball.tar

# cat a file to stdout w/o really creating a file
tar xf file.tgz path/in/tar/ball --to-stdout
```

# find

```sh
find <global-options> <path-one-or-more> <expressions>
```

* At its core find prints every file in the given path, provided the expression returns True for that file.
* expressions (also referred as primary) can be many, and unless otherwise given, an implicit AND is assumed.
* -print is assumed to be given unless other stuff like -print0 , -ls, -exec, -execdir is given.

```sh
# include paths in the search
find . -wholename '*parentdirname*filepartname*'

# List upto a certain depth
find . -maxdepth 2

# ls just dirs
find . -maxdepth 1 ! -path . -type d

# prune a few dirs from search
find . -type f \( -path dir1 -o -path dir2 -o -path -dir3 \) -prune -o -print

# do something with the file
find . -name '*.c' -exec grep to_find_string '{}' \;
```

# cscope

```sh
grep -E '\.(c|cc|cpp|h|hh|S|s|in|tcc|Y|m4|asm|rc|ash|fuc|x|l|y|asl|bat|tpl|ac|am|cli)$' cscope.files

git ls-files | grep -E '\.(c|cc|cpp|h|hh|S|s|in|tcc|Y|m4|asm|rc|ash|fuc|x|l|y|asl|bat|tpl|ac|am|cli)$' > cscope.files

```


# dhclient

dhcp dont update resolv.conf
```sh
cat <<EOF | sudo tee /etc/dhcp/dhclient-enter-hooks.d/nodnsupdate > /dev/null
#!/bin/sh
make_resolv_conf(){
   :
}
EOF
sudo chmod +x /etc/dhcp/dhclient-enter-hooks.d/nodnsupdate
```

# rsyslog

```sh
#check rsyslog config
rsyslogd -N1

# config lines for /etc/rsyslog/NN-myfile.conf
if ( $programname contains "magmad" ) then {
    action(type="omfile" file="/var/log/magmad.log")
    stop
}

#old style
:programname, contains, "magmad"    /var/log/magmad.log
&~

#trigger a script on hitting file-limit
# note the script will run as syslog-user.. so you ought to add sudo here
# and add this access in /etc/sudoer
$outchannel Magamdlog,/var/log/magmad.log,104856,sudo /path/to/script

if ($programname contains 'magmad' ) then :omfile:$Magamdlog;FileFormat
&~
## some content in script can be to logrotate, eg:
/usr/sbin/logrotate -f /etc/logrotate.d/file-having-rotate-config-for-our-just-file-of-interest

```

# logrorate

```sh
#sample config
onyxedge@onyxedge-agw:/etc/logrotate.d$ sudo cat /etc/logrotate.d/gxc-magmad
/var/log/magmad.log
{
  su root syslog
  rotate 10
  size 50M
  daily
  missingok
  notifempty
  compress
  copytruncate
}

```

```sh
#mount a vbox folder
mount -t vboxsf D_DRIVE /path/in/local/vm

```





# Linux Hard-disk related tools

* list all partitions/hard-disks
```
fdisk -l
```

* list filetype of all partiions
```
df -T
```

* linux volumes
```
lsblk

#lsblk with filetypes
lsblk -f
```

* get UUIDs of all disks. Also lists the partition-type and fs-type!
```
blkid
```

* get pci device list
```
lspci

#get network info list
sudo lshw -businfo -c network
```

* commandline for gparted
```
parted
```

link on getting partition aligned right - https://blog.hqcodeshop.fi/archives/273-GNU-Parted-Solving-the-dreaded-The-resulting-partition-is-not-properly-aligned-for-best-performance.html

* other cmds
```
lshw
lspci
lsusb
lsbk
lscpu
lsdev
```

* mounting a cd
```
mount -o loop /path/to/file.iso /mnt/cd-contents
```


* bring in a iso file as block-device
```
#add a loop dev
losetup -Pf  CentOS-7-x86_64-Minimal-1810.iso
#remove the loop dev
losetup -d /dev/loop0
```

* usb-serial in linux
```
lsusb
...
Bus 005 Device 002: ID 067b:2303 Prolific Technology, Inc. PL2303 Serial Port
... get the xxxx:yyyy detail from above.
sudo modprobe usbserial vendor=0x067b product=0x2303
dmesg
...
[83780.104313] usb 2-1.2: new full-speed USB device number 13 using ehci-pci
[83780.186687] usb 2-1.2: New USB device found, idVendor=067b, idProduct=2303
[83780.193659] usb 2-1.2: New USB device strings: Mfr=1, Product=2, SerialNumber=0
[83780.201044] usb 2-1.2: Product: USB-Serial Controller D
[83780.206377] usb 2-1.2: Manufacturer: Prolific Technology Inc.
[83780.236187] usbcore: registered new interface driver pl2303
[83780.241867] usbserial: USB Serial support registered for pl2303
[83780.247856] pl2303 2-1.2:1.0: pl2303 converter detected
[83780.254926] usb 2-1.2: pl2303 converter now attached to ttyUSB0
...
screen /dev/ttyUSB0 115200
```

## Eject a cdrom

```
eject /dev/cdrom
```


## cdrom commands in linux

* audio-cd

```
#list the tracks in a audio cd
cdparanoia -vsQ

#rip
cdparanoia -B
```

## build a usb-raw image

```sh
dd if=/dev/zero of=usb.img bs=1M count=8192
losetup -f usb.img

parted /dev/loop0
(parted) mklabel msdos
(parted) mkpart primary 63s 100%
(parted) set 1 boot on
(parted) quit

mkfs.ext2 /dev/loop0p1
#or ext4
mkfs.ext4 /dev/loop0p1

# works for all of ext2/3/4
e2label /dev/loop0p1 'CentOS 7 x86_64'
sync

#remove the loop-device
losetup -d /dev/loopN

```

## mount

```sh
#create the dir
sudo mkdir /mountpoint
#std args
mount -t deviceFileFormat -o umask=filePermissions,gid=ownerGroupID,uid=ownerID /device /mountpoint

#useful invocation
mount -o umask=filePermissions,gid=1000,uid=1000 /dev/loop8p1 /mnt/extra_data

#for ext4 partitions, do this after mounting
sudo chown -R user:group /mountpoint

```


## LVM

search lvm physical logical

```sh

## physical volue <-> volume-group <-> logical-volume


#pvs
pvs

#lgs
vgs

#lvs
lvs

#extend a ext4 part what is on lvm
# get the vg-name and lv-name from the lvs command
lvextend -l +100%FREE /dev/volume-group-name/logical-volume-name


```

## nfs mounting

* At server
```sh
# ubuntu - install nfs package
sudo apt install -y nfs-kernel-server
# centos
sudo yum install nfs-utils
### centos doesn't start server automatically
### systemctl start nfs-server
### systemctl enable nfs-server

# create a bind-mount of your folder
sudo mkdir -p /srv/nfs4/folder_for_others_to_refer
sudo mount --bind /path/to/original_folder /srv/nfs4/folder_for_others_to_refer

## add to /etc/fstab for mounting on future reboots
/folder/to/export_as_readonly /srv/nfs4/folder_for_others_to_read none bind 0 0

## in /etc/exports
## IMPORTANT: Keep the first line as is.
## On the second line, you can change "ro" to "rw", if you are okay for others to write to this folder.
/srv/nfs4                            192.168.122.0/24(rw,sync,no_subtree_check,crossmnt,fsid=0)
## recommended .. expose as read-only
/srv/nfs4/folder_for_others_to_refer 192.168.122.0/24(ro,sync,no_subtree_check)
## for read-write .. you can also narrow down to single ip
/srv/nfs4/folder_for_others_to_refer 192.168.122.23/32(rw,sync,no_subtree_check)


#export now
sudo exportfs -ar

#view the exports
sudo exportfs -v
```

* At client
```sh
#ubuntu
sudo apt install nfs-common

# create the mount point
sudo mkdir -p /folder_of_friend
sudo mount -t nfs -o vers=4 192.168.122.14:/folder_for_others_to_read /folder_of_friend

# Add to /etc/fstab for permanent mount
192.168.122.14:/folder_for_others_to_read /folder_of_friend  nfs  defaults,timeo=900,retrans=5,_netdev	0 0

```

# study cpu of a machine

```sh

# Gives information on sockets/threads/cores
lscpu
lscpu | egrep 'Model name|Socket|Thread|NUMA|CPU\(s\)'

# who is main, who is hyperthread (SMT - simultaneous multithreading)
#  cpu0  has 0 first, so 0 is main and 32 is SMT
#  cpu32 has 0 first, so 0 is main and 32 is SMT
cat /sys/devices/system/cpu/cpu0/topology/thread_siblings_list
0,32
cat /sys/devices/system/cpu/cpu32/topology/thread_siblings_list
0,32

# gives l1/l2/l3 cache and numa nodes
lstopo

# affinity tools
taskset --cpu_list 0,2 application.exe

numactl --hardware

# show policy
numactl --show

```



# modules

```sh
# list all modules
lsmod

onyxedge@svt2agw:~$ lsmod | grep gre
ip_gre                 28672  0            ## nobody else seems to use ip_gre
ip_tunnel              24576  1 ip_gre     ## ip_tunnel is used by ip_gre
gre                    16384  1 ip_gre
onyxedge@svt2agw:~$

# load 

```



# Impitool

```
yum install -y OpenIPMI OpenIPMI-tools


ipmitool lan set 1 ipsrc static
ipmitool lan set 1 ipaddr 172.18.11.205
ipmitool lan set 1 netmask 255.255.0.0
ipmitool lan set 1 defgw ipaddr 172.18.0.1
ipmitool lan set 1 arp respond on
ipmitool lan set 1 access on

ipmitool lan print 1
ipmitool user list 1
ipmitool user set password 2 ADMIN
```

# Vimium shortcuts

https://vimium.github.io/

```
j/k -> move up or down
gg/G -> top/end of page
H  -> back page
J/K -> tabs
f -> open in current tab
F -> open in new tab
```

# qutebrowser

```
go  -> edit current url
O   -> type and open a url in a new tab
+/- -> zoom
d   -> close a tab
T   -> next tab (also J, but keeps confusing with J/K, so use T and K)
nT  -> nth tab
K   -> prev tab
Sq  -> list all quickmarks and bookmarks
```

* To switch focus to different scrolling area:

```
#try
;i -> if there are images in the other tab

;y -> highlight links and yank the link
```

## To find:

```
config
#plain set opens up the configurations.
:set
```

## whatever i changed
```
default page: https://google.com

#search:
{"DEFAULT": "https://www.google.com/search?q={}"}
```



# outlook msg files

open msg files in mac/linux

Src: https://superuser.com/a/979603/544330

```
sudo apt-get install libemail-outlook-message-perl libemail-sender-perl
msgconvert outlooksavedmail.msg
```

## mac and outlook

https://answers.microsoft.com/en-us/msoffice/forum/all/outlook-2016-mac-search-matching-x-or-y/982e61eb-0f41-4aa6-8815-8a0cef22adbf
https://tech.setepontos.com/2017/06/13/how-to-aggregate-folderse-mail-with-smart-folders-on-outlook-for-mac-advanced-search-with-raw-queries/

```
com_microsoft_outlook_unread == 1
kMDItemAuthors == "Joe Cool"
kMDItemRecipients == "John Smith"c
kMDItemTextContent == "*commented on*"
com_microsoft_outlook_folderID == 146 && com_microsoft_outlook_messageSent < $time.iso("2019-07-01 00:00:00Z")
com_microsoft_outlook_messageSent < $time.iso("2018-12-31 00:00:00Z")

com_microsoft_outlook_folderID == 146 && (kMDItemTextContent == "commented on"  || kMDItemTextContent == "edited a comment" || kMDItemTextContent == "created an issue" || kMDItemTextContent == "Status:" || kMDItemTextContent == "reopened an" || kMDItemTextContent == "resolved as")
com_microsoft_outlook_folderID == 146 && com_microsoft_outlook_unread == 1 && (kMDItemTextContent == "commented on"  || kMDItemTextContent == "edited a comment" || kMDItemTextContent == "created an issue" || kMDItemTextContent == "Status:")
"Change By:	Asn Automation"
```

```
# get the folder-id. Select the folder in outlook and run this:
osascript -e 'tell application "Microsoft Outlook" to get selected folder'
```
Current Assignments

# outlook

## advanced search reference

https://www.howto-outlook.com/howto/searchcommands.htm

## Common adv-search terms I use

search: outlook

```
read: no
hasflag: true
from:
to:
category: blue
```

# gmail search

Before:YYYY/MM/DD
After: YYYY/MM/DD

# Spotify search

spotify:album:5OVGwMCexoHavOar6v4al5
spotify:track:
spotify:playlist:

https://open.spotify.com/album/241F2pNbl6OIJPixynRuiu?si=7UiPMaRXRV-15_TEYbF5PA
https://open.spotify.com/album/0q3KEEwGPGPPnXJNQ32Wyz?si=osGPcJ4-SnqgFf8xd375JQ

# gdrive

```
#install
wget 'https://github.com/prasmussen/gdrive/releases/download/2.1.1/gdrive_2.1.1_linux_amd64.tar.gz'
tar xf gdrive_2.1.1_linux_amd64.tar.gz
# or easy:
brew install gdrive

#to authenticate -- follow instructions
gdrive about

# ls the root drive - note default is 30 items.. use -m <100> to list 100
gdrive list

# ls a particular dir - get id of parent
gdrive list --query " 'IdOfTheParentFolder' in parents"

# general find by name
gdrive list --query "name contains 'temp'"

#download
gdrive download <id>

#info on file, path where it is..
gdrive info <id>

gdrive upload --parent <parent-id> ubuntu_install_debug.tar

python3 -m http.server 8000
```

direct download link

```
#what you get
https://drive.google.com/file/d/1ulBg9QO62imSzowJRjTF7BMXPV3JpbEQ/view?usp=sharing
#direct download
https://drive.google.com/uc?export=download&id=1ulBg9QO62imSzowJRjTF7BMXPV3JpbEQ

orig_url=${url}
id=$(echo $orig_url | awk -F/ '{print $6}')
echo ${id}
direct_url="https://drive.google.com/uc?export=download&id=${id}"
echo ${direct_url}
```



# jq

## Links

Good read: https://earthly.dev/blog/jq-select/
Manual: https://stedolan.github.io/jq/manual/
Another cheatsheet: https://gist.github.com/olih/f7437fb6962fb3ee9fe95bda8d2c8fa4

## cheatsheet

```sh

#args
# -c   -- compact json
# -r   -- raw strings (doesnt print quotes)
# -n   -- create a new json file
# --arg name value  -- assign value to the variable name for use inside of expression

#prettify json
cat input.json | jq '.'
#or
jq '.' input.json

# output keys in the top-level dict
cat input.json | jq 'keys'
cat input.json | jq 'keys_unsorted'

#just get one element - assuming the top object is a dict
cat input.json | jq '.key'
cat input.json | jq '.key1.key2.key3'
#if keys are numbers
cat input.json | jq '.key1."12345".key3'

#if top object is array
#get just one key from each object in array
cat input.json | jq '.[].key1'
# the above wont be json output. So to wrap the result into a [], you do:
cat input.json | jq '[ .[].key1 ]'

#if you have dict of dicts and want just one element from inner dict
# {"level1key1" : { "level2key1" : "value1" }} ..
##  returns {"level1key1" : "value1", ...}
cat input.json | jq 'map_values(.level2key1)'

## You can replace each object with the number of items in that object
cat /tmp/last_data| jq 'map_values(length)' | less

## Add a new entry or modify it
cat input.json | jq '.new_member="value1"'

## add to an array entry. Note the use of [name|length] and .+
jq '.data.messages[.data.messages| length] |= .+ {member:"value"}'

## Add multiple entries
cat input.json | jq '.new_member1="value1" | .exist_member2="value2" | .new_member3 = "value3"'

## remove a member
cat input.json | jq 'del(.member)'

## remove from array .. del elems 1,3,5,11
cat input.json | jq 'del(.Array[1,3,5,11])'
## remote from array .. by equiality
cat input.json | jq 'del(.Array[] | select(.foobar2 == "barfoo2"))'

## create a new json file
jq -n --arg greeting world --arg second more_values '{"hello":$greeting,"another":$second}' > file.json

```

## manual reading dump

```sh

'.simplekeywithoutspecialchars'
'.[key]'  # same
'.["key$$"]' # key with spl char

'.[integer]' # when integer, treats input as array.
             # can be a slice .[10:15]

'.[]'   # return all elements of array or dict.
        # Note you will get N independant json objects as output
        # its a array value iterator

        # comma
'.user, .projects[]'  # same input given to both filters
                      # output is concatenated in order
'.[2,4]'

```

* pipe
    * combines two filters by feeding the output(s) of the one on the left into
      the input of the one on the right
    * If the one on the left produces multiple results, the one on the right
      will be run for each of those results.
* parenthesis
    * grouping operator
* array construction - `[]`
    * typically `[filter1, filter2, filterN]`
    * `filter1` itself can produce multiple outputs. So the result in one long array
    * Eg: `'[.user, .projects[]]'`
* `as` - var-assigment
    * `"f o o" as foo | {value: $foo}`
* Object contruction - `{}`
    * Basically you do `{key1: filter1, key2: filter2}`
    * Typically `key1`, `key2` are literals. For values you use filters.
    * If filter produces multiple values, then result will be multiple JSON objects.
    * If key isn't a literal, use parenthesis to trigger a evaluation
* Operators
    * `+,-,*`
* Built-ins
    * length
    * keys, keys_unsorted
    * has(key)
    * in -- object is builtin's arg, while key is from input-json. Invert of has(key)
    * map(filter)
        * runs filter on each member in input array. Gives array output
    * map_values(filter)
        * runs filter on each value in input object. Gives object output


