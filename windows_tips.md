# windows shortcuts

https://www.xda-developers.com/windows-11-keyboard-shortcuts/


# Useful variables in explorer

```
%USERPROFILE%
```

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


