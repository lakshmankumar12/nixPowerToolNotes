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
ssh -fN -L 'forwarding_stuff' user@host

-f  -- go to background
-N  -- dont execute any command at host
```
* Useful ssh and scp options
```
-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes
-o LogLevel=ERROR   # suppresses the host-added warnings

# ssh options quick copy
-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes -o LogLevel=ERROR

# keepalive
## will timeout in interval*(count+1) seconds post the last exchanged data
-o ServerAliveInterval=60 -o ServerAliveCountMax=3

-T disable psuedo-terminal allocation
-t force   psuedo-terminal allocation

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

* proxycommand
    * should provide a means so that the stdin/stdout of the command thus invoked
      serves as a tcp-connection to the target host.
      * ssh -W targethost:targetport does just that.
      * the stdin/out of the ssh program connects to the targethost/port
      * so proxy command is effectively - ssh -W targethost:targetport user@jumperhost


```sh
### To use a dynamic ip on the sshconfig
Host chaningiphost
  ProxyCommand socat stdio tcp:${BUILD_MACHINE_IP}:22
```

* Dynamic ip host: https://superuser.com/a/338314
* Match-exec: https://superuser.com/a/1778495
* Override hostname alone: https://unix.stackexchange.com/a/598532

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

# login banner in linux

search: motd

```
/etc/update-motd.d$ ls
00-header     50-landscape-sysinfo  85-fwupd         90-updates-available       91-release-upgrade      95-hwe-eol      98-fsck-at-reboot   99-custom
10-help-text  50-motd-news          88-esm-announce  91-contract-ua-esm-status  92-unattended-upgrades  97-overlayroot  98-reboot-required
```

To check what went wrong if something isn't showing:

```sh
run-parts /etc/update-motd.d/ > /dev/null
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
```sh
zip combined.zip file1 file2

## add files recursively also
zip -r all_in.zip *

## add a file to a existing file (-u : update)
zip -u existing.zip newfile
```

* list files in a zip
```sh
unzip -l zipfile.zip
```

* extract

```sh
# normal extract
unzip zipfile.zip

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
-i       # ignore case.
-q       # quiet. quit after first occurence. Typically useful to test presence
-m<N>    # stop after getting max N occurences
-P       # perl regex
-a       # process a binary file as if its text
-n       # prefix line number - 1 based
-H       # prefix file name
```


## Highlight non-ascii chars

```
(find unicode)
\grep --color=auto -nH -P  '[^\x00-\x7F]' /tmp/a
```

### perl regex

search : pcre
https://www.pcre.org/original/doc/html/pcrepattern.html

```
\K - pretend match began here.. usually combined with the -o grep option.
        grep -Po 'hello \Kworld'   # prints only world
?= - positive assertion, but not in pattern (opposite of \K above)
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
* when appport is enabled, check core dumps in
```
/var/crash
/var/lib/apport/coredump

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
sudo lsof -Pn -i4TCP:48555
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
# -d @/path/to/infile'  --> supply data from input file,
#                              typically you want to also say
#                              -H "content-type:application/json"
# -o <file> --> choose output file
##                             if output is json, you want to add
#                              -H "accept:application/json"
# --interface <ip> -- choose a local-bind-ip
# -X/--request <cmd> -- specifies a custom command to use (eg: -X GET)
# -H/--header <hdr>  -- extra header to include in request (eg: -H "accept: application/json")
# -m, --max-time <fractional seconds>  -- max time for each transfer to take
# -w <format>  -- write given format-string(expaned to values) to stdout
#                 eg format:
#                    '\\n%{response_code}'
# -I         --> just get headers only.. and not the BODY
### ssl stuff:
### server auth
# --cacert $cacert
### client auth
# --cert $mycert
# --key $mykey
### insecure
# -k, --insecure     --> dont verify tls
# -D <file>  --> save the response headers in a file

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
-S / --server-response   -- print server response


wget '..' -O out_file

run the file on the fly -- cavent emptor if the file screws up
wget -q ${url_to_file} -O - | bash -
```

# dpkg

https://www.debian.org/doc/manuals/debian-faq/pkgtools.en.html
https://wiki.debian.org/MaintainerScripts

* install a deb
```
dpkg -i package-name
```

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

## or 
dpkg --contents package.deb
```

* find which package provides a file
```
sudo apt install -y apt-file
sudo apt-file update
apt-file search /path/to/file

dpkg -S /path/to/file
```
* Some if your pkg magmt is stuck, rebuild the config database
```
sudo dpkg --configure -a
```


* list packages provided by a repostiry
```sh
# check into the files in
grep -h -P -o "^Package: \K.*" /var/lib/apt/lists/repo_name_*_Packages | sort -u

```

```sh
# add a apt key
wget -q -O- http://whatever.io/key/path/key | sudo apt-key add -

# list all keys
apt-key list

```

* where does apt store downloaded deb
    * but this will get auto-cleared after any time.
    * use `--download-only` to get a deb here

```sh
/var/cache/apt/archives/
```



## remove a pkg

```sh
apt-get remove --purge libav-tools

## by directly running dpkg
dpkg --purge --force-all <packages>
## also
dpkg -P package_name
```

## upgrade a pkg

```sh
## --only-upgrade ensure it only a upgrade.
## mere install will also upgrade if it exists
apt-get install --only-upgrade <packagename>

## to a select version
sudo apt-get install <package name>=<version>
sudo apt-get install gparted=0.16.1-1
```

## only download without install

```sh
sudo apt-get install --download-only pppoe

## and find the debs in
/var/cache/apt/archives

```

## apt commands

```sh
apt-get update             ->  apt update
apt-get upgrade            ->  apt upgrade
apt-get dist-upgrade       ->  apt full-upgrade
apt-get install package    ->  apt install package
apt-get remove package     ->  apt remove package
apt-get autoremove         ->  apt autoremove
apt-cache search string    ->  apt search string
apt-cache policy package   ->  apt list -a package
apt-cache show package     ->  apt show package
apt-cache showpkg package  ->  apt show -a package

## list all isntalled pkgs
apt list --installed

```


* list all packges in a repo

```sh
## update
sudo apt update

## get info
file1=/var/lib/apt/lists/3rdparty-210-onyx-debian.gxc.io_repository_3rdparty%5f210%5fonyx%5fdebian_dists_focal_main_binary-all_Packages
file2=/var/lib/apt/lists/3rdparty-210-onyx-debian.gxc.io_repository_3rdparty%5f210%5fonyx%5fdebian_dists_focal_main_binary-amd64_Packages
cat $file1 $file2 | awk '/Package:/ {pkg=$2} /Version:/ {ver=$2} /Architecture:/ {print pkg " | " ver "  | " $2 } '

```




## Ubuntu pkg mgmt

https://askubuntu.com/questions/170348/how-to-create-a-local-apt-repository

### Installation of ubuntu

search: autoinstall cloudinit auto-install

links:
* https://gist.github.com/s3rj1k/55b10cd20f31542046018fcce32f103e
* https://ubuntu.com/server/docs/install/autoinstall-reference
* https://canonical-subiquity.readthedocs-hosted.com/en/latest/howto/autoinstall-quickstart.html

source: https://github.com/canonical/subiquity.git

* storage config
```
disk   [ match: , ptable: gpt ]
|
+-- partition (refers to disk by device==id  [ size: flag:boot label: grub_device:true ]
|   |
|   +-- format (refers to parition by volume==id) [fstype: ]
|       |
|       +-- mount (refers to format by device==id) [path: ]
|
+-- partition
|   |
|   +-- lvm_volgroup (includes partitions by way of devices:[])   [ name ]
|       |
|       +-- lvm_partition (refers to lvm_volgroup by volgroup==id) [ name, size ]
|           |
|           +-- format (refers to lvm_parition by volume==id) [fstype: label: ]
|               |
|               +-- mount (refers to format by device==id) [path: ]

```



## popular commands and their packages in ubuntu


```
#kernel headers
sudo apt-get install linux-headers-$(uname -r)


ps          procps
ping        iputils-ping
ssh         openssh-client
ip          iproute2
netstat     net-tools
arp         net-tools
dig         dnsutils
lstopo      hwloc
nc          netcat

```

# snap

```sh
snap install cmake --classic

snap list

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

## to get grub prompt (in KVMs)
keep pressing shift

```

# ubuntu iso-install

* subiquity / curtin
* cloud-init
* https://ubuntu.com/server/docs/install/autoinstall
* https://askubuntu.com/a/1322129
* Login-details of installer - https://askubuntu.com/a/1322129
    * default sheel is `/usr/bin/subiquity-shell`

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
# -C <dir>         -- extract to a diff dir. Mention after the args. eg .. cat ... | tar xf - -C dir
# --strip-components N -- leave N-many prefix-dirs

### add to a tar file
tar rf tarfile.tgz newfileu

### remove a file
tar  -f tarfile.tar --delete path/to/file


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

# pulp tool

```
pulp python remote create --name upstream_pypi --url 'https://pypi.org/'  --includes "$python_pkgs_json_array" --policy on_demand
pulp python repository create --name gxc_pypi
pulp python repository sync --name gxc_pypi --remote upstream_pypi
pulp python publication create --repository gxc_pypi
pulp python distribution create --name=gxc-pypi --base-path=gxc-pypi --repository=gxc_pypi

pulp python repository list

pulp python publication destroy --repository --href <from list>

pulp deb distribution list

pulp deb publication list
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
cscope -bqi cscope.files

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

## equivalent /etc/fstab entry
C_DRIVE /home/lakshman/host_c vboxsf uid=1000,gid=1000 0 0

```





# linux hard-disk related tools

* list all partitions/hard-disks
```
fdisk -l

## extend a primary partition that is the last
##  the case with resize qcow2 for vms
##  note the arg is the full disk.. not just a partition!
fdisk /dev/sda
command: print  ## show the partition
command: d      ## delete a partition.. give the last one.
command: n      ## new partition.. give the same part num, start-sector and the new end-sector
                ## give no for lvm signature overwrite
command: w      ## write to partition-table and exit

## you have to reboot after this, and do the pvresize /dev/sdaN and lvextend , resize2fs commands
```

* list filetype of all partiions
```sh
df -T
```

* linux volumes
```sh
lsblk

#lsblk with filetypes, label, uuid
lsblk -f

```

* get UUIDs of all disks. Also lists the partition-type and fs-type!
```sh
blkid

# this shows the uuid as well.
lsblk -f
```

* get pci device list
```sh
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

* naming of hard disks - https://wiki.archlinux.org/title/Device_file#Block_device_names
    * sda, vda, nvme0n1, mmcblk, vda, sr0

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

## force unmount a nfs stuck partition

* Note -- obviously causes data losses
```sh
sudo umount -l -f /path/to/mount/dir
```
* `-l` is lazy unmount
* `-f` is force unmount


## Eject a cdrom

```
eject /dev/cdrom

## reinsert a eject ussb disk

sudo eject -t /dev/sdb
```


## cdrom commands in linux

* audio-cd

```
#list the tracks in a audio cd
cdparanoia -vsQ

#rip
cdparanoia -B
```

## dd

* show progress
```sh
dd if=input of=output status=progress

## use thse
dd if=input of=output status=progress conv=fsync oflag=direct bs=100M

```


### build a usb-raw image

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

## list all useful mounts
mount | grep -v -e tmpfs -e nsfs -e tracefs -e squashfs -e cgroup -e sysfs -e proc -e overlay -e debugfs -e rpc_pipefs -e securityfs

```

## get uuid of partitions

```
sfdisk -d /dev/sda

onyxedge@onyxedge-nr:~$ sudo sfdisk -d /dev/sda
label: gpt
label-id: 407831D1-4ABD-4445-9852-173B542FD260
device: /dev/sda
unit: sectors
first-lba: 34
last-lba: 62914526
sector-size: 512

/dev/sda1 : start=        2048, size=     2201600, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=3952B232-62C3-4FD2-ACD6-DE869F747DAD
/dev/sda2 : start=     2203648, size=     4194304, type=0FC63DAF-8483-4772-8E79-3D69D8477DE4, uuid=B4F7AE03-003D-4364-B76D-04A6918295F8
/dev/sda3 : start=     6397952, size=    56514560, type=0FC63DAF-8483-4772-8E79-3D69D8477DE4, uuid=4A558994-7E6C-40E5-870C-8CFDD416941B
onyxedge@onyxedge-nr:~$

```



## LVM

search lvm physical logical

```sh

## physical volue <-> volume-group <-> logical-volume


#pvs
pvs

#lgs
vgs

# get free space in vg
vgdisplay --units b

#lvs
lvs

#extend a ext4 part what is on lvm
# get the vg-name and lv-name from the lvs command
lvextend -l +100%FREE /dev/volume-group-name/logical-volume-name

# works off the bat for ext4
resize2fs /dev/volume-group-name/logical-volume-name

## std ubuntu installation
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv


## more stuff
## to resize a pv
pvresize /dev/sda3

```

### mounting lvm across disks

```sh
## install stuff if its not already tehre
sudo yum install lvm2
sudo modprobe dm-mod

## find the availalbe volume-groups
sudo vgscan

## activate the volume
sudo vgchange -ay VolGroup00

## list the logical volumes
sudo lvs

## mount your lv
sudo mkdir /mnt/fcroot
sudo mount /dev/VolGroup00/LogVol00 /mnt/fcroot -o ro,user


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

## force fsck on next reboot

https://linuxopsys.com/topics/force-fsck-on-reboot
https://askubuntu.com/a/1352782
https://superuser.com/questions/401217/how-to-check-root-partition-with-fsck

```

## in /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT=".... fsck.mode=force fsck.repair=yes"
## and then 
sudo update-grub


or

sudo tunefs -C 2 -c 1 /dev/root/device
### -C : current mountcount
### -c : max mount count

## to see the current mount count of a device
gxcautotest@auto-gamma:~$ sudo tune2fs -l /dev/md2  | grep -i -e mount -e check
Last mounted on:          /
Default mount options:    user_xattr acl
Last mount time:          Fri Sep  8 07:39:49 2023
Mount count:              10
Maximum mount count:      -1
Last checked:             Mon Jul  3 14:31:15 2023
Check interval:           0 (<none>)
Checksum type:            crc32c
Checksum:                 0x5b34975f
gxcautotest@auto-gamma:~$

```

# create a kernel panic

```sh
echo c | sudo tee /proc/sysrq-trigger

```



# study cpu of a machine

```sh

# Gives information on sockets/threads/cores
lscpu
lscpu | egrep 'Model name|Socket|Thread|NUMA|CPU\(s\)'

# see which are hyperthreads on the same core
lscpu --all --extended

## Legend for lscpu and lstopo
#  PU P# = Processing Unit Processor #. (hyper-threads)
#  PU L# = Not sure what this is.
#
#  L#i = Instruction Cache,
#  L#d = Data Cache.
#  L1 = Level 1 cache.


# who is main, who is hyperthread (SMT - simultaneous multithreading)
#  cpu0  has 0 first, so 0 is main and 32 is SMT
#  cpu32 has 0 first, so 0 is main and 32 is SMT
cat /sys/devices/system/cpu/cpu0/topology/thread_siblings_list
0,32
cat /sys/devices/system/cpu/cpu32/topology/thread_siblings_list
0,32

# gives l1/l2/l3 cache and numa nodes (apt install hwloc)
lstopo
lstopo --output-format png -v --no-io > /tmp/cpu.png
# on terminal:
lstopo-no-graphics --no-io --no-legend --of txt

# affinity tools
taskset --cpu_list 0,2 application.exe

numactl --hardware

# show policy
numactl --show

```

# motherboard details and stuff

```sh
dmidecode

```

## tool to edit bios / uefi

```sh
efibootmgr

## list the boot options
efibootmgr

## just set a boot option for next boot
efibootmgr -n 0002

## set the boot options permenantly
efibootmgr -o 0001,0002,0003,0005

```

* for realtime kernels add this to the kernel args
  i.e edit `/etc/default/grub` .. `GRUB_CMDLINE_LINUX=`
  and run `sudo update-grub`

```
efi=runtime
```

* want to change the boot-order:

```
https://raw.githubusercontent.com/s-n-ushakov/rename-efi-entry/master/rename-efi-entry.bash
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

# Enable console on a linux machine

```sh
sudo sed -i -e '/GRUB_CMDLINE_LINUX=/ s/"$/ console=ttyS0,115200n8 console=tty0"/' /etc/default/grub
sudo grub-mkconfig -o /boot/grub/grub.cfg

```

# shutdown / reboot linux

no matter what, this will reboot the kernel

* https://en.wikipedia.org/wiki/Magic_SysRq_key
* https://unix.stackexchange.com/a/183101


```sh
sudo bash
echo s > /proc/sysrq-trigger
echo u > /proc/sysrq-trigger
echo s > /proc/sysrq-trigger
echo b > /proc/sysrq-trigger
```




# Impitool

```sh
yum install -y OpenIPMI OpenIPMI-tools


## confirm ipmi from kernel
ipmitool lan set 1 ipsrc static
ipmitool lan set 1 ipaddr 172.18.11.205
ipmitool lan set 1 netmask 255.255.0.0
ipmitool lan set 1 defgw ipaddr 172.18.0.1
ipmitool lan set 1 arp respond on
ipmitool lan set 1 access on

ipmitool lan print 1
ipmitool user list 1
ipmitool user set password 2 ADMIN


## access ipmi from a different server
ipmitool -I lanplus  -H <ip-of-server> -U <user> -P <pass> your ipmi command


## access console .. type ~. to exit console
ipmitool -I lanplus  -H 172.26.10.55 -U admin -P adminpasswd sol activate

### C-A-R-E-F-U-L-L !!!
ipmitool -I lanplus  -H 172.26.10.55 -U admin -P adminpasswd chassis power cycle
### C-A-R-E-F-U-L-L !!!


```

## dell idrac

```

console com2

## C-A-R-E-F-U-L-L !!!
## reboot the server
racadm serveraction hardreset
## C-A-R-E-F-U-L-L !!!

```

# kernel debugging

## ftrace

search: tracking tracing

* https://opensource.com/article/21/7/linux-kernel-ftrace

```sh

cd /sys/kernel/tracing

## see all tracers
cat /sys/kernel/tracing/available_tracers
## hwlat blk mmiotrace function_graph wakeup_dl wakeup_rt wakeup function nop

## current tracer
cat /sys/kernel/tracing/current_tracer
## function_graph

## dump current trace
cat /sys/kernel/tracing/trace

## dump available funcs to trace
cat /sys/kernel/tracing/available_filter_functions

## select functions to filter
echo -e "func1\nfunc2\n" > /sys/kernel/tracing/set_ftrace_filter
## enable all functions
echo > /sys/kernel/tracing/set_ftrace_filter
## see current filter
cat /sys/kernel/tracing/set_ftrace_filter

## turn on tracing
echo 1 > /sys/kernel/tracing/tracing_on ; sleep 10 ; echo 0 > /sys/kernel/tracing/tracing_on

## specific PID
echo $PID > /sys/kernel/tracing/set_ftrace_pid

```

## list kernel config

```sh
cat /boot/config-$(uname -r)
```

## dynamic logs

* check if its enabled first

```sh
$ grep CONFIG_DYNAMIC_DEBUG /boot/config-$(uname -r)
CONFIG_DYNAMIC_DEBUG=y   <---
CONFIG_DYNAMIC_DEBUG_CORE=y
$
```

* howto

```sh
## enable logs
echo "module openvswitch +p" > /sys/kernel/debug/dynamic_debug/control

## study logs.. they appear in dmesg (-w follows)
sudo dmesg -w

##disable
echo "module openvswitch -p" > /sys/kernel/debug/dynamic_debug/control
```

## performance tuning for networking

```sh
##read the values
sudo sysctl net.core.rmem_default
sudo sysctl net.core.wmem_default
sudo sysctl net.core.rmem_max
sudo sysctl net.core.wmem_max
sudo sysctl net.ipv4.tcp_rmem
sudo sysctl net.ipv4.tcp_wmem

sudo sysctl -w net.core.rmem_default=$((212992*2))
sudo sysctl -w net.core.wmem_default=$((212992*2))
sudo sysctl -w net.core.rmem_max=$((212992*2))
sudo sysctl -w net.core.wmem_max=$((212992*2))
sudo sysctl -w net.ipv4.tcp_rmem="4096 87380 16777216"
sudo sysctl -w net.ipv4.tcp_wmem="4096 16384 16777216"
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
# -c   -- compact output json
# -r   -- raw strings (doesnt print quotes)
# --null-input/-n   -- null input. Typically used to create a new json file
# --raw-input/-R   -- raw input. Each line is a string
# -s/--slurp -- entire input is one string
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
#if keys are numbers or has space
cat input.json | jq '.key1."12345".key3'

#if top object is array
#get just one key from each object in array
cat input.json | jq '.[].key1'
# the above wont be json output. So to wrap the result into a [], you do:
cat input.json | jq '[ .[].key1 ]'

## if your input is an array of objects
## gives all titles followed by all numbers
cat input.json | jq ' .[].title, .[].number'
## gives titles/numbers of each object in input array
cat input.json | jq ' .[] | .title, .number'

# if you want only some keys from an array of dicts.
# this is call object contruction
cat input.json | jq '.states[] | {type, newname: .value.TimeMs}'

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

# perf

search : performance analysis

```sh
## without args will prepare the perf.data in the cwd
sudo perf record -g -p <pid>
## arg explanation for record command
## -g          Enable call graph
## -p <pid>    Only this pid


sudo perf report -f
## arg explanation for report command
## -f          Don’t do ownership validation.

```


# openvpn3

Reference: https://community.openvpn.net/openvpn/wiki/OpenvpnSoftwareRepos

```sh
## for server and client
mkdir -p /etc/apt/keyrings # directory does not exist on older releases
curl -fsSL https://swupdate.openvpn.net/repos/repo-public.gpg | gpg --dearmor > /etc/apt/keyrings/openvpn-repo-public.gpg
arch=amd64  ## or i386, arm64
version=release/2.6

DISTRO=$(lsb_release -c | awk '{print $2}')
echo "deb [arch=$arch signed-by=/etc/apt/keyrings/openvpn-repo-public.gpg] http://build.openvpn.net/debian/openvpn/$version $DISTRO main" > /etc/apt/sources.list.d/openvpn-aptrepo.list
apt-get update
apt-get install openvpn

```



```sh
## for openvpn3 client
wget https://swupdate.openvpn.net/repos/openvpn-repo-pkg-key.pub
sudo apt-key add openvpn-repo-pkg-key.pub
DISTRO=$(lsb_release -c | awk '{print $2}')
sudo wget -O /etc/apt/sources.list.d/openvpn3.list https://swupdate.openvpn.net/community/openvpn3/repos/openvpn3-$DISTRO.list
sudo apt update
sudo apt install -y openvpn3


# Onetime
MY_CONFIGURATION_FILE=...your-client-file
openvpn3 config-import --config ${MY_CONFIGURATION_FILE}
#check
openvpn3 configs-list
# rmeove that
openvpn3 config-remove --path ${CONFIG_PATH}

# to fire vpn
## if you have just one
CONFIG_PATH=$(openvpn3 configs-list | grep '^/')
## have many?
## Find out which one:
openvpn3 configs-list | awk '/openvpn\/v3/ {p=$1} /.ovpn/ { printf "%s %s\n",p,$1}'
## Grep out the one
CONFIG_PATH=$(openvpn3 configs-list | awk '/openvpn\/v3/ {p=$1} /.ovpn/ { printf "%s %s\n",p,$1}' | grep lnarayanan.ovpn | awk '{print $1}')
## start
openvpn3 session-start --config-path ${CONFIG_PATH}

# exists?
openvpn3 sessions-list
openvpn3 sessions-list | less

# manage-session
## Only one?
SESSION_PATH=$(openvpn3 sessions-list | awk '/Path:/ { print $2 }')
## Many?
openvpn3 sessions-list | awk '/Path:/ {p=$2} /Config name:/ { printf "%s %s\n",p,$3 }'
## Grep out the one
SESSION_PATH=$(openvpn3 sessions-list | awk '/Path:/ {p=$2} /Config name:/ { printf "%s %s\n",p,$3 }' | grep lnarayanan.ovpn | awk '{print $1}')


# restart
openvpn3 session-manage --session-path ${SESSION_PATH} --restart
# disconnect
openvpn3 session-manage --session-path ${SESSION_PATH} --disconnect

```


# oathtool

search: totp MFA 2FA mfa 2fa oauth

```sh
secret=IPEKMAEFVMEW3TZS33XTDCPJJFJDWVHN
oathtool -b --totp ${secret}
```

# tesseract

* devnagiri trained source : 

https://github.com/tesseract-ocr/tessdata
https://github.com/Shreeshrii/tessdata_shreetest

```sh
export TESSDATA_PERFIX=.../tessdata

$ tree $TESSDATA_PERFIX
├── san-siddhanta-float.traineddata
└── san.traineddata

gs -o img.tiff -sDEVICE=tiffg4 -r1200 -dAutoRotatePages=/PageByPage source.pdf
tesseract img.tiff texted_output -l san-siddhanta-float

```

# adb

```
adb devices

adb -s ZY22GCL44Z shell /data/local/tmp/iperf3 -c 172.26.2.119   -p 5679 -i 1 -t 20 -b100M -u -R

```

