
# iproute2

[Good link to read on](http://lartc.org/howto/)

## L2-ish

### list all interfaces

```
ip link list
```

### arp

```
ip neigh show

#old
#display table
arp

#add a static entry
apr -s <ip> <mac>
```

* actual info is in /proc/net/arp

### Tell the type of the interface

ethtool -i devicename
driver-info: igb/tun(for both tun/tap)/ip_gre

bus-info: tun/tap/pci-value

#### delete a apr cache

```
ip neigh delete 9.3.76.43 dev eth0
```

## vlans

### add a vlan

```
ip link add link eth0 name eth0.2 type vlan id 2
```

* The loose_binding flag stops the VLAN interface from tracking the line protocol status of the underlying device.
* Also note the .2 name is not mandatory. But its nice to have that for convention!

```
ip link add link eth0 name myvlan type vlan id 2 loose_binding on
ip link delete myvlan type vlan
ip link add foo type vlan help
```

#### old/deprecated

```
vconfig add lan ${id}
vconfig rem ${ifname}
```

### create a tun/tap interface

```
ip tuntap add dev mytap mode tap user md
```

### create a bridge

```
ip link add name bridge_name type bridge
ip link set bridge_name up
ip link delete bridge_name type bridge
```

### add/del a interface to a bridge

```
ip link set eth0 master bridge_name
ip link set eth0 nomaster
```

### better link show

```
ip link show | awk ' /^[0-9]+:/ { link = $2 ; getline ; print link " " $0 } '
```

### brctl

```
brctl show
```



## L3-ish

### list ip

```
ip addr show
```

### useful version

```
ip addr show | awk '/^[0-9]+:/ {ifname=$2} /^ *inet / {print ifname " " $2; }' | grep ""
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

```
ip tunnel add netb mode gre remote 172.19.20.21 local 172.16.17.18 ttl 255 dev eth1
ip link set netb up
ip addr add 10.0.1.1 dev netb
ip route add 10.0.2.0/24 dev netb
```

## Routing-ish

### list routes

```
ip route show
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

### show a routing-table

```
ip route show table all
ip route show table local
```

### dump all iptables rule

```
iptables-save
```

### Tunnels

```
ip tun show
```

* vti related:



# Ip-Routing-Tables

* blackhole -> pkt is discarded. No icmp is generated
* throw     -> routing stops at this table. Further tables are taken up. Note: default - throw exists for all tables!

# List all open ports

ss -l -p -n


# /sys folder

```
/sys/class/net/<interface>/type
```

[Link to kernel for various interface types](http://lxr.free-electrons.com/source/include/uapi/linux/if_arp.h)


# Tcpdump commands

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
-c               # Only get x number of packets and then stop.
-s               # Define the snaplength (size) of the capture in bytes. Use -s0 to get everything, unless you are intentionally capturing less. (default is typically 96, older: 68)
-S               # Print absolute sequence numbers.
-e               # Get the ethernet header as well.
-q               # Show less protocol information.
-E               # Decrypt IPSEC traffic by providing an encryption key.

-w <file>        # write to a file
-r <file>        # read from file
```

## Filter expressions

```
<type> <dir> <proto>

type - host, net, port
dir  - src, dst
prot - tcp, udp, icmp, ah, ip6 ..

less <n-byte-size>
greater <>
<= <n>


src 10.5.2.3 and dst port 3389
src net 192.168.0.0/16 and dst net 10.0.0.0/8 or 172.16.0.0/16     # or is for the dst net ( .. or .. )
src mars and not dst port 22
'src 10.0.2.4 and (dst port 3389 or 22)'

#shows all urgent
'tcp[13] & 32!=0'

#shows all ack
'tcp[13] & 16!=0'

#gre packets
protochain GRE && proto IP
```


## Ping args

```
ping <ip>

-c <n>              # send n ping pkts
-s <pktsize>        # pkt-size in bytes
-I <interface>      # Use this interface or ip-address
```


## hping3 args

hping3

* default is tcp
* --icmp/-1
* --udp/-2

* port mgmt
  * --baseport/-s (choose src port, def: random)
  * --keep/-k  (dont increase src-port. Def is to incrase)
  * --destport/-p (def: 0, choose dest prot. Use + to increase on every reply, ++ to increase on every sending)

```
-c <count>
-a <src-ip>
-i <interval>   #how long to wait between each pkt X in s or uX in microsec
-I <interface>  #interface to bind to
```

# iptables

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




# IPsec configuration

## list all Security Policy. SPD

```
ip xfrm policy show
```

## list all security assocations. SAD

```
ip xfrm state show
```

# netcat commands

* As a tcp server
    ```
        nc -l -s <src-add> -p <src-port>  # might be wrong. The -l automatically takes the <ip> <port> args as local values.
        nc -l <src-add> <src-port>
    ```
* As a tcp client
    ```
        nc -s <src-addr> -p <src-port> <tgt-add> <tgt-port>
    ```
* As a udp server
    ```
        nc -u -l <optional-src-addr> <mandatory-src-port>   # ip-addr if not mentioned, is any
    ```
* As a udp server and client at same time
    ```
        nc -u -s 192.2.53.2 -p 19000 192.15.2.2 8090
    ```

