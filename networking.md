
[//]: # (Search / LAg to arrive here: networking)

# iproute2

[Good link to read on](http://lartc.org/howto/)

* different interface types - https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking

## L2-ish

### list all interfaces

```sh
ip link list
ip link show

# get interesting info on the link
ip -d -j -p link show ${linkname}
## for eg:
ip -d -j -p link show gtp_br0 | jq '.[0].linkinfo.info_kind'
## only get names of ifcs
ip -j link show | jq -r '.[].ifname'
## only show up/oper-up and macs .. ilshow
ip -j link show | jq -r '.[] | [.ifname, .address // "--", ((.flags | map(select(. == "LOWER_UP" or . == "NO-CARRIER" or . == "UP")) | join(",")) | if . == "" then "--" else . end), .master // "--"] | join(";")' | column -t -s\;


## get mac of a ifc
ifc=eth0
ip -j link show ${ifc} | jq -r '.[0].address'

## args
##  -j         json output
##  -p         pretty json
##  -s         stats
##  -d         details

# Type of interface
ethtool -i devicename
    driver-info: igb/tun(for both tun/tap)/ip_gre
    bus-info: tun/tap/pci-value
```
* Also circuitously found by `lspci` and `/sys/bus/pci/drivers`

* assing a mac to a interface

```sh
ifname=name_of_ifc
## first octet
##   last-bit     MUST be 0. 1=>multicast -- can never be a source
##   last-but-one MUST be 0. 0=>globally unique 1=>locally enforced
mac=0c:0c:0c:0c:0c:0c
sudo ip link set dev ${ifname} down
sudo ip link set dev ${ifname} address ${mac}
sudo ip link set dev ${ifname} up

```



### arp

```sh
ip neigh show

#delete a entry
ip neigh delete 9.3.76.43 dev eth0

#deprecated
#display table
arp

#add a static entry
arp -s <ip> <mac>
#delete if off
arp -d <ip>

#add
ip neigh replace ${ip} lladdr ${mac} dev ${device}
```

* actual info is in `/proc/net/arp`

* Add a proxy arp
```sh
#arp -Ds <hostname> <ifname> pub   # pub is for publish
#Eg:
arp -Ds 192.168.0.253 eth0 pub
```

### create a tun/tap interface

```sh
ip tuntap add dev mytap mode tap user md
```

* SF question on wanting a vtun pair like a veth pair:
  https://unix.stackexchange.com/questions/194697/is-there-a-thing-like-veth-but-without-link-level-headers
  * user-space workaround - use br_select.c from examples - https://vtun.sourceforge.net/tun/

#### Create a tun/tap by code

* See pytuncreate.py in quickscripts to run a line tun/tap.


### create a veth pair

https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#veth

```sh
myname=vethA1
mypeername=vethA2
sudo ip link add ${myname} type veth peer name ${mypeername}
sudo ip link set ${myname} up
sudo ip link set ${mypeername} up

# you can put them in different namespaces right on creation
myns=ns1
peerns=ns2
sudo ip link add ${myname} netns ${myns} type veth peer name ${mypeername} netns ${peerns}
sudo ip netns exec ${myns} ip link set ${myname} up
sudo ip netns exec ${peerns} ip link set ${mypeername} up

## note the netns takes both name as well as a pid arg. (in which case it will be the ns of the process(pid))

## delete a veth pair .. deleting the one you used to name first.
## automatically deletes the other
sudo ip link del ${myname}
```

### vlan filtering

https://developers.redhat.com/articles/2022/04/06/introduction-linux-bridging-commands-and-features#vlan_filter

* Pretty cool! Mimics a regular switch.
* Create a bridge, add interfaces to it.
* Each interface can be access or trunk, simply based on how many vlans are added to it.
* Exactly one vlan is marked as `PVID` (port Vlan ID). All untagged ingress pkts belong to this vlan
* It good practise to mark one vlan as `Egress Untagged`. All pkts from this vlan are put untagged at egress.
    * While you can have have multiple vlans as `Egress Untagged`, it is just mixing them up!

```sh
#create the bridge
sudo ip link add name ${brname} type bridge

#setup a bridge to act in this real-switch mode
sudo ip link set ${brname} type bridge vlan_filtering 1
sudo ip link set ${brname} up

#add a interface to the bridge
sudo ip link set ${ifcname} master ${brname}
## At this point, the ifc is typically an access port
##   with the vlan-1 of the bridge set as PVID,Egress-Untagged

## add another vlan(s) to the ifc (in trunk fashion a.k.a tagged)
##   -- just a note - we dont callout bridge name here.
sudo bridge vlan add dev ${ifcname} vid 2-4

## make one vlan as the access-vlan of the ifc
sudo bridge vlan add dev ${ifcname} vid 2 pvid untagged
## note while PVID moves to this vlan, the default 1 continues to be untagged.
## remove it off, if you want this ifc to be a true access port.
sudo bridge vlan del dev ${ifcname} vid 1
## note: even if a ifc is trunk, if vid-1 is not the untagged,
## remove and add it back so that it becomes explicitly tagged.

## display the vlan status of (all) bridges on the host
bridge vlan show
    port              vlan-id
    my_br0            1 PVID Egress Untagged
    vethA1            1 PVID Egress Untagged
                      2
                      3
                      4
    vethB1            2 PVID Egress Untagged
    vethC1            3 PVID Egress Untagged
    vethD1            1
                      2
                      3
                      4 PVID Egress Untagged

```

---
**Creating vlan ifcs atop veths**

* Usuually you attach veth pairs to the bridge.
* One pair is attached. Dont add vlan ifcs to this veth
* Add ip-addresses and vlans to the other ifc of the pair.

---


### vlans

* add a vlan

```sh
ip link add link eth0 name eth0.2 type vlan id 2
```

* The loose_binding flag stops the VLAN interface from tracking the line protocol status of the underlying device.
* Also note the .2 name is not mandatory (you can call eth0.2 as myvlan, say). But its nice to have that for convention!

```sh
ip link add link eth0 name eth0.2 type vlan id 2 loose_binding on
ip link delete eth0.2 type vlan
ip link add foo type vlan help
```

* old/deprecated

```sh
vconfig add lan ${id}
vconfig rem ${ifname}
```


### create a bridge

```sh
brname=my_br0
#add
ip link add name ${brname} type bridge
ip link set ${brname} up

#del
ip link delete ${brname} type bridge
```

#### add/del a interface to a bridge

```sh
brname=my_br0
ip link set eth0 master ${brname}
ip link set eth0 nomaster
```

#### details of a bridge

```sh
#show a bridge
bridge link show
#another one
ip -d link show ${brname}

# older deprecated
# list all bridges
brctl show
```

### ethtool related commands

```sh

# plain invocation.
##  gives speed/duplex .. supported link modes .. link detected

# -i
## gives driver, version, firmware, bus-info

# -k / --show-features / --show-offload
## gives various settings on the device.
# -K
## configures those settings

# -S
## gives stats

# -T
## shows timestamp capabilities


# disable checksumming by drivers
sudo ethtool --offload eth1 rx off tx off
sudo ethtool --offload eth2 rx off tx off

```



## L3-ish

### list ip

```
ip addr show
```

### useful version

```sh
## get first ipv4 of a ifc prgramatically
ifc=eth0
ip -j -4 addr show ${ifc} | jq -r '.[0].addr_info[0].local'


ip addr show | awk '/^[0-9]+:/ {ifname=$2} /^ *inet / {print ifname " " $2; }' | grep ""

ip -br a

ip -4 -br a show dev eth0 | grep -E -o "([0-9]{1,3}[\.]){3}[0-9]{1,3}"
```

### list a particular interface

```
ip addr show eth0
```

### add/del a ip

```
ip addr add 192.168.50.5 dev eth1
ip addr del 192.168.50.5 dev eth1
```

### add a gre tunnel

```sh
ip tunnel add netb mode gre remote 172.19.20.21 local 172.16.17.18 ttl 255 dev eth1
ip link set netb up
ip addr add 10.0.1.1 dev netb
ip route add 10.0.2.0/24 dev netb
```

* add a gre tunnel in tap mode (eoGRE)

```sh
ip link add gretap0 type gretap local 172.20.20.51 remote 172.20.20.50 dev eth2 nopmtudisc
ip link set dev gretap0 up
ip link set dev gretap0 mtu 1476

```


### create a dummy interface

```sh
ifname=my_new_ifc
addr="10.0.5.1/24"
sudo ip link add ${ifname} type dummy
sudo ip addr add ${addr} dev ${ifname}
sudo ip link set ${ifname} up
```

### private ip ranges

search: public

* Class A: `10.0.0.0` to `10.255.255.255`.
* Class B: `172.16.0.0` to `172.31.255.255`.
* Class C: `192.168.0.0` to `192.168.255.255`.

Link local ip

`169.254.1.0` to `169.254.254.255`.


## Routing-ish

### list routes

```
ip route show
```
* To enable forwarding:
```
sudo sysctl -w net.ipv4.ip_forward=1

## stay on reboots
sudo vi "/etc/sysctl.conf"
## uncomment:
## net.ipv4.ip_forward=1

```


### find local ip used for a route

```
ip route get <ip>
ip route get <ip> | awk ' {print $NF; exit}'
```

### routing policy

```
ip rule list
---
  0:      from all lookup local
  32766:  from all lookup main
  32767:  from all lookup default
---
```

#### add a ip rule

```
ip rule add from 192.168.100.17 tos 0x08 fwmark 4 table 7

ip rule del prio {rule #}
```


### show a routing-table

```
ip route show table all
ip route show table local
```

### flush a table

```
ip route flush table myTable
```


### dump all iptables rule

```
iptables-save

#with statistics
iptables-save -c
```

### Tunnels

```
ip tun show
```

* vti related:

### conntrack

```sh
# flush all conns
conntrack -F

# dump
conntrack -L

```


## tc commands

### Quick reference
```
tc [-s] qdisc show
tc [-s] qdisc show dev <intf>

tc [-s] [-d] class show
tc [-s] [-d] class show dev <int>    ## note: only adding a dev, shows the full htb output

tc qdisc add dev <intf> parent <handle> classid <handle> whatever
..repl add with del until the classid <handle>

tc [-s] filter show
tc [-s] filter show dev <intf>

tc filter add dev <intf> parent <handle> prio <number> protocol ip match u32 whatever..  flowid <dest-handle>
tc filter del dev <intf> prio <number>

```

### Explanation

Problem: We have two customers, A and B, both connected to the internet via
eth0. We want to allocate 60 kbps to B and 40 kbps to A. Next we want to
subdivide A's bandwidth 30kbps for WWW and 10kbps for everything else. Any
unused bandwidth can be used by any class which needs it (in proportion of its
allocated share).

This command attaches queue discipline HTB to eth0 and gives it the "handle"
1:. This is just a name or identifier with which to refer to it below. The
default 12 means that any traffic that is not otherwise classified will be
assigned to class 1:12.
```
tc qdisc add dev eth0 root handle 1: htb default 12
```

The first line creates a "root" class, 1:1 under the qdisc 1:. The definition
of a root class is one with the htb qdisc as its parent. A root class, like
other classes under an htb qdisc allows its children to borrow from each other,
but one root class cannot borrow from another. We could have created the other
three classes directly under the htb qdisc, but then the excess bandwidth from
one would not be available to the others.
```
tc class add dev eth0 parent 1: classid 1:1 htb rate 100kbps ceil 100kbps
tc class add dev eth0 parent 1:1 classid 1:10 htb rate 30kbps ceil 100kbps
tc class add dev eth0 parent 1:1 classid 1:11 htb rate 10kbps ceil 100kbps
tc class add dev eth0 parent 1:1 classid 1:12 htb rate 60kbps ceil 100kbps
```

Now match filters to the classes
```
tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 \
   match ip src 1.2.3.4 match ip dport 80 0xffff flowid 1:10
tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 \
   match ip src 1.2.3.4 flowid 1:11
```

### Notes on handles

* handle are simply IDs to the tree-hierarchy. A handle can identify either a qdisc itself or one class of a qdisc.
* qdisc can be classful(HTB,prio) or classless (pfifo_fast,bfifo_fast,netem)
* The handle has one major-number and one minor-number.
* You are free to assign any major-number.
* All classes sharing the same major-number should be attached against the same parent!
* Minor numbers of qdiscs/classes under the same parent must be different.

### Working on ingress instead of egress

All of tc happen only on the egress direction on a interface.
If you want tc to happen on ingress, you can use a temporary interface so that the traffic will appear to egress on it.

See: https://unix.stackexchange.com/a/463728

### Notes on filters

* Sample catch-all filter
```
#Notice the dst 0/0. Priority of this should be less than other filters!
tc filter add dev ${ifname} protocol ip parent 1: prio 2 u32 match ip dst 0.0.0.0/0 flowid 1:3
```


### Quickly add a rate limiter to a interface

```
sudo tc qdisc add dev eth0 root handle 1: htb default 12
sudo tc class add dev eth0 parent 1:1 classid 1:12 htb rate 15mbit ceil 15mbit

#remove or replace
sudo tc qdisc del dev eth0 root
sudo tc qdisc replace dev enp1s0 root fq_codel
```

### Add a latency/loss to a interface

```
# add a delay of 100ms with a 25ms jitter. Loss of 5%
sudo tc qdisc add dev eth0 root handle 1: netem delay 100ms 25ms loss 5%

#remove
sudo tc qdisc del dev eth0 root


```


### prio qdisc

https://serverfault.com/a/841865/442563

* The default qdisc is a pfifo, with 3 bands, serviced in that order.
* This is not flexible. If you want to offer selective treatment to traffic, we can add a prio qdisc.

```sh
# Just flush any existing config at root. It reverts back to pfifo_fast
tc qdisc del dev eth0 root

# change pfifo to prio.
#   def prio has 3 bands -- 1:1, 1:2, 1:3
tc qdisc add dev eth0 root handle 1: prio

# set all traffic to hit prio-band 3
tc qdisc add dev eth0 root handle 1: prio priomap 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2

# now add say netem to prio-band 1
tc qdisc add dev eth0 parent 1:1 handle 10: netem delay 200ms

# now choose which traffic experiences delay (note how port is used with 0xffff)
tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 match ip dst 10.0.0.1/32 match ip dport 80 0xffff flowid 1:1

```
Netem explanation at https://wiki.linuxfoundation.org/networking/netem#packet_re-ordering

## nmap

* tcp scan - do a full 3way-HS. uses kernel's connect()
* syn scan - nmap itself crafts a syn. nmap analyzes just response packets


```sh
nmap -sV -p 1-65535 192.168.1.1/24

nmap -sS <host(s)>  # TCP syn port scan     |  nmap -sS 192.168.1.1
nmap -sT <host(s)>  # TCP connect port scan |  nmap -sT 192.168.1.1
nmap -sU <host(s)>  # UDP port scan         |  nmap -sU 192.168.1.1
nmap -sA <host(s)>  # TCP ack port scan     |  nmap -sA 192.168.1.1

nmap -Pn <host(s)>  # only port scan        |  nmap -Pn 192.168.1.1

## hosts input
direct args: 192.168.0.24/8 10.0.0,1,3-7
-iL filename   # - for stdin, hosts separated by \n,\t,spaces
-iR numTargers # choose targets at random
--exclude <hosts>  # exclude the hosts.
--excludefile filename  # exclude the hosts.

## args
-sL  - dry run. Just print list of hosts that will be scanned.
-sn  - skip port scanning
-Pn  - disable ping (i.e disable the first host scanning phase. Do heavy port scanning)
-PS<port list> -- syn check to these ports.
-PR  - arp scan
-PE  - ICMP-ping only scan
--open   -- show only open ports(and suppress closed/filtered ports)


-v   - be verbose
-n   - no reverse dns lookup
-R   - reverse dns lookup (even down ones)

## just do a host listing on a network
sudo nmap -sn 172.28.1.0/24     ## does a mac probe
sudo nmap -sn 192.168.122.0/24  ## does a mac probe
nmap -sn 172.28.1.0/24          ## does ping, syn to 80/443

## check if a udp port is open
nmap -sU -p $port_or_range --open $ip -Pn

```


## Network namespace

network namespaces in linux is a bit quirky
* You can create them using the ip netns add command. And list it using the list command.
* Each process belongs to a namespace of every kind. This is visible in its /proc/{pid}/task/{pid}/ns or /proc/{pid}/ns info.
* the netns created namespaces are visible in the /proc listing only if atleast one active process is mounting that ns.
    * hence lsns (or any proc-walk) might not show up the netns add'ed namespace.
* `ip netns list` acutally lists whatever namespace is available in /var/run/netns
    * So, namespaces that are created by processes directly (like docker) aren't visible here.
    * You can bind mount that namespace to /var/run/netns to make is available

Good answer at https://unix.stackexchange.com/a/113561/345152

```
# list namespace
ip netns list

# add and del.. when adding, lo gets created for that namespace
ip netns add mynamespace
ip netns del mynamespace

# list all namespaces bound to a process
sudo find /proc/ -name ns 2>/dev/null |xargs -I NS ls -la NS/net 2> /dev/null| awk -F '->' '{print $2}'|sort -u
## or
sudo readlink /proc/*/task/*/ns/* | grep net | sort -u
sudo readlink /proc/*/task/*/ns/* | sort -u

# list all mounted namespaces
cat /proc/mounts | grep nsfs
```

* do anything under that namespace
```
ip netns exec mynamespace ip link list
```

* move a ifc to  a namespace
```
ip link set ens33 netns mynamespace
```
* Bridge devices dont seem to move namespaces with the above command.
  However, creating the bridge directly on the namespace seems to work

* tell which namespace a pid belongs. If this is empty.. its the default namespace.
```
ip netns identify ${PID}
```

* lsns if available

```sh
sudo nsenter -t <contanier_pid> -n <command>

container=...
sudo nsenter -t $(sudo docker inspect --format '{{.State.Pid}}' $container) -n /bin/bash
```




### Sample use of namespace - veth pair

https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#

```sh
# Add a new name-space
ip netns add netns108
# Create a veth-pair
ip link add veth108_ns0 type veth peer name veth108_ns108
# Ip to the one that is on def-ns
ip addr add 10.1.108.2/24 dev veth108_ns0
ip link set veth108_ns0 up
# Move the other one to the named namespaced
ip link set veth108_ns108 netns netns108
# Typical to assign a ip on the same range to each of the ifcs so
# that it mimics a real world router
ip netns exec netns108 ip addr add 10.1.108.3/24 dev veth108_ns108
ip netns exec netns108 ip link set veth108_ns108 up
# Add route(s) to the external world inside the namespace via the veth-peer.
ip netns exec netns108 ip route add 10.1.7.0/24 via 10.1.108.2 dev veth108_ns108 src 10.1.108.3
```

* Collection of `/etc/network/interfaces` files - `https://gist.github.com/evrardjp/f970315fb9094acb65c9e424f54273b0`


## vrf

link: https://www.dasblinkenlichten.com/working-with-linux-vrfs/

```sh
# add a new vrf.  Give it a new tabl name
ip link add vrf-2 type vrf table 2
ip link set dev vrf-2 up

# move a interface into a vrf
ip link set dev ens7 master vrf-2
ip addr add 192.168.127.1/24 dev ens7

## add a route in the vrf
ip route add 0.0.0.0/0 via 192.168.127.10 vrf vrf-2
ip route add 192.168.128.0/24 via 192.168.127.20 vrf vrf-2

## exec a command in the vrf
ip vrf exec vrf_name bash


```


## dns

* RFC 1035 explains the contraints of a label. RFC 1123 also covers this
    * Labels
        * basically [a-zA-z0-9-]
        * max 63 chars
    * Total name
        * max 253 chars.
        * `.` seperates labels.
    * rfc
        * 1123 - internet host requirements rfc
        * 1035 - domain names

## sys proc arrangment

```
The real path:          /sys/devices/pci0000:42/0000:42:01.0/0000:43:00.3
By pci:                 /sys/bus/pci/devices/${pci}

By name:                /sys/class/net/${devname}
If net, realpath:       /sys/devices/pci0000:42/0000:42:01.0/0000:43:00.3/net/${devname}
There is a backlink:    device -> ../../
```

In case of sriov vfs, the /sys/bus/pci/devices/${pci} folder of the VF-pci will have a `physfn` link to the PCI-folder of the PF

## device naming

```sh

/usr/lib/systemd/network/99-default.link

## create link file here to match and config - man systemd.link
## [Match] .. match
## [Link] .. configures
/etc/systemd/network/

## eg:
## cat /etc/systemd/network/wwan0.link
[Match]
Path=pci-0000:04:00.3-usb-0:3.1.4:1.2

[Link]
Name=wwan0
##

## get details of device (the realpath .../device of your chosen device)
sudo udevadm info /sys/devices/pci0000:00/0000:00:08.1/0000:04:00.3/usb1/1-3/1-3.1/1-3.1.4/1-3.1.4:1.2

```

# iptables

https://en.wikipedia.org/wiki/Iptables#/media/File:Netfilter-packet-flow.svg
https://www.frozentux.net/iptables-tutorial/iptables-tutorial.html#TRAVERSINGOFTABLES

Adding a rule
```
-t nat         Operate on the nat table...
-A PREROUTING  ... by appending the following rule to its PREROUTING chain.
-i eth1        Match packets coming in on the eth1 network interface...
-p tcp         ... that use the tcp (TCP/IP) protocol
--dport 80     ... and are intended for local port 80.
-j DNAT        Jump to the DNAT target...
--to-destination 192.168.1.3:8080 ... and change the destination address to 192.168.1.3 and destination port to 8080.
```

Load a dump of iptables-save
```
#Dump first
iptables-save > /tmp/a.iptables
#edit
#reload
iptables-restore -c < /tmp/a.iptables

```

* blackhole -> pkt is discarded. No icmp is generated
* throw     -> routing stops at this table. Further tables are taken up. Note: default - throw exists for all tables!

## args expln

```sh
-s source_ip_with_mask_in_slash_style
-d dest_ip_with_mask_in_slash_style
-p protocol
-p prot --sport port_num
-p prot --dport port_num

# usually
-m some_action --some_keyword some_value
# just comment, otherwise nothing really done
-m comment --comment "some comment for why this rule is done"
# match tcp pkts with ACK in them
## tcp-flags have this peculiar --tcp-flags flag mask (i.e the first say the list of flags we are bothered about, and the second says set/unset )
###  thus the first is to match all pkts with ACK set
-m tcp --tcp-flags ACK ACK
###  this is to match all pkts with ACK set, RST unset, SYN unset
-m tcp --tcp-flags SYN,ACK,RST ACK
# match a conn-tracker state
-m state --state NEW

```

## Picture of chains

R-D: Routing-Decision

```
+--------+    +--------+        +---+      +--------+                   +--------+
|Ntwk    |--->|PRE     |--------|R-D|----->|INPUT   |------------------>|Local   |
|Intf    |    |ROUTING |        +---+      |        |                   |Process |
+--------+    +--------+          |        +--------+                   +--------+
                                  v          ^
                              +--------+     |
                              |FORWARD |     |
                              |        |     |
                              +--------+     |
                                  |          |
+--------+    +--------+          v        +---+   +--------+  +---+   +--------+
|Ntwk    |<---|POST    |<------------------|R-D|<--|OUTPUT  |<-|R-D|---|Local   |
|Intf    |    |ROUTING |                   +---+   |        |  +---+   |Process |
+--------+    +--------+                           +--------+          +--------+
```

## chains and tables to use

* To drop incoming pkts
```
-A PREROUTING -t raw -j DROP
```
* To drop outgoing pkts
```
-A POSTROUTING -t mangle -j DROP
```
* To reject tcp
```
-A INPUT -t filter -j REJECT --reject-with tcp-reset
-A INPUT -t filter -p tcp -s 10.1.1.11 -d 10.1.1.2 -j REJECT --reject-with icmp-host-unreachable
```

## policy of a chain/table

```sh
sudo iptables --policy FORWARD ACCEPT

```


## Sample commands

```
#nat everything leaving eth0
iptables -t nat -A POSTROUTING -o eth0 -d ! 172.16.0.0/12 -j SNAT --to-source 172.18.14.3
```


## Sample iptabes


### forward a port on host to a particular guest in a std kvm setup

```sh
hostip=46.4.29.55
hostport=38883
hostindev=enp5s0
guestip=192.168.122.59
guestport=22
iptables -I PREROUTING -t nat -i ${hostindev} -d ${hostip} -p tcp --dport ${hostport} -j DNAT --to-dest ${guestip}:${guestport}
iptables -I FORWARD -p tcp --dport ${guestport} -d ${guestip} -m conntrack --ctstate NEW,RELATED,ESTABLISHED -j ACCEPT
```


### Nat A IP hidden behind a machine

```
#notes:
# * 172.18.10.240 is the IP that is being front-ended by this machine over eth0
# * 10.32.100.2 is the real ip of the INSIDE machine. 100.1 is the IP on the local interface of this machine, on eth1
# * The first rule dnats pkts-from-world to the inside machine (this and 3rd are completments and replace IP one to one)
# * The second rule snats pkts-from-world with src-ip of this machine. (this is a regular P-NAT and the reverse traffice is auto-NATted)
# * The thrid rule is for return traffic back from the inside machine
iptables -A PREROUTING -t nat -i eth0 -d 172.18.10.240 -j DNAT --to-dest 10.32.100.2
iptables -A POSTROUTING -t nat -o eth1 -d 10.32.100.2 -j SNAT --to-source 10.32.100.1
iptables -A POSTROUTING -t nat -o eth0 -s 10.32.100.2 -j SNAT --to-source 172.18.10.240
```

### Regular nat to internet

```
# * first is the simple rule
# * second is an enhancement with exceptions.
# * note that the reverse traffic will auto-nat
iptables -t nat -A POSTROUTING -o eth0 -j SNAT --to-source 172.18.14.3
iptables -t nat -A POSTROUTING -o eth0 -d ! 172.16.0.0/12 -j SNAT --to-source 172.18.14.3
```

* you can also masquerade, but this is slower than SNAT.

```
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

* Nat a particular port from one m/c to another m/c. Here we front end port 9999 and fwd it to 443 behind this m/c
```
sudo iptables -t nat -A PREROUTING -p tcp -m tcp --dport 9999 -j DNAT --to-destination 192.168.150.1:443
sudo iptables -t nat -A POSTROUTING -d 192.168.150.1/32 -o eth1 -j MASQUERADE
sudo iptables -t filter -A FORWARD -d 192.168.150.1/32 -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -t filter -A FORWARD -s 192.168.150.1/32 -p tcp -m tcp --sport 443 -j ACCEPT
```


### Just drop all pkts

```
iptables -t mangle -A PREROUTING -s ${ip1} -d ${ip2} -j DROP

## drop all sctp packets in & out
iptables -A PREROUTING -t raw -p sctp -j DROP
iptables -A POSTROUTING -t mangle -p sctp -j DROP

```
* Drop pkts from local-app/kernel
```
iptables -t filter -A OUTPUT -s 192.170.246.1/32 -p tcp -m tcp --tcp-flags RST RST -j DROP
```

ssh -nNT -R 9222:localhost:22 lakshman_narayanan@mforge3.corp.aryaka.com &

### Log a pkt

iptables -t mangle -I PREROUTING -s ${ip} whatever-else-tomatch -j LOG --log-prefix "foo:"

### tcpdump ipsec pkt

```
sudo iptables -I INPUT -m addrtype --dst-type LOCAL -m policy --pol ipsec --dir in -j NFLOG --nflog-group 5
sudo iptables -I OUTPUT -m policy --pol ipsec --dir out -j NFLOG --nflog-group 5
sudo iptables -I FORWARD -m policy --pol ipsec --dir out -j NFLOG --nflog-group 5

tcpdump -n -i nflog:5
tcpdump -s 0 -n -i nflog:5 -w ./ipsec.pcap
```
* see ipsec_notes.md in general for wireshark decoding of ipsec

### random drop


```sh
sudo iptables -A OUTPUT -m statistic --mode random --probability 0.5 -d 8.8.8.8 -j DROP

```

### both snat and dnat

https://serverfault.com/a/782897

```sh


```

### nat localhost/port to a IP/port

* https://serverfault.com/a/907324
```sh
## localhost:4242 to 11.22.33.44:5353
iptables -t nat -A OUTPUT -p tcp -d 127.0.0.1 --dport 4242 -j DNAT --to 11.22.33.44:5353
## choose the right ifc or all.
sysctl -w net.ipv4.conf.eth0.route_localnet=1
iptables -t nat -A POSTROUTING -p tcp -s 127.0.0.1 -d 11.22.33.44 --dport 5353 -j MASQUERADE

```


## ipsets

* Represents a collection of ip
* see https://unix.stackexchange.com/a/557494

## ebtables

* turn off arp-responses for a specific IP

```sh
my_local_ip=172.28.1.28
# Block ARP requests to that local-ip
ebtables -A OUTPUT -p ARP --arp-op Request --arp-ip-src ${my_local_ip} -j DROP
# Block ARP replies fort hat local-ip
ebtables -A OUTPUT -p ARP --arp-op Reply --arp-ip-src ${my_local_ip} -j DROP

```


# nft

https://wiki.nftables.org/wiki-nftables/index.php/Main_Page
https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks
https://wiki.nftables.org/wiki-nftables/index.php/Simple_rule_management


```sh
# families:   ip, arp, ip6, bridge, inet, netdev.
# hooks: see diagram in link above.

# hierarchy: family, table, chain

#typical rule syntax
% nft (add | create) chain [<family>] <table> <name> [ { type <type> hook <hook> [device <device>] priority <priority> \; [policy <policy> \;] } ]
% nft (delete | list | flush) chain [<family>] <table> <name>
% nft rename chain [<family>] <table> <name> <newname>

# interactive shell.. better as most rules have chars like !,&,> which shell wont be happy with
sudo nft -i
#add rule
nft> add ip filter output oifname "wwan0" ip protocol gre ip daddr { 192.168.134.2 } accept ;

# list everything
nft list ruleset
# list all rules -- family defaults to ip if not given
nft list table ${family} ${table}

# see stats
# https://insights-core.readthedocs.io/en/latest/shared_parsers_catalog/nfnetlink_queue.html
## headers:
## que-num peer_portid queue_total copy_mode copy_range queue_droped user_dropped id_seq  ignore
##    1    628029      0          2          4016        0              0         0       1
##    2    628030      0          2          4016        0              0         0       1
##
## peer_portid: good chance it is process ID of software listening to the queue
## copy_mode: 0 and 1 only message only provide meta data. If 2, the message provides a part of packet of size copy range.
## copy_range: length of packet data to put in message
## id_seq: pkt_id of last pkt
sudo cat /proc/net/netfilter/nfnetlink_queue


# add a rule
sudo nft add rule ${family} ${table} ${chain} vlan id 500 ip flags '&' 0x1 != 0 queue num 800
sudo nft add rule bridge gxc_mtu gxc_prerouting vlan id 500 ip flags '&' 0x1 != 0 queue num 800

# delete a rule
sudo nft delete rule ${family} ${table} handle 7
sudo nft delete rule bridge gxc_mtu handle 7

# flush in chain or table
sudo nft flush chain ${table} ${chain}
sudo nft flush table ${table}
# flush everything
sudo nft flush ruleset


#change the policy of a table
sudo nft add chain ip filter input { type filter hook input priority filter\; policy accept\; }
sudo nft add chain ip filter forward { type filter hook forward priority filter\; policy accept\; }
sudo nft add chain ip filter output { type filter hook output priority filter\; policy accept\; }

## You can create any custom table. table is just a place holder of chains
## You have to create a chain in a table and
##           The type filter hook <where> priority <what>  --> decides how your chain will participate in the whole process

## sample match rules
iifname "virbr0"
oifname "virbr0"
oif eno12399

ip daddr 192.168.122.20/24
ip saddr 192.168.122.0/24
ip protocol gre
ip flags '&' 0x1 != 0

vlan id 500

meta l4proto tcp
tcp dport 22
udp sport 67

ct state related,established

##same actions
dnat to 10.1.1.1:22
masquerade
masquerade to :1024-65535
reject
drop
accept
jump <chainname>


```




# Open vswitch

## OpenFlow protocol

* Switches are data-path elements. If there are multiple of them, each is a
  different dataplane-member as fars as controllers are concerned.
    * Each switch has a bunch of ports associated to it.
    * Each switch is controlled by a controller using the Open-switch protocol
* Configurations are static - outside of OF protocol. These are done using vsctl
* OF has tables. Each table has a table-number.
    * Each table has a collection of flow-entries
        * cookies - opaque set by controller
        * priority
        * match-fields
        * instruction sets
        * counters
        * timeouts


## ovs

* https://sreeninet.wordpress.com/2014/01/02/openvswitch-and-ovsdb/
* Ovs essentiall implements openflow for linux/kernel.

### components of ovs

* In the Kernel space
    * ovs-vswitchd
        * a daemon that implements the switch, along with a companion
          Linux kernel module for flow-based switching.
          We can talk to ovs-switchd using Openflow protocol.
    * ovsdb-server
        * a lightweight database server that ovs-vswitchd queries to
          obtain its configuration. External clients can talk to ovsdb-server
          using ovsdb management protocol (a json rpc)
    * forwarding path itself
* User space
    * control and management cluster
        * contains client tools to talk to ovsdb-server and ovs-vswitchd.

* Tables in the ovsdb-server db:
    * Bridge     : Bridge configuration.
    * Port       : Port configuration.
    * Interface  : One physical network device in a Port.
    * Flow_Table : OpenFlow table configuration
    * QoS        : Quality of Service configuration
    * Queue      : QoS output queue.
    * Mirror     : Port mirroring.
    * Controller : OpenFlow controller configuration.
    * Manager    : OVSDB management connection.
    * NetFlow    : NetFlow configuration.
    * SSL        : SSL configuration.
    * sFlow      : sFlow configuration.
    * IPFIX      : IPFIX configuration

* ovs-dpctl
    * a tool for configuring the switch kernel module.
    * Used to administer Open vSwitch datapaths
* ovs-ofctl
    * to list implemented flows in the OVS kernel module
    * A command line tool for monitoring and administering OpenFlow switches
* ovs-vsctl
    * a utility for querying and updating the configuration of ovs-vswitchd.
    * Used for configuring the ovs-vswitchd configuration database (known as ovs-db)
* ovs-appctl
    * a utility that sends commands to running Open vSwitch daemons.
* ovsdb-client
    * a command line utility to ovsdb server.

https://randomsecurity.dev/posts/openvswitch-cheat-sheet/

## ovs-vsctl

```sh
# show ovs configuration
##  Note use ofctl show bridge to dump more details of each bridge
ovs-vsctl show

# list bridges
ovs-vsctl list

# list controller
ovs-vsctl list controller

# list ports of a bridge
ovs-vsctl list-ports <brname>

# list interfaces -- grep name to quickly get a feel of all ifcs
# doesn't seem to work
#ovs-vsctl list-interface

# Add a bridge
ovs-vsctl add-br <bridge>
## Creates a bridge in the switch database.

ovs-vsctl add-port <bridge> <interface>
## Binds an interface (physical or virtual) to a bridge.
ovs-vsctl add-port <bridge> <interface> tag=<VLAN number>
## Converts port to an access port on specified VLAN
##   (by default all OVS ports are VLAN trunks).

## Used to create patch ports to connect two or more bridges together.
ovs-vsctl set interface <interface> type=patch options:peer=<interface>

## change the interaction type
## Look wrong.
ovs-vsctl set-controller gtp_br0 connection-mode=out-of-band

## adding a flow
sudo ovs-ofctl add-flow -Oopenflow13 gtp_br0 'table=20,priority=30,reg1=0x1,ip,nw_dst=192.168.203.3 actions=set_field:52:54:00:7a:74:a3->eth_dst,"patch-up"'

## control num threads / revert back
###  note that this handler-thread is just what handles slow-path packets
###  that missed ovs-dpctl flows (The real runtime flows setup in kernel)
sudo ovs-vsctl set Open_vSwitch . other_config:n-handler-threads=1
sudo ovs-vsctl set Open_vSwitch . other_config:n-revalidator-threads=1
sudo ovs-vsctl remove Open_vSwitch . other_config n-handler-threads
sudo ovs-vsctl remove Open_vSwitch . other_config:n-revalidator-threads
## list settings
sudo ovs-vsctl list Open_vSwitch

```

## ovs-ofctl

* observe/modify ovs's open-flow behavior

```sh
ovs-ofctl show <bridge>
## Shows OpenFlow features and port descriptions.

ovs-ofctl snoop <bridge>
## Snoops traffic to and from the bridge and prints to console.

ovs-ofctl dump-flows <bridge> <flow>
## --names
## --no-names
## Prints flow entries of specified bridge.
## With the flow specified, only the matching flow will be printed to console.
## If the flow is omitted, all flow entries of the bridge will be printed.
## Eg for a flow is:
##   table=N  .. only that table is printed

ovs-ofctl dump-ports-desc <bridge>
## Prints port statistics. This will show detailed information about
## interfaces in this bridge, include the state, peer, and speed information.

## Very useful
ovs-ofctl dump-table-desc <bridge>
## Similar to above but prints the descriptions of tables
## belonging to the stated bridge.
## ovs-ofctl dump-ports-desc is useful for viewing port connectivity.
## This is useful in detecting errors in your NIC to bridge bonding.

## Below are the common configurations used with the ovs-ofctl tool:

ovs-ofctl add-flow <bridge> <flow>
## Add a static flow to the specified bridge. Useful in defining
## conditions for a flow (i.e. prioritize, drop, etc).

ovs-ofctl del-flows <bridge> <flow>
## Delete the flow entries from flow table of stated bridge.
## If the flow is omitted, all flows in specified bridge will be deleted.

## The above commands can take many arguments regarding different field to match.
## They can be used for simple source/destination flow additions to complex L3 rewriting
## (SNAT, DNAT, etc). You can even build a functional router with them :)

```

## ovs-appctl

```sh
# ask what-if questions to ovs-vswitchd and other daemons

# one of the best. Trace the pkt
sudo ovs-appctl ofproto/trace gtp_br0 tcp,in_port=patch-up,ip_dst=192.168.201.100,ip_src=8.8.8.8,tcp_src=80,tcp_dst=3372
```

## ovs-dpctl

```sh
## see stats on misses and no of flows given to user path
sudo ovs-dpctl show

## show the actual kernel-fast-path flows
sudo ovs-dpctl dump-flows

```


# systemd networking service

* Restarting a stuck interface: https://serverfault.com/a/978599

```sh
ifdown --force -vvv <iface>
ip address flush dev <iface>
ip link set <iface> down
ifup -vvv <iface>
```


# netplan

https://netplan.readthedocs.io/en/stable/examples/

* simple static ip
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      dhcp4: false
      dhcp6: false
      optional: true   ## makes this not mandator on system start
      addresses:
      - 192.168.1.122/24
      routes:
      - to: default
        via: 192.168.1.1
      nameservers:
       addresses: [8.8.8.8,8.8.4.4]
```

* vlan ifc
```yaml
network:
  version: 2
  ethernets:
    eth0:  # Your physical interface name
      dhcp4: no
  vlans:
    eth0.10:
      id: 10
      link: eth0
      addresses: [192.168.10.2/24]
    eth0.20:
      id: 20
      link: eth0
      addresses: [192.168.20.2/24]
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
      routes:
        - to: 0.0.0.0/0
          via: 192.168.20.1

```


* bond interface
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eno1: {}
    eno2: {}
  bonds:
        bond0:
                interfaces: [eno1, eno2]
                addresses: [192.168.0.104/24]
                gateway4: 192.168.0.1
                parameters:
                        mode: 802.3ad
                nameservers:
                        addresses: [192.168.0.2]
                dhcp4: false
                optional: true
```

* another sample bond-parameters
```yaml
  bonds:
    bond0:
      parameters:
        mode: balance-rr
        mii-monitor-interval: 1
```

* bridge
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: no
  bridges:
    br0:
      dhcp4: yes
      interfaces:
        - enp3s0
```

* arrange to run scripts as part of netplan apply
  * https://askubuntu.com/a/1080483
    * /usr/lib/networkd-dispatcher
    * /etc/networkd-dispatcher (not this)




## netplan commands



* restart networking
```sh
sudo netplan apply
```


# ufw

```sh

# basic:
# ufw [--dry-run] [options] [rule syntax]

# some sample rules
sudo ufw allow 22
sudo ufw deny 22
sudo ufw deny 22/tcp
ufw route deny out on eno8303 to 50.112.90.181 from 10.0.20.2
ufw allow from 192.168.2.0/24 to 192.168.2.25 port 22 proto tcp comment 'why-this-rule'


# show the rules now
sudo ufw status numbered

# delete rule
#   you can delete one by one only
#   mind-you numbers change after deletion
sudo ufw delete 1


# you can also delete by the exact syntax
sudo ufw delete deny 22
## using awk to delete grepped rules
ufw show added | awk '/192.168.184.8/{ gsub("ufw","ufw delete",$0); system($0)}'

# diable firewall
sudo ufw disable
sudo ufw enable
```



# List all open ports

ss -l -p -n


# /sys folder

```
/sys/class/net/<interface>/type
```

[Link to kernel for various interface types](http://lxr.free-electrons.com/source/include/uapi/linux/if_arp.h)


# tcpdump commands

search: tcpdump

https://danielmiessler.com/study/tcpdump/

```
-i <interface>   # use any for all interfaces
-D               # show all available interfaces
-n               # Don’t resolve hostnames.
-nn              # Don’t resolve hostnames or port names.
-q               # Be less verbose (more quiet) with your output.
-t               # Give human-readable timestamp output.
-tttt            # Give maximally human-readable timestamp output.
-X               # Show the packet’s contents in both hex and ASCII.
-XX              # Same as -X, but also shows the ethernet header.
-v, -vv, -vvv    # Increase the amount of packet information you get back.
-c <pkt-count>   # Only get x number of packets and then stop.
-s               # Define the snaplength (size) of the capture in bytes. Use -s0 to get everything, unless you are intentionally capturing less. (default is typically 96, older: 68)
-S               # Print absolute sequence numbers.
-e               # Get the ethernet header as well.
-q               # Show less protocol information.
-E               # Decrypt IPSEC traffic by providing an encryption key.

-l               # line buffered. SHOW OUTPUT IMMEDIATELY  (NOT ON EXIT)

-w <tmpl>       file-name-with-template eg: /tmp/trace-%Y-%m-%d_%H_%M_%S.pcap
-W 10           max of 10 files. Stop after that
-G 120          rollover at 120s
-C 100          rollover at 100MB

less useful
-A               # print each pkt in ascii.. (Useful for text-based prot like HTTP having HTML)

-r <file>        # read from file
```

* to rollover
```
#for permissions
sudo apt install apparmor-utils
sudo aa-complain /usr/sbin/tcpdump

# run
-w /tmp/trace.pcap -W 100 -C 10

```

## Filter expressions

* popular expressions
```
<type> <dir> <proto>
type - host, net, port
dir  - src, dst
prot - tcp, udp, icmp, ah, ip6 ..

host <ip>
src  <ip>
dst  <ip>
net  <net>/<mask>
port <port>
src port <port>
dst port <port>
portrange <start>-<end>
icmp
ip6
less <size>
greater <size>
ip[2:2] == <size>

icmp and greater 500 and less 600
host 10.1.2.3
src 10.5.2.3 and dst port 3389
src net 192.168.0.0/16 and dst net 10.0.0.0/8 or 172.16.0.0/16     # or is for the dst net ( .. or .. )
src mars and not dst port 22
'src 10.0.2.4 and (dst port 3389 or 22)'

# filter ping pkts that are wrapped with gtpu
# 84 bytes ping will generate 84+36 = 120 byte pkt
tcpdump -n -vv -i eth1 'udp and port 2152 and (ip[2:2] == 120)'

# ethernet mac address
ether host aa:bb:cc:11:22:33
ether host ff:ff:ff:ff:ff:ff

# pick a particular vlanid (eg:1000)
vlan and ether[14:2] & 0xfff == 1000

#tcp syns
tcp[tcpflags] & (tcp-syn|tcp-ack) != 0

#shows all urgent
'tcp[13] & 32!=0'

#shows all ack
'tcp[13] & 16!=0'

#gre packets
protochain GRE && proto IP

#sctp pkts - no heartbeats/acks
not (sctp[12:1] = 4 or sctp[12:1] = 5)
```

* to apply display filters

search: std standard tshark

```sh
infile=file.pcap
disp_filter="tcp"
outfile=tcp.pcap

## really what you want.
## -t ud retains UTC timestamp
tshark -t ud -r $infile  -2 -Y "$disp_filter" > $outfile
## w/o any disp filter
tshark -t ud -r $infile  > $outfile
tshark -t ud -r $infile  | less

## write to another pcap
tshark -r $infile  -2 -Y "$disp_filter" -w $outfile

## special options -- for nas-5g
tshark -t ud -r $infile  -2 -Y "$disp_filter" -o 'nas-5gs.null_decipher:TRUE' > $outfile

```

* show like in wireshark

```sh
## get to know the columns
tshark -G column-formats

tshark -o 'gui.column.format:"No.","%m","Time","%Yut","Source","%s","Destination","%d","Protocol","%p","Length","%L","Info","%i"' -r infile.pcap > /tmp/output

## the typical std set
##tshark -r $infile -T fields -e frame.number -e _ws.col.Time -e ip.src -e ip.dst -e _ws.col.Protocol -e frame.len -e _ws.col.Info -2 -Y "$disp_filter" -t ud > $outfile


```

* capture live and save to file

```sh
capture_live() {
    sudo dumpcap -i $ifc -f "${filter}" -w - | tee ${file} | tshark -r -
}
```

* get timestamp info from a pcap file

```
file=yourpcap.pcap
TZ=Etc/UTC capinfos $file
```

* filter and save to a smaller file
```
tcpdump -r infile.pcap -w outfile.pcap host 184.107.41.72 and port 80
```

## wireshark filters

```
oran_fh_cus.iq_user_data[0] > 0x00

```

# ping

```
ping <ip>

-c <n>              # send n ping pkts
-s <pktsize>        # pkt-size in bytes
-I <interface>      # Use this interface or ip-address
-w <secs>           # ping till this time. ping exits either because
                    ##  this time is hit, or
                    ##  all sent (c-count) probes are answered, or
                    ##  some error
-M do|dont          # do=>set DF bit, dont=>dont set DF
-f                  ## flood mode. Sent pkts w/o waiting for reply
                    ## every -i <interval>, default interval is 0s
-i <secs>           ## float allowed. interval between each send. def: 1s
```

Notes on size

* `-s N` will generate a N+28 byte IP packet.
* Default is `-s 56` which will generate 84 sized IP pkt
* wireshark will show 20-byte IP , 8 byte Icmp, 8 byte time-stamp and only remaining as payload.
* Thus if u have `-s N` , you will see N+28 ip pkt and N-8 byte ICMP payload in wireshark.

## ping operation not permitted

```
getcap $(which ping)

sudo setcap cap_net_raw+p /usr/bin/ping

```

## arping

* initiates arp request and replies
* https://www.baeldung.com/linux/arping-command
* scapy to initiate a g-arp: https://stackoverflow.com/a/17030444


# hping3 args

hping3

* default is tcp
* --icmp/-1
* --udp/-2

* port mgmt
  * -s/--baseport (choose src port, def: random)
  * -k/--keep     (dont increase src-port. Def is to incrase)
  * -p/--destport (def: 0, choose dest prot. Use + to increase on every reply, ++ to increase on every sending)

```
-c <count>
-a <src-ip>
-i <interval>   #how long to wait between each pkt X in s or uX in microsec
-I <interface>  #interface to bind to
```

# iperf3

## server

```
-s        Start as server
-B        bind to this local ip
-p        listen port
```


## help display

```
Usage: iperf [-s|-c host] [options]
       iperf [-h|--help] [-v|--version]

Client/Server:
  -f, --format    [kmKM]   format to report: Kbits, Mbits, KBytes, MBytes
  -i, --interval  #        seconds between periodic bandwidth reports
  -l, --len       #[KM]    length of buffer to read or write (default 8 KB)
  -m, --print_mss          print TCP maximum segment size (MTU - TCP/IP header)
  -o, --output    <filename> output the report or error message to this specified file
  -p, --port      #        server port to listen on/connect to
  -u, --udp                use UDP rather than TCP
  -w, --window    #[KM]    TCP window size (socket buffer size)
  -B, --bind      <host>   bind to <host>, an interface or multicast address
  -C, --compatibility      for use with older versions does not sent extra msgs
  -M, --mss       #        set TCP maximum segment size (MTU - 40 bytes)
  -N, --nodelay            set TCP no delay, disabling Nagle's Algorithm
  -V, --IPv6Version        Set the domain to IPv6

Server specific:
  -s, --server             run in server mode
  -U, --single_udp         run in single threaded UDP mode
  -D, --daemon             run the server as a daemon

Client specific:
  -b, --bandwidth #[KM]    for UDP, bandwidth to send at in bits/sec
                           (default 1 Mbit/sec, implies -u)
  -c, --client    <host>   run in client mode, connecting to <host>
  -d, --dualtest           Do a bidirectional test simultaneously
  -n, --num       #[KM]    number of bytes to transmit (instead of -t)
  -r, --tradeoff           Do a bidirectional test individually
  -t, --time      #        time in seconds to transmit for (default 10 secs)
  -F, --fileinput <name>   input the data to be transmitted from a file
  -I, --stdin              input the data to be transmitted from stdin
  -L, --listenport #       port to receive bidirectional tests back on
  -P, --parallel  #        number of parallel client threads to run
  -T, --ttl       #        time-to-live, for multicast (default 1)
  -Z, --linux-congestion <algo>  set TCP congestion control algorithm (Linux only)

Miscellaneous:
  -x, --reportexclude [CDMSV]   exclude C(connection) D(data) M(multicast) S(settings) V(server) reports
  -y, --reportstyle C      report as a Comma-Separated Values
  -h, --help               print this message and quit
  -v, --version            print version information and quit

[KM] Indicates options that support a K or M suffix for kilo- or mega-

The TCP window size option can be set by the environment variable
TCP_WINDOW_SIZE. Most other options can be set by an environment variable
IPERF_<long option name>, such as IPERF_BANDWIDTH.

#Sample iperf3 invocation
iperf3 -s -B ${mip} -p ${port} -i 1
iperf3 -B ${mip} -p ${port} -u -c ${pip} -i 1 -t 3600 -b2M

#Sample iperf1 invocation
iperf -s -B ${mip} -p ${port} -i 1 -u -l 300
iperf -B ${mip} -p ${port} -u -c ${pip} -i 1 -d -l 300 -t 3600 -b50M



```

# netperf

* https://hewlettpackard.github.io/netperf/doc/netperf.html

```sh
# at server -- it just daemonizes itself.
## remember to kill once you are done!
## default port is 12865
netserver

# throughput
netperf -H 192.168.222.2 -l 10 -t TCP_STREAM
# latency
netperf -H 192.168.222.2 -l 10 -t TCP_RR -- -o min_latency,mean_latency,max_latency
netperf -H 172.26.11.46 -l 30 -t UDP_RR -v 2 -- -r 300,300 -O min_latency,mean_latency,max_latency,stddev_latency,transaction_rate

## args

-t <typetype>    -- TCP_STREAM (throughput), TCP_RR (latency), UDP_RR,
-l <secs>        -- duration of one iteration of test
-H <server>      -- server
-v 1/2           -- verbosity
-o               -- csv,style o/p
-O               -- human readable o/p -- https://hewlettpackard.github.io/netperf/doc/netperf.html#Omni-Output-Selection
--               -- separates global args from per-test args

# specific to _RR tests
-r <sizespec>    -- req/resp size. Default 1 byte each. Eg: -r 128,16K


```

# socat

```sh

## forward a tcp connection
##  listen on 9000 and forward to 5924
socat TCP-LISTEN:9000,fork TCP:127.0.0.1:5924


```

# iftop

* https://www.tecmint.com/iftop-linux-network-bandwidth-monitoring-tool/

search: monitoring top iftop bandwidth bw consumption stats

```sh
sudo iftop -n

```



# ab tool

```
#start
ab -n 1000 -c 10 -s 30 https://${pip}/${file_to_download}

-n   : number of requests
-c   : number of concurrent requests
-s   : timeout
```

# dhcp server

```sh
#install
sudo apt install isc-dhcp-server

#backup the default file
sudo mv /etc/dhcp/dhcpd.conf{,.origbackup}

# ofcourse , change the ip to your choice
cat <<EOF | sudo tee /etc/dhcp/dhcpd.conf > /dev/null
default-lease-time 600;
max-lease-time 7200;
authoritative;

subnet 192.168.1.0 netmask 255.255.255.0 {
    range 192.168.1.100 192.168.1.200;
    option routers 192.168.1.254;
    option domain-name-servers 192.168.1.1, 192.168.1.2;
    #option domain-name "mydomain.example";
}
host archmachine {
    hardware ethernet e0:91:53:31:af:ab;
    fixed-address 192.168.1.20;
}
EOF

#eidt this file /etc/default/isc-dhcp-server
#and correct the interface to bind in there
INTERFACESv4="eth0"

sudo systemctl restart isc-dhcp-server.service

```

* just for referece.. args for dhcpd
```
dhcpd -user dhcpd -group dhcpd -f -4 -pf /run/dhcp-server/dhcpd.pid -cf /etc/dhcp/dhcpd.conf wlan0 eth1
dhcpd -f -4 -pf /run/dhcp-server/dhcpd.pid -cf /etc/dhcp/dhcpd.conf eth0
```


# dhtest



```sh

git clone https://github.com/saravana815/dhtest
cd dhtest
make

dhtest -m '00:01:02:03:04:05' -i interface -h hostname
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

# dnsmasq

```sh


dnsmasq -k --conf-file=/etc/dnsmasq/dnsmasq.conf
## args
## -k     # keep in foreground

```


# systemd-resolved

https://superuser.com/questions/1687861/domain-based-routing-with-systemd-resolved
https://gist.github.com/brasey/fa2277a6d7242cdf4e4b7c720d42b567
https://unix.stackexchange.com/questions/442598/how-to-configure-systemd-resolved-and-systemd-networkd-to-use-local-dns-server-f
https://blogs.gnome.org/mcatanzaro/2020/12/17/understanding-systemd-resolved-split-dns-and-vpn-configuration/

```
## newer systemd
resolvectl status

## older note the spelling - its resolve
systemd-resolve --status

```



# IPsec configuration

## list all Security Policy. SPD

```
ip xfrm policy show
```

## list all security assocations. SAD

```
ip xfrm state show
```

# nc commands

Search: nc netcat

* As a tcp server
    ```sh
        nc -l -s <src-add> -p <src-port>  # might be wrong. The -l automatically takes the <ip> <port> args as local values.
        nc -l <src-add> <src-port>
    ```
* As a tcp client
    ```sh
        nc -s <src-addr> -p <src-port> <tgt-add> <tgt-port>

        # generate a quick message and exit
        echo "my message" | nc -q 1 server port
    ```
* As a udp server
    ```sh
        nc -u -l <optional-src-addr> <mandatory-src-port>   # ip-addr if not mentioned, is any
    ```
* As a udp client
    ```sh
        nc -u -s <optional-src-addr> <mandatory-srv-ip> <mandatory-srv-port>

        ## send exactly one packet and quit
        echo "my message" | nc -w0 -u server port
    ```

* As a udp server and client at same time
    ```sh
        nc -u -s 192.2.53.2 -p 19000 192.15.2.2 8090
    ```

```sh
## some args

# scan
-z                 --   report open ports

-v                 --   verbose
-w <timeout>       --   timeout after 10seconds (only as client)

```

* Useful invocations

```sh
# test for a open port
nc -zvw10 $ip $port_or_range
```


# Other useful commands

## netstat

```sh
## args

-n,--numeric       --   dont expand to names
-p                 --   show pids of programs owning the socket
-D                 --   enable debugging on socket
-c [<sec>]         --   continuous refresh every 1s(default)

# exclusive group (a wins)
-a                 --   display all sockets (listen, established, timewait, closewait)
-l                 --   show (only) listening

# prot group (you can combine. default is all)
-t                 --   only tcp
-u                 --   only udp
```

Useful invocations

```sh
# dump all sockets and programs
netstat -np
```

# Know my public ip

```
curl ifconfig.me.
```
