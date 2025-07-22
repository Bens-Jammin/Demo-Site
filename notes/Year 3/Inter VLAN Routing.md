# Inter-VLAN Routing

- - -

## Inter-VLAN Routing Operation

### What is Inter-VLAN Routing

VLANs are used to segment switched layer 2 networks. In order to communicate between VLANs, you need a router or a layer 3 switch to provide routing.

Inter-VLAN routing is the process of forwarding network traffic from one VLAN to another.

There are three inter-VLAN routing options:
* **Legacy Inter-VLAN routing:** A legacy solution which does not scale well
* **Router-on-a-stick:** An acceptable solution for small to medium networks
* **Layer 3 switch using switched virtual interfaces (SVIs):** The most scalable solution for medium to large organizations

### Legacy Inter-VLAN Routing

Legacy inter-VLAN routing involves using actual routers to route between VLANs, with each VLAN being connected to different physical router interfaces. This works for small networks, but gets very expensive the more VLANs the network has.

Packets are routed into the router through one interface, and exit through a separate interface.

![A logical topology example showcasing how machines on separate VLANs can communicate to each other by routing traffic to a router](./Images/Inter%20VLAN%20Routing%20-%20Legacy.png)

In this example, when PC1 sends a packet to PC2 on another network/VLAN, the traffic has to go to the router, which then sends the traffic out to PC2. 

Legacy inter-VLAN routing using physical interfaces works but has significant drawbacks. It doesn't scale well since routers have a few number of physical interfaces. Needing oneo physical router interface per VLAN quickily uses up the routers capacity, making it necessary to use multiple routers on even smaller networks.

In this example, two separate ethernet interfaces were needed to route between VLAN 10 and VLAN 20. What would happen if there were six, or eight VLANs to interconnect? By the power law, the number of interfaces needed quickily explodes.

### Router-on-a-Stick Inter-VLAN Routing

The router-on-a-stick routing method overcomes the limitation of the legacy solution, by only using one physical ethernet interface to route between multiple VLANs on a network.


One ethernet interface is configured as a trunk connected to a trunk port on a Layer 2 switch, and the router is configured using subinterfaces to identify routable VLANs.

Configured subinterfaces are software based virtual interfaces, with each one being associated with a single physical ethernet interface. Each subinterface is independently configured with an IP address and an associated VLAN. 

When VLAN-tagged traffic enters the router interface it gets forwarded to the VLAN subinterface. After the routing decision is made based on the destination IP address, the router chooses the exit interface. The data is then VLAN tagged for the new VLAN and is sent out the physical interface.

![A logical topology of a Router-on-a-Stick inter-VLAN routing](./Images/Inter%20VLAN%20Routing%20-%20RoaS.png)

### Inter-VLAN Routing on a Layer 3 Switch

The modern method for inter-VLAN routing is to use a layer 3 switch and switched virtual interfaces (SVI). An SVI is a virtual interface configured on a layer 3 swtich.

***note:*** Layer 3 switches are also called multilayer switches, as they perform level 2 and level 3 operations. 

Although virtual, SVIs perform the same functions for the VLAN as a router interface would. That is, it provides layer 3 packet processing that are sent for or from all switch ports associated with that VLAN.

The following are advantages of using layer 3 switches for inter-VLAN routing: 
* Much faster than RoaS, because everything is hardware switched and routed
* No need for external links from the switch to the router
* Not limited to one link
    * Layer 2 etherchannels can be used as trunk links between the switches to increase bandwidth in high-capacity networks
* Lower latency because the data does not leave the switch to be properly routed

The only disadvantage to this solution is the price, layer 3 switches are expensive.

![A logical topology of a layer 3 switch inter-VLAN routing](./Images/Inter%20VLAN%20Routing%20-%20Layer%203%20Switch.png)
