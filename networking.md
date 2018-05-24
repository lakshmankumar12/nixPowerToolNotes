
[//]: # (Search / LAg to arrive here: networking)

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

#delete a entry
ip neigh delete 9.3.76.43 dev eth0

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

## tc commands

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

## Quickly add a rate limiter to a interface

```
sudo tc qdisc add dev eth0 root handle 1: htb default 12
sudo tc class add dev eth0 parent 1:1 classid 1:12 htb rate 15mbit ceil 15mbit

#remove
sudo tc qdisc del dev eth0 root
```


# Ip-Routing-Tables

* blackhole -> pkt is discarded. No icmp is generated
* throw     -> routing stops at this table. Further tables are taken up. Note: default - throw exists for all tables!

## Sample iptabes

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

### Just drop all pkts

```
iptables -t mangle -A PREROUTING -s ${ip1} -d ${ip2} -j DROP
```

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


host 10.1.2.3
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

## iperf

### server

```
-s        Start as server
-B        bind to this local ip
-p        listen port
```


### help display

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

## Sample commands

```
#nat everything leaving eth0
iptables -t nat -A POSTROUTING -o eth0 -d ! 172.16.0.0/12 -j SNAT --to-source 172.18.14.3
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
