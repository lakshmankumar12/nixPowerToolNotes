# Windows Shell Command

## environment

search: export

```
SET VARIABLE=value
```

## Grep Equivalent

```
output | findstr "String"
```

I general use `/?` to list help for any command

## Get MotherBoard Info

```
C:\Users\lnara002>wmic baseboard get product,Manufacturer,version,serialnumber
Manufacturer           Product    SerialNumber     Version
ASUSTeK COMPUTER INC.  Z97M-PLUS  140933017106254  Rev X.0x

C:\Users\lnara002>

#just get serial
wmic bios get serialnumber
```

## Display Routing Table

```sh
route print
route print -4
route print -4 135*

#getting mac
getmac
```

Lowest metric is the highest priority as per http://superuser.com/a/198784[this
superuser answer]

### display interfaces

```sh
# quickly show the interfaces
netsh interface ipv4 show interfaces

netsh interface ipv4 set interface "Ethernet 2" mtu=1200

```


# Shortcut names

* Useful variables in explorer

```
%UserProfile%  %USERPROFILE%        <-- home folder
%AppData%   %APPDATA%               <-- home/appdata/roaming
%temp%                              <-- home/appdata/local/temp
```

http://winaero.com/blog/the-full-list-of-shell-commands-in-windows-8/

```
shell:startup          -  C:\Users\<USER>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
shell:common startup
shell:Start Menu
shell:Profile
```

## program name in run

```
mspaint
diskmgmt.msc

```


# networking

```
net view
tracert www.cisco.com
nslookup domainname.com
```

## hosts file in windows

* Edit this in Notepad-Open as administrator
c:\windows\system32\drivers\etc\hosts

# Disk-Utility

* Standard windows disk manager

Run -> `compmgmt.msc`

https://commandwindows.com/diskpart.htm

```
DISKPART
> list
> select disk N
> list partition
> delete partition N
> create partition primary
```


# Good windows-Programs

* Driver Talent -- finds the drivers needed for a computer
    * Actually may not be needed, first ensure you have updated windows fully in windows-update.
* Rufus -- Burn a iso into a usb


# windows shortcuts

https://www.xda-developers.com/windows-11-keyboard-shortcuts/

* Shift-F10 at explorer will open context-menu

## Windows snipper

screenshots:

win + shift + s  -- save the snippets in %USERPROFILE%\OneDrive\Pictures\Screenshots

recording

win + alt +r -- gamebox recording of app on which this key was pressed.
Recording stored in %USERPROFILE%\Videos\Captures




# Installing ssh in windows

https://askme4tech.com/how-install-and-configure-open-ssh-server-windows-10

```
USER=laksh
scp ~/.ssh/id_rsa.pub laksh@winhost:"c:\users\laksh\.ssh\authorized_keys"

laksh@DESKTOP-B1MHBP3 C:\Users\laksh\.ssh>Icacls authorized_keys
authorized_keys BUILTIN\Administrators:(F)
                DESKTOP-B1MHBP3\laksh:(F)

Successfully processed 1 files; Failed processing 0 files
laksh@DESKTOP-B1MHBP3 C:\Users\laksh\.ssh>

Icacls authorized_keys /inheritance:r /remove SYSTEM
```

## in sshd_file,

* strictmode - no
* publickeyauth - yes
* comment off the last admin groups to use other auth file

# Setting up reminders

Link: https://windowsloop.com/display-popup-message-in-windows-10/

* Open Task Scheduler
* Create a new folder - mytasks
* Create a basic task
* Choose cmd as powershell and arg as below:
```
powershell
-WindowStyle hidden -Command "& {[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Afternoon Syncup Meeting','Meeting Reminder')}"
```
