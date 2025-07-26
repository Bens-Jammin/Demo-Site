# Routing Concepts

## Path Determination

### Two Functions of Routers

Before a router forwards any packets, it must determine the best path for  the packet to take. Ethernet switches are used to connect end devices and other intermediary devices (router, switches, etc), such as other ethernet switches, to the same network. A router also connects multiple networks, meaning that it has multiple interfaces that belong to different IP networks.

When a router recieves an IP packet on one interface, it determines which interface to forward the packet out of. This is also called routing, since you're routing the packet somewhere else. The interface the packet leaves the router from can be the final destination, or it may be another network connected by another router. Each network that a router connects to typically requires a separate interfacem but this isn't always the case.

The primary functions of a router are:
1. To determine the best path to forward packets based on the information from the routing table
2. To forward packets to their destination

### Best Path Equals Longest Match

How does a router determine the best path using the router table? The best path in the routing table is also known as the longest match. The longest match is a process the router uses to find a match between the destination IP address of the packet and a routing entry in the routing table.

The routing table contains route entries consisting of a network prefix / address, and the prefix length. For there to be a match between the destination IP address of a packet and a route in the routing table, a minimum number of bits must match between the IP address of the packet and the route in the table. Note that the IP packet only contains the destination IP address, not a prefix length.

The longest match is the route in the routing table  that has the greatest number of matching bits with the destination IP address of the packet, when comparing bits left -> right. The route with the greatest number of equivalent bits, or the longest match, is always the preferred route.

**note:** the term *prefix length* will be used to refer to the length of the network portion of ip(v4/6) addresses

### IPv4 Address Longest Match example

In the table, an IPv4 packet has a destination address of 172.16.0.10. The router has three route entries that match this packet: 172.16.0.0/12 , 172.16.0.0/18, 172.16.0.0/26. Of the three routes, 172.16.0.0/26 has the longest match and would therefore be chosen to forward the packet. 

Remember, for any route to be considered a match there must be `n` matching bits, where `n` is the length of the subnet mask of a route.

In this table, the bolded portion of the address represents the longest match in the route entry.

| Destination IPv4 Addresss | Address (binary) |
| --- | --- |
| 172.16.0.10 | **10101100.00010000.00000000.00**001010 |


In this table, the bolded bits are the matched bits for the destination IP address.

| Route Entry | Perfix / Prefix Length | Address (binary) |
| --- | --- | --- |
| 1 | 172.16.0.0/**12** | **10101100.0001**0000.00000000.00001010 |
| 1 | 172.16.0.0/**18** | **10101100.00010000.00**000000.00001010 |
| 1 | 172.16.0.0/**26** | **10101100.00010000.00000000.00**001010 |

### Building a Routing Table

A routing table consists of prefixes and their prefix lengths. How does a router learn about other networks? And how does R1 populate its routing table?

![A logical topology from the perspective of a router showing both local and remote networks](./Images/RC_BuildingARoutingTable.png)

#### Directly Connected Networks

Directly connected networks are netwroks that are configured on active interfaces of a router. A directly connected network is added to the routing table when an interface is configured with an IP address and subnet mask and is active (up and up)

#### Remote Networks

Remote networks are networks that are indirectly connected to the router. Routers learn about remote networks in two ways:
* **Static Routes** -- added to the routing table when a route is manually configured
* **Dynamic Routing Protocols** -- Added to the routing table when the routing protocls dynamically learn about the remote network. Dynamic routing protocols include:
    * Enhanced Interior Gateway Routing Protocol (EIGRP)
    * Open Shortest Path First (OSPF)
    * Other less used protocols

#### Default Route

A default route specifies a next-hop router to use when the routing table doesn't contain an entry that matches with the destination IP address. the default route can be entere manually as a static route, or learned automatically from a dynamic routing protocol.

A default route over IPv4 has a route entry of 0.0.0.0/0, and a default route over IPv6 has a route entry of ::/0. The prefix length of /0 indicates no bits need to match the destination IP address for this route to be used. If there are no routes with more than 0 matching bits then a default route is used to forward the packet. This is also sometimes referred to as a gateway of last resort.