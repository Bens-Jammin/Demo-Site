# Static IP Routing

There are a lot of different ways to dynamically route a packet, so it makes sense to wonder why someone may want to take the time to configure a static route. As it turns out, there are a lot of reasons why someone may want to manually configure a route.

There are different kinds of static routes, and each solves (or avoids) a specific network problem. Many networks use both dynamic and static routing, so network admins need to know how to configure, verify, and troubleshoot static routes.

## Static Routes

### Types of Static Routes

Static routes are common throughout networks, even if there is a dynamic routing protocol configured. For example, an organization could configure a default static route to the service provider and advertise this route to other corporate routers using the dynamic routing protocol.

Static routes can be configured for IPv4 and IPV6. Both protoocls support the following types of static routes:
* Standard static route
* Default static route
* Floating static route
* Summary static route

Static routes can be configured using the `ip route` and `ipv6 route` commands.

### Next-Hop Options

When configuring a static route, the next hop can by identified as an ip address and/or an exit interface (G0/0/0) How the destination is specified creates one of three static routes:

* **Next hop route:** only the next hop IP address is specified
* **Directly connected static route:** only the router exit interface is specified
* **Fully specified static route:** both the next-hop ip address and the exit interface are specified

## Configuring Static IP Routes

Given the following network:

![A logical topology of a network with three routers, each attached to a LAN](./Images/SipR_staticRouteDemo.png)

You can configure router 1 to connect to the remote networks (R2 LAN, R2-R3 WAN, Rr3 LAN) as follows:

### IPv4

#### Next-Hop Static Routing
```
R1(config)# ip route 172.16.1.0 255.255.255.0 172.16.2.2
R1(config)# ip route 192.168.1.0 255.255.255.0 172.16.2.2
R1(config)# ip route 192.168.2.0 255.255.255.0 172.16.2.2
```

With the following routing table:
```
R1# show ip route | begin Gateway
Gateway of last resort is not set
      172.16.0.0/16 is variably subnetted, 5 subnets, 2 masks
S        172.16.1.0/24 [1/0] via 172.16.2.2
C        172.16.2.0/24 is directly connected, Serial0/1/0
L        172.16.2.1/32 is directly connected, Serial0/1/0
C        172.16.3.0/24 is directly connected, GigabitEthernet0/0/0
L        172.16.3.1/32 is directly connected, GigabitEthernet0/0/0
S     192.168.1.0/24 [1/0] via 172.16.2.2
S     192.168.2.0/24 [1/0] via 172.16.2.2

R1#
```

#### Directly Connected Static Route
R1(config)# ip route 172.16.1.0 255.255.255.0 s0/1/0
R1(config)# ip route 192.168.1.0 255.255.255.0 s0/1/0
R1(config)# ip route 192.168.2.0 255.255.255.0 s0/1/0

With the following routing table:
```
R1# show ip route | begin Gateway
Gateway of last resort is not set
      172.16.0.0/16 is variably subnetted, 5 subnets, 2 masks
S        172.16.1.0/24 is directly connected, Serial0/1/0
C        172.16.2.0/24 is directly connected, Serial0/1/0
L        172.16.2.1/32 is directly connected, Serial0/1/0
C        172.16.3.0/24 is directly connected, GigabitEthernet0/0/0
L        172.16.3.1/32 is directly connected, GigabitEthernet0/0/0
S     192.168.1.0/24 is directly connected, Serial0/1/0
S     192.168.2.0/24 is directly connected, Serial0/1/0
```
***note:*** Directly connected static routes are generally only recommended with point-to-point serial interfaces, such as this example

### IPv6

#### Next-Hop Static Routing
```
R1(config)# ipv6 unicast-routing
R1(config)# ipv6 route 2001:db8:acad:1::/64 2001:db8:acad:2::2
R1(config)# ipv6 route 2001:db8:cafe:1::/64 2001:db8:acad:2::2
R1(config)# ipv6 route 2001:db8:cafe:2::/64 2001:db8:acad:2::2
```

With the following routing table:
```
R1# show ipv6 route
IPv6 Routing Table - default - 8 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, RL - RPL, O - OSPF Intra, OI - OSPF Inter
       OE1 - OSPF ext 1, OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1
       ON2 - OSPF NSSA ext 2, la - LISP alt, lr - LISP site-registrations
       ld - LISP dyn-eid, lA - LISP away, le - LISP extranet-policy
       a - Application
S   2001:DB8:ACAD:1::/64 [1/0]
     via 2001:DB8:ACAD:2::2
C   2001:DB8:ACAD:2::/64 [0/0]
     via Serial0/1/0, directly connected
L   2001:DB8:ACAD:2::1/128 [0/0]
     via Serial0/1/0, receive
C   2001:DB8:ACAD:3::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:ACAD:3::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
S   2001:DB8:CAFE:1::/64 [1/0]
     via 2001:DB8:ACAD:2::2
S   2001:DB8:CAFE:2::/64 [1/0]
     via 2001:DB8:ACAD:2::2
L   FF00::/8 [0/0]
     via Null0, receive
```

#### Directly Connected Static Route
```
R1(config)# ipv6 route 2001:db8:acad:1::/64 s0/1/0
R1(config)# ipv6 route 2001:db8:cafe:1::/64 s0/1/0
R1(config)# ipv6 route 2001:db8:cafe:2::/64 s0/1/0
```

With the following routing table:
```
R1# show ipv6 route
IPv6 Routing Table - default - 8 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1
       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP
       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination
       NDr - Redirect, RL - RPL, O - OSPF Intra, OI - OSPF Inter
       OE1 - OSPF ext 1, OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1
       ON2 - OSPF NSSA ext 2, la - LISP alt, lr - LISP site-registrations
       ld - LISP dyn-eid, lA - LISP away, le - LISP extranet-policy
       a - Application
S   2001:DB8:ACAD:1::/64 [1/0]
     via Serial0/1/0, directly connected
C   2001:DB8:ACAD:2::/64 [0/0]
     via Serial0/1/0, directly connected
L   2001:DB8:ACAD:2::1/128 [0/0]
     via Serial0/1/0, receive
C   2001:DB8:ACAD:3::/64 [0/0]
     via GigabitEthernet0/0/0, directly connected
L   2001:DB8:ACAD:3::1/128 [0/0]
     via GigabitEthernet0/0/0, receive
S   2001:DB8:CAFE:1::/64 [1/0]
     via Serial0/1/0, directly connected
S   2001:DB8:CAFE:2::/64 [1/0]
     via Serial0/1/0, directly connected
L   FF00::/8 [0/0]
     via Null0, receive
R1#
```

### Verify a Static Route

Below are some command which may help with verifying a static route:
* show ip/ipv6 route
* ping
* traceroute
* show ip/ipv6 route static
* show ip/ipv6 route {network}
* show running-config | section ip/ipv6 route

## Default Static Routes

Routers commonly use default routs that are either locally configured or learned from another router using a dynamic routing protocol. Default routes are used when no other routes in the routing table match the destination IP address in the packet. If a more specific match doesn't exist, then the default route is used as the **gateway of last resort**

Default static routes are commonly used when connecting an edge router to a service provider nework or a stub router (a router with only one upstream router).

The figure below shows a typical default static route scenario

![A logical topology of a standard static default route scenario](./Images/SipR_DefaultStaticRoute.png)
*R1 only needs to know about directly connected networks. Any traffic to other networks it can use a default static route towards R2*

Creating a static default route is similar to creating a static route, except this time the network and subnet mask is all zeros. For IPv4, this would look like

`Router(config)# ip route 0.0.0.0 0.0.0.0 {ip-address | exit-intf}`

and for IPv6, this would look like:

`Router(config)# ipv6 route ::/0 {ipv6-address | exit-intf}`

### Configuring Default Static Routes

![Logical tpology](./Images/SipR_staticRouteDemo.png)

In the figure above, R1 *could* be configured with three static routes, one to each remote network. However, R1 is a stub router since it's only connected to R2. Therefore, it would be better to configure a single default static route towards R2.

Using the command below, any packets not matching a more specific route entry in the routing table are forwarded to router 2 at 172.16.2.2:

`R1(config)# ip route 0.0.0.0 0.0.0.0 172.16.2.2`

Optionally, this could be configured for IPv6 packets as well:

`R1(config)# ipv6 route ::/0 2001:db8:acad:2::2`

### Verify a Default Static Route

The `show ip route static` command on R1 shows the static routes in the routing table. Note the asterisk next to the route with code 'S'. As detailed after the command, the asterisk indicates the route is a candidate default route, which is why it is selected as the gateway of last resort.

```
R1# show ip route static
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
E1 - OSPF external type 1, E2 - OSPF external type 2
i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
ia - IS-IS inter area, * - candidate default, U - per-user static route
o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
+ - replicated route, % - next hop override

Gateway of last resort is 172.16.2.2 to network 0.0.0.0

S* 0.0.0.0/0 [1/0] via 172.16.2.2
R1#
```

## Configuring Floating Static Routes

### Floating Static Routes

Another type of static route is a floating static route. Floating static routes are static routes that are used to provide a backup path to a primary (static or dynamic) route in the event of a failure. Floating static routes are only used when the primary route fails or is otherwise unavailable. 

To accomplish this, the floating static route is configured with a higher **administrative distance** than the primary route. The administrative distance represents the trustworthiness of a route. If multiple paths to the destination are avaialable, then the router will choose the "most trustworthy" route , or the router with the lowest administrative distance. 

For example, assume an administrator wants to create a floating static route as a backup to an EIGRP-learned route. The floating static route must be configured with a higher administrative distance than EIGRP (90). If the floating static route is configured with an administrative distance of 95, the dynamic route learned from EIGRP is preferred over the floating static route. 

In the figure below, the branch router typically forwards all traffic to the HQ router over a private WAN link. In this example, routers exchange route info using EIGRP. A floating static route with an administrative distance ≥91 can be configured to be a backup route. 

![An example use case of a floating static route for a company](./Images/SipR_FloatingStaticRoute.png)

By default, static routes have an administrative distance of 1, making them preferrable to routes learned from dynamic routing protocols. The administrative distances of some common dyanmic routing protocols are:
* EIGRP: 90
* OSPF: 110
* IS-IS: 115

The administrative distance of a static route can be increase to make the route less desirable than that of another static route or a learned route. In this way, the static route "floats" and is not used when the route with a better administrative distance is active. However, if the preferred route is lost, the floating static route can take over, and the traffic can be sent through the alternate route. 
