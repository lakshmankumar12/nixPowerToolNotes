
# cisco commands

```
# gets privileged user-mode/exec-mode
enable

#get out
disable
```

* privileged-exec is also colloquially referred as enable-mode
* end or ctrl-z take you back to the privileged mode
* exit brings one step back
* exit on exec/privileged-exec will quit the login-session

## basic cli structure

* prompt (where you type)
* command (the first keyword that begins the cli)
* keyword
* argument

* typing a `?` gets you help.

## keyboard shortcuts

* tab
* backspace
* ctrl_d
* ctrl_k
* esc_d - del from cursor to end of word
* ctrl_u/ctrl_x

* At a `--more--` prompt
    * enter - one line more
    * space - one page more
    * anything - exit more

* Break keys
    * ctrl_c - exists cfg mode wherever you are. If you are in setup, abots setup
    * ctrl_z - exists cfg mode wherever you are.
    * ctrl-shift-6 - aborts ping, tracert, dns-lookup

### general convention

* bold-face  - commnds/keywords
* italics    - arguments given
* [x]        - square bracket - optional argument
* {x}        - braces - required argument
* [x {y | z}] - vertical line - choice

## Commands under privileged exec mode

```
# reboots the switch/router
reload
```

```
show running-config
show interface status       # quick listing of ifcs
show interfaces
show interfaces brief
show ip interfaces brief
show ip ssh
show arp
show ip route
show protocol
show version
```

```
copy running-config startup-config
    >> Destination filename [..]? <enter>
```

## Interfaces

* line is for console, aux, telnet, ssh
* interface is for switch-port or router-interface
```
line console 0
line vty 0 15
interface fastethernet 0/1

interface vlan 1
    ip address <ip> <mask>
    no shut
end

# typical interfaces
GigabitEthernet 0/0
FastEthernet 0/0
Serial 0/0/0
vlan <n>
```

## config commands

```
# hostname
hostname <name>

# secure user EXEC
line console 0
password <pass>
login

# secure remote telnet
line vty 0 15
password <pass>
login

# secure privileged
enable secret <pass>

# secure all passwds in config
service password-encryption

# legal banner
banner motd delim message delim

#ssh
ip domain-name <abc.com>
crypto key generate rsa
username admin secret <pass>  # looks like global username
line vty 0 15
    transport input ssh
    login local
exit
ip ssh version 2

#default gw
ip default-gateway <ip>
```

# Terminology

* SVI - switch virtual interface

# Memory

* Flash - Image is stored
* NVRAM -  Non volative RAM. Config is stored
* RAM

# files Involved

## Internetwork Operating System(IOS) image file

The IOS facilitates the basic operation of the device’s hardware components.
The IOS image file is stored in flash memory.

## Startup configuration file

The startup configuration file contains commands that are used to initially
configure a router and create the running configuration file stored in RAM. The
startup configuration file is stored in NVRAM. All configuration changes are
stored in the running configuration file and are implemented immediately by the
IOS.

# cisco models

## 2960

Lan switches, with say 24 ports.

## 1941 ISR (Integrated Services Router)

## Term server commands

* Kill a line

    ```
    kill line 5
    ```


# Juniper commands

* You will get a bash'y prompt on login
* To get cli-like prompt
    ```
    root@:RE:0% cli
    {master:0}
    root>
    ```
* And to enter configure mode
    ```
    root> configure
    Entering configuration mode
    Users currently editing the configuration:
      root terminal pts/1 (pid 75946) on since 2020-07-08 07:05:52 UTC, idle 00:33:34
          {master:0}[edit]

    {master:0}[edit]
    root#
    ```
* In configure mode, its `set ...` or `delete ...`
* In configure mode, type `commit` to save.

## useful commands

* Unconfigured ifc

    ```
    xe-0/0/10 {
        unit 0 {
            family inet {
                dhcp {
                    vendor-id Juniper-qfx5110-48s-4c;
                }
            }
        }
    }
    ```

* simple ethernet ifc

    ```
    ge-0/0/11 {
        description to-sjct-e1;
        unit 0 {
            family ethernet-switching {
                interface-mode access;
                vlan {
                    members SJC-Edge;
                }
            }
        }
    }
    ```

* bond ifc

    ```
    ae6 {
        description to-sjcr;
        native-vlan-id 11;
        aggregated-ether-options {
            link-speed 1g;
            lacp {
                periodic fast;
            }
        }
        unit 0 {
            family ethernet-switching {
                interface-mode trunk;
                vlan {
                    members [ SJC-Edge SJC-Wan ];
                }
            }
        }
    }
    ```

    * bond member

        ```
        ge-0/0/6 {
            description to-sjcr-e2;
            ether-options {
                802.3ad ae6;
            }
        }
        ```

* shut a ifc
    ```
    set interfaces ge-0/0/16 disable
    ```

* display all macs on a vlan
