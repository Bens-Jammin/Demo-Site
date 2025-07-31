# Switching Concepts

## Frame Forwarding

### Switching in Networking

The concept of switching and forwarding frames is universal in networking. Various types of switches are used in LANs, WANs, and in public switched telephone networks (PSTN).

A LAN switch maintains a table that is referenced when forwarding traffic through the switch. The only 'intelligence' of a LAN switch is its ability to forward traffic. A LAN switch forwards traffic based on the incoming port and the destination MAC address of the incoming frame. In LAN switches there is only one master switching table which describes a strict association between MAC addersses and ports; therefore, an Ethernet frame with a given destination address will always exit from the same port, regardless of which port from which it entered the switch.

### The MAC Address Table

A switch is mostly made up of integrated circuits and the accompanying software that controls the paths through the switch. Switches use destination MAC addresses to direct traffic through the switch and out the appropriate port.

For a switch to know which prot to use to transmit a frame, it must learn which devices exist on each port. As the switch learns which devices are connected on which ports, it builds a MAC address table. This is stored in content addressable memory (CAM) - a special type of memory used for high-speed searching. 

LAN switches determine how to handle incoming data frames by maintaining the MAC address table. A switch populates its MAC address table by recording the source MAC addresses of each device connected to each port. The switch references this table to send frames destined for a specific device out the port which is assigned to that MAC address.

### Learn and Forwarding

The following two-step process is performed on every ethernet frame that enters a switch.

#### Step 1: Examine the Source MAC Address

Every frame that enters a switch is checked for new information to learn. This is done by reading the MAC address of the frame and port number from which the frame entered the switch.
* If the source MAC address doesn't exist in the MAC address table, a new entry is made with the MAC address and the incoming port number
* If the source MAC address exists and has the same port number, the switch updates the refresh timer for the entry. The default time for entries is five minutes. 
* If the source MAC address does exist but on a different port, the switch treats this as a new entry. This "new" entry replaces the old entry but now with the current port.

#### Step 2: Forwarding

If the destination MAC address is a unicast address, the switch will look to match the destination MAC address and an entry in the MAC address.
* If the destination MAC address is in the table, the frame is forwarded out of the specified port.
* If the destination MAC address isn't in the table, the switch will forward the frame out *all* ports (except the incoming port). This is called an **unkown unicast**. If the destination MAC address is broadcast or multicast, the frame is flooded out all ports except the incoming port.

### Forwarding Methods

Switches make layer two forwarding decisions very quickly because of the software on their Application-Specific-Integrated Circuits (ASIC). ASICs reduce the time it takes managing each frame and allows them to manage more frames without harming the performance of the frame.

Layer 2 switches use one of two methods for switching:
* **Store and forward:** The switch makes a forwarding decision on a frame after it has received the entire frame and checked there have been no errors by checking the CRC. This is the primary switching method for Cisco's LAN switches.
* **Cut-through:** This method forwards the frame after destination MAC address and the exit port have been determined.

### Store-and-Forward

Store and forward switching has two main characteristics:
* **Error checking:** After receiving the entire frame, the switch checks the frame check sequence (FCS) value in the last field of the datagram against its own FCS calculation. If the frame contains no errors, the switch forwards the frame. Otherwise, it is dropped.
* **Automatic buffering:** The entrance port buffering used by store-and-forward provides flexibility to support any ethernet speeds. For example, handling an incoming frame travelling into a 100 Mb/s ethernet port that must be sent out a 1Gb/s interface requires the store-and-forward method. With any speed mismatch between the entrance and exit ports, the switch stores the entire frame in a buffer, checks the FCS, then forwards it out of the switch.

![An abstraction of what data the switch reads from an incoming frame to determine what to do with it](./Images/SC_StoreAndForwarding.png)

### Cut-Through

The store and forward method drops frames that don't pass the FCS check; therefore, it doesn't forward invalid frames. In contrast, the cut through method can forward invalid frames because the switch doesn't perform an FCS check. The primary benefit of cut through switching is extremely fast frame switching. A switch is able to perform a forwarding decision as soon as its avaiable, once the destination MAC address of the frame has come in and has searched the MAC address table.

![An abstraction of what data the switch reads from an incoming frame to determine what to do with it](./Images/SC_CutThrough.png)

Fragment free switching is a modified version of cut-through switch in which the switch only starts forwarding the frame. Fragment free switching provides better error checking, with only minor increases in latency.

The lower latency of cut through switching makes it better for extremely demanding, high performance computing needs that require process-to-process latencies of 10 microseconds (10 millionths of a second) or less.

Cut through switching can forward frames with errors. If the error rate for the forwarded frames is high, then cut through switching can have a negative impact on bandwidth, and end up clogging bandwidth with invalid frames.

## Collision and Broadcast Domains

### Collision Domains

In Legacy hub-based ethernet segments, network devices competed for the shared medium. The network segments that share the same bandwidth between devices are known as collision domains. When two or more devices within the same collision try to communicate at the same time, a collision will occur.

A collision domain is a section of a network where packets *may* collide.

There are no collisions when switch ports are at full duplex, but there can be a collision domain if a switch port is at half-duplex.

By default, ethernet switch ports will autonegotiate full-duplex when the adjacent device can also handle full-duplex. If the switch port is connected to a device operating in half-duplex, then the switch port will operate in half-duplex.  

### Broadcast Domains

A collection of connected switches forms a single broadcast domain. Only a network layer device like routers can divide layer two broadcast domains. Routers are used to segment broadcast domains, but can also segment collision domains.

A broadcast domain is a section of a network, where every device in the broadcast domain can message every other device in the domain using by sending a broadcast. The layer 2 broadcast domain is sometimes referred to as the MAC broadcast domain. 

The figure below contains two broadcast domains, highlighted with the yellow rectangles.

![A logical topology showcasing two broadcast domains](./Images/SC_BroadcastDomain.png)

When a switch receives a broadcast frame, it forwards the frame out every port except the port the frame entered. Each device connected to the switch gets a copy of the broadcast frame and processes it.

Broadcasts can sometimes be necessary for initially locating other devices and network services, but can reduce the efficiency of the network. Bandwidth is used to propagate the traffic, and if too many broadcasts on an already heavily loaded network can cause congestion.

When two switches are connected together, the broadcast domain expands, as seen in the above figure. In this case, the switch forwards the broadcast out all ports, one of which is connected to switch 2. Then switch 2 receives the broadcast frame and forwards it out all of its ports.

### Alleviating Network Congestion

LAN switches have special characteristics which can help them alleviate network congestion. By default, interconnected switch ports try to establish a full duplex link, therefore eliminating collision domains. Each full duplex port of the switch provides the full bandwidth to the device(s) connected to that port. Full duplex connections have significantly increased LAN performance, and are required for speeds of 1Gb/s or higher.

Characteristics that can help reduce network congestion include:
* **Fast port speeds:** Switch port speeds vary by model and purpose. Most access layer switches support 100mb/s and 1gb/s speeds. Distribution layer switches support 100mb/s, 1gb/s, and 10gb/s speeds. Higher speeds reduce congestion but cost much more.
* **Fast internal switching:** switches use a fast internal bus or shared memory for high performance
* **Large frame buffers:** Switches use large memory buffers to temporarily store more incoming frames before needing to drop the. This helps incoming traffic traffic from a faster port to be forwarded to a slower exit port without losing frames.
* **High port density:** Higher port density lowers overall costs because it reduces the number of switches needed for the network. For example, if you need 96 ports, it's less expensive to get two 48-port switches instead of four 24-port switches. This also helps keep traffic local and reduces the chance of inter-switch forwarding.