# Inter-VLAN Routing

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


## Configuration

### Router-on-a-Stick

We will setup a router-on-a-stick inter VLAN connection using this topology:

![A logical topology of a Router-on-a-Stick inter-VLAN routing](./Images/Inter%20VLAN%20Routing%20-%20RoaS.png)

Note that configuration for both switches are nearly identical, using the relative ip address and local VLANs instead.

#### Configure Switch 1

**STEP 1: Create and Name VLANs**
```
S1(config)# vlan 10
S1(config-vlan)# name LAN10
S1(config-vlan)# exit
S1(config)# vlan 20
S1(config-vlan)# name LAN20
S1(config-vlan)# exit
S1(config)# vlan 99
S1(config-vlan)# name Management
S1(config-vlan)# exit
S1(config)#
```
**STEP 2: Create the Management Interface**
```
S1(config)# interface vlan 99
S1(config-if)# ip add 192.168.99.2 255.255.255.0
S1(config-if)# no shut
S1(config-if)# exit
S1(config)# ip default-gateway 192.168.99.1
S1(config)#
```

**STEP 3: Configure Access Ports**
```
S1(config)# interface fa0/6
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 10
S1(config-if)# no shut
S1(config-if)# exit
S1(config)#
```

**STEP 4: Configure Trunking Ports**
```
S1(config)# interface fa0/1
S1(config-if)# switchport mode trunk
S1(config-if)# no shut
S1(config-if)# exit
S1(config)# interface fa0/5
S1(config-if)# switchport mode trunk
S1(config-if)# no shut
S1(config-if)# end
*Mar  1 00:23:43.093: %LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/1, changed state to up
*Mar  1 00:23:44.511: %LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/5, changed state to up
```

#### Configure Switch 2
Configuring Switch 2 is similar to configuring Switch 1, we just change which interfaces we connect to and which ports are trunking ports.

```
S2(config)#
    vlan 10
        name LAN10
        exit
    vlan 20
        name LAN20
        exit
    vlan 99
        name Management
        exit

    interface vlan 99
        ip add 192.168.99.3 255.255.255.0
        no shut
        exit
    ip default-gateway 192.168.99.1
    interface fa0/18
        switchport mode access
        switchport access vlan 20
        no shut
        exit
    interface fa0/1
        switchport mode trunk
        no shut
        exit
        end
```

#### Configure Router Subinterfaces

The router-on-a-stick method requires you to create a subinterface for each VLAN that is routed.

A subinterface is created using the `interface {interface id}.{subinterface id}` command. Although not required, most of the time the subinterface id is the same as the VLAN number 

Each subinterface is configured using the following commands:

`encapsulation dot1q {vlan id} [native]` configures the subinterface to respond to 802.1Q encapsulated traffic. This is required because the 802.1Q standard enables VLANs to travel across ethernet networks, and is therefore a necessity for router-on-a-stick routing. The `native` keyword is only appended to set the native VLAN to something other than VLAN 1. More specifically, if you're trying to send native (raw) data to the router, the `native` keyword allows the router interface to accept the untagged data. Using a second interface would work all the same, but that would use up the limited number of interfaces the router has.

`ip address {ip address} {subnet mask}` configures the IPv4 address of the subinterface. This is usually used as the default gateway for the VLAN.

These commands are used foe each VLAN to be routed. Each router subinterace must be assigned an IP address on a unique subnet for routing.

When all subinterfaces have been created, you can enable the physical interface using `no shutdown`. If the physical interface is not enabled, traffic can not be accepted by the router and therefore not properly routed.

![A logical topology of a Router-on-a-Stick inter-VLAN routing](./Images/Inter%20VLAN%20Routing%20-%20RoaS.png)

In the below configuration, the subinterfaces for Router 1's G0/0/1 interface (as seen above) are configured for VLANs 10, 20, and 99.

```
R1(config)#
    interface G0/0/1.10
        description Default-gateway for VLAN10
        encapsulation dot1Q 10
        ip address 192.168.10.1 255.255.255.0
        exit

    interface G0/0/1.20
        description Default-gateway for VLAN20
        encapsulation dot1Q 20
        ip address 192.168.20.1 255.255.255.0
        exit
    
    interface G0/0/1.99
        description Default-gateway for VLAN99
        encapsulation dot1Q 99
        ip address 192.168.99.1 255.255.255.0
        exit
    
    interface G0/0/1
        description Trunk link to Switch1
        switchport mode trunk
        no shutdown
        end
```

### Layer 3 Switch

We will setup a layer 3 switch inter VLAN connection using this topology:

![A logical topology of a layer 3 switch inter-VLAN routing](./Images/Inter%20VLAN%20Routing%20-%20Layer%203%20Switch.png)

#### Step 1: Create the VLANs
```
D1(config)# vlan 10
D1(config-vlan)# name LAN10
D1(config-vlan)# vlan 20
D1(config-vlan)# name LAN20
D1(config-vlan)# exit
D1(config)#
```

#### Step 2: Create the SVI VLAN Interfaces.
```
D1(config)# interface vlan 10
D1(config-if)# description Default Gateway SVI for 192.168.10.0/24
D1(config-if)# ip add 192.168.10.1 255.255.255.0
D1(config-if)# no shut
D1(config-if)# exit
D1(config)#
D1(config)# int vlan 20
D1(config-if)# description Default Gateway SVI for 192.168.20.0/24
D1(config-if)# ip add 192.168.20.1 255.255.255.0
D1(config-if)# no shut
D1(config-if)# exit
D1(config)#
*Sep 17 13:52:16.053: %LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan10, changed state to up
*Sep 17 13:52:16.160: %LINEPROTO-5-UPDOWN: Line protocol on Interface Vlan20, changed state to up
```

#### Configure Access Ports
```
D1(config)# interface GigabitEthernet1/0/6
D1(config-if)# description Access port to PC1
D1(config-if)# switchport mode access
D1(config-if)# switchport access vlan 10
D1(config-if)# exit
D1(config)#
D1(config)# interface GigabitEthernet1/0/18
D1(config-if)# description Access port to PC2
D1(config-if)# switchport mode access
D1(config-if)# switchport access vlan 20
D1(config-if)# exit
```

#### Enable IP Routing

This command allows traffic to be exchanged between the VLANs. This command must be configured to enable the inter-VLAN routing.

```
D1(config)# ip routing
D1(config)#
```
