ps
---


to list threads
~~~~~~~~~~~~~~~

add -L


rdesktop args
-------------

# go full screen
rdesktop <hostname/ip> -u "DOMAIN\Username" -z -f -x 0x81

# choose a resolution and dont go full screen
rdesktop <hostname/ip> -u "DOMAIN\Username" -z -g "80%" -x 0x81

# what works in dell laptop VM
rdesktop 135.227.232.97 -u 'ENG\lnara002' -p - -z  -x 0x81 -g 1152x648 -a 32

Tmux
----

#move a window form one session to another
#  come to the window to be moved
:move-window -t target_session_name

#capture a pane
tmux capture-pane -S- -t <target>
tmux save-buffer <path-to-dest-filename>

#clipboard
... | tmux loadb -
tmux saveb - | ...

#bg-color change of current pane
tmux select-pane -t:.1 -P 'bg=red'
#bg-color of  a target pane
tmux select-pane -t:.1 -P 'bg=red'

#restore to detaul
-P 'default'
-P 'fg=red,bg=yellow'
-P 'fg=colour48,bg=black'

#some good fg colors that stand distinct in our sol-background
colour45  <- bluish
colour48  <- greenish
colour201 <- pinkish
colour190 <- yellowish
colour196 <- reddish

#Note too many fd/files open issue in tmux
Ensure your original tmux and the attached-client version are same!

#change layout .. for vsplits
:select-layout even-horizontal
# for h-splits
:select-layout even-vertical
# otherones
main-vertical

#swithc off window rename
set-option allow-rename off

#new-session
tmux new-session -s name
#new-session duplicated to another
tmux new-session -s dup_name -t exist_name
#kill a session
tmux kill-session -t dup_name

ssh
---

# Authenticate only with password
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no example.com

Mosh command to pick a particular port
----------------------------------------

mosh-server new -s -c 8 -p 60000 -l LANG=en_US.UTF-8 -l LANGUAGE=en_US -l LC_CTYPE=en_US.UTF-8

Restarting network in centos
------------------------------

service network stop
service network start
service network restart

Fireup a quick http-server
--------------------------

#for 2.7
python -m SimpleHTTPServer 8000
#for 3
python3 -m http.server 8000


zip
---

#create a zip
zip combined.zip file1 file2

#list files in a zip
unzip -l zipfile.zip

grep
----

Highlight non-ascii chars
++++++++++++++++++++++++++
(find unicode)

\grep --color=auto -nH -P  '[^\x00-\x7F]' /tmp/a

Draw ascii figures in web
---------------------------

#tag: ascii diagram

textik.com

Excel stuff
------------

SUMIF(range, criteria, sum-range)

lsof
-----

#find all fd's of a process
lsof -p <pid>

#find the process listeing on a given port
lsof -i :<port>


Sequence Diagrams
-----------------

https://www.websequencediagrams.com/

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

Encrypt  / Decrypt
------------------

#encrypt
openssl enc -in foo.bar -aes-256-cbc -pass stdin > foo.bar.enc

#decrypt
openssl enc -in foo.bar.enc -d -aes-256-cbc -pass stdin > foo.bar

wget/curl
----------

# -f  --> be quiet on failures (Not sure, what failures are okay and what shouldn't be quietened)
# -s  --> silent or quiet mode. Mute o/p
# -S  --> when used with -s, -S will show errors
# -L  --> Track redirects
curl 'http://...link' -o out_file


wget '..' -O out_file


dpkg
-----

#list files in a package
dpkg-query -L <package-name>

yum
---

yum install yum-utils

#list files in a package
repoquery -l <package-name>

tar
---

#create
tar cf newtarball.tar some_folder1/ some_folder2/ file3
tar cf newtarball.tar -T filelist.txt
find . -name 'whatsoever' | tar cf newtarball.tar -T -

#list
tar tf tarball.tar

Linux Hard-disk related tools
-----------------------------

#list all partitions/hard-disks
fdisk -l

#list filetype of all partiions
df -T

#linux volumes
lsblk

#get UUIDs of all disks
blkid

#get pci device list
lspci


Vimium shortcuts
----------------

https://vimium.github.io/

j/k -> move up or down
gg/G -> top/end of page
H  -> back page
J/K -> tabs
f -> open in current tab
F -> open in new tab


qutebrowser
-----------

go  -> edit current url
O   -> type and open a url in a new tab
+/- -> zoom
d   -> close a tab
T   -> next tab (also J, but keeps confusing with J/K, so use T and K)
nT  -> nth tab
K   -> prev tab

To switch focus to different scrolling area:
#try
;i -> if there are images in the other tab

;y -> highlight links and yank the link

To find:

config
#plain set opens up the configurations.
:set

#whatever i changed
default page: https://google.com

#search:
{"DEFAULT": "https://www.google.com/search?q={}"}


xargs
------

#To supply one arg at a time for find
find . -print 0 | xargs -0 your_command


hexdump/od
-----------

#dump boht hex and ascii

hexdump -C <file>



