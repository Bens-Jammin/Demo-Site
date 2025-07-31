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

## Packet Forwarding

### Decision Process

Now that the router has determined the best path for a packet based on the longest match, it must determine how to encapsulate the packet adn forward it out the correct exit interface.

![Packet forwarding](./Images/RC_PacketForwarding.png)

The following steps describe the packet forwarding process as shown in the figure above:
1. The data link frame with an encapsulated IP packet arrives at the router
2. The router examines the destination IP address in the packet header and consults the routing table
3. The router finds the longest matching prefix in the routing table
4. The router encapsulates the packet in a data link frame and forwards it out an interface.
5. If there is no matching route entry, the packet is dropped

### Mechanisms

The primary responsibility of the packet forwarding function is to encapsulate packets in an appropriate data line frame type for the outgoing interface. The moure efficiently a router can do this, the faster packets can be forwarded by a router. Routers support the following three packet forwarding mechanisms:
* Process switching
* Fast switching
* Cisco Express Forwarding (CEF)

#### Process Switching

This is an older packet forwarding mechanism still available on some Cisco routers. When a packet arrives at an interface, it is forwarded to the contol plane where the CPU matches the destination address with a routing table entry, then determines the exit interface. This process happens for every single packet that arrives at the router, even packets going to the same interface. This is a very slow process and isn't used often in most modern routers.

![An example of process switching in a router](./Images/RC_ProcessSwitching.png)

#### Fast Switching

Fast switching is another old mechanism which was the successor to process switching. FAst switching involves using a cache to store next-hop information. When a packet arrives on an interface, it is forwarded to the control plane where the CPU searches for a match in the cache. If the cache misses, the packet is process swithced and forwarded out the appropriate interaface. The flow information for that packet is stored in the cache. If another packet is going to the same destination, the next-hop information stored in the cache is reused wihtout getting the CPU involved. 

![An example of fast switching in a router](./Images/RC_FastSwitching.png)

#### CEF

Cisco Express Forwarding is the most recent and now default Cisco IOS packet-forwarding mechanism. Like fast switching, CEF builds a Forwarding Information Base (FIB) and an adjacensy table. The table entries are not packet-triggered like fast switching but change-triggered (i.e. the network topology changed). Therefore, when a network has converged, the FIB and adjacency tables contain all the information a router would need to consider when forwarding a packet. 

![An example of CEF switching in a router](./Images/RC_CEF.png)

A common analogy to describe the three methods is as follows:
* Process switching involves doing long hand math every time
* Fast swtiching involves doing the long hand match and remembering the answer for identical questions
* CEF solves every possible answer ahead of time in a spreadsheet

## Routing Table

How does a router know where it can send packets? By creating a routing table based on the network in which it is connected.

A routing table contains a list of routes to known networks (using network addresses and prefix lengths). The source of this information is derived from:
* Directly connected networks
* Static routes
* Dynamic routing protocols


### Dynamic Routing Protocols

Dynamic routing protocols are used by routers to automatically share information about the reachability and status of remote networks. They can perform several functions, such as network discovery and maintaining routing tables.

Important advantages of dynamic routing protocols are the ability to select a best path, and the ability to automatically discover a new best path when the network topology changes.

Network discovery is the ability of a routing protocol to share information about the network one router knows with other routers using the same routing protocol. Instead of depending on manually configured static routes to remote networks on all routers, a dynamic routing protocol allows routers to learn about these networks from other routers. These networks, and the best path to each, are added to the routing tables of all routers involved.

![Two routers using a dyanmic routing protocol to learn about the entire network](./images/RC_DynamicRouting.png)

## Static and Dynamic Routing

TODO!
[go here](https://www.netacad.com/launch?id=74b04e97-32a7-47b1-ac58-90483ab14589&tab=curriculum&view=5497591c-f0db-588b-a269-41521c76a23d)