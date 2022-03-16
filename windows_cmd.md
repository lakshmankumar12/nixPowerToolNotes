# Windows Shell Command

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
```

## Display Routing Table

```
route print
route print -4
route print -4 135*
```

Lowest metric is the highest priority as per http://superuser.com/a/198784[this
superuser answer]

# Shortcut names

* Useful variables in explorer

```
%AppData%
%UserProfile%
%temp%
%USERPROFILE%
```

http://winaero.com/blog/the-full-list-of-shell-commands-in-windows-8/

```
shell:startup
shell:common startup
shell:Start Menu
shell:Profile
```

# networking

```
net view
tracert www.cisco.com
nslookup domainname.com
```

# Disk-Utility

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


