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

# Tmux

* move a window form one session to another
```
#  come to the window to be moved
:move-window -t target_session_name
```

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

# ssh

* Authenticate only with password

```
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no example.com
```

## Forwarding

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
```
unzip -l zipfile.zip
```

# grep

## Highlight non-ascii chars

```
(find unicode)
\grep --color=auto -nH -P  '[^\x00-\x7F]' /tmp/a
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
```
lsof -p <pid>
```

* find the process listeing on a given port
```
lsof -i :<port>
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

* encrypt
```
openssl enc -in foo.bar -aes-256-cbc -pass stdin > foo.bar.enc
```

* decrypt
```
openssl enc -in foo.bar.enc -d -aes-256-cbc -pass stdin > foo.bar
```

# curl

```
# -f  --> be quiet on failures (Not sure, what failures are okay and what shouldn't be quietened)
# -s  --> silent or quiet mode. Mute o/p
# -S  --> when used with -s, -S will show errors
# -L  --> Track redirects
# --interface <ip> -- choose a local-bind-ip
curl 'http://...link' -o out_file
```

# wget

```
wget '..' -O out_file
--limit-rate=RATE  .. eg: --limit-rate=20k  (will limit to 20kB/s)
```

# dpkg

* list files in a package
```
dpkg-query -L <package-name>
```

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



# tar

* create
```
tar cf newtarball.tar some_folder1/ some_folder2/ file3
tar cf newtarball.tar -T filelist.txt
find . -name 'whatsoever' | tar cf newtarball.tar -T -
```

* list
```
tar tf tarball.tar
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

```
dd if=/dev/zero of=usb.img bs=1M count=8192
losetup -f usb.img

parted /dev/loop0
(parted) mklabel msdos
(parted) mkpart primary 63s 100%
(parted) set 1 boot on
(parted) quit

mkfs.ext2 /dev/loop0p1
e2label /dev/loop0p1 'CentOS 7 x86_64'
sync

#remove the loop-device
losetup -d /dev/loopN

```

## LVM

```sh
#pvs
pvs

#lgs
lgs

#lvs
lvs

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


## advanced search reference

https://www.howto-outlook.com/howto/searchcommands.htm

## Common adv-search terms I use

```
read: no
hasflag: true
from:
to:
category: blue
```

# Spotify search

spotify:album:5OVGwMCexoHavOar6v4al5
spotify:track:
spotify:playlist:

https://open.spotify.com/album/241F2pNbl6OIJPixynRuiu?si=7UiPMaRXRV-15_TEYbF5PA
https://open.spotify.com/album/0q3KEEwGPGPPnXJNQ32Wyz?si=osGPcJ4-SnqgFf8xd375JQ
