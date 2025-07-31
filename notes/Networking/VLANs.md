# VLANs

Virtual LANs (VLANs) act like small conference rooms. Instead of hosting multiple small conferences in a large room, the conferences are split up into separate rooms, so each participant of all the mini conferences can properly hear the content being discussed.

VLANs are created at layer 2 to reduce or eliminate broadcast traffic, meaning devices only need to manage the traffic from the devices within its VLAN. Network admins can organize VLANs by location, users, device type, or any other catergory needed.

## Overview

### VLAN Definition
no
VLANs provide segmentation and organizational flexibility within a switched network. machines within a VLAN act as though they are attached to the same switch. VLANs are based on logical, rather than physical connections.

![A logical topology of a VLAN at a company](./Images/VLANTopology.png)

VLANs allow admins to segment networks based on factors such as function, team, or application, all without regard for the physical location of the devices. Each VLAN is considered a separate logical network, and act as if they are in an independent network even if they share the same physical infrastructuer as other VLANs. Any switch port can belong to a VLAN.

### Types of VLANs

#### Default VLAN

The default VLAN on a Cisco switch is VLAN 1. therefore, all switch ports are on VLAN 1 unless specifically configured to be a different VLAN. By defauly, all layer 2 traffic is associated with VLAN 1.

Important notes about VLAN 1:
* All ports are assigned to VLAN 1 by defauly
* The native VLAN is VLAN 1 by default
* management VLAN is VLAN 1 by default
* VLAN 1 can't be renamed or deleted 

#### Data VLAN

Data VLANs are VLANs configured to separate user traffic. They are referred to as user VLANs because they separate the network into groups of users. Modern networks may have many data VLANs depending on the organization. 
***note:*** voice and network management traffic _should not_ be managed over data VLANs.

#### Native VLAN

A native VLAN is a VLAN which carries untagged traffic over a trunk port.

User traffic from a VLAN must be tagged with a VLAN id when it is sent to another switch. Trunk ports are used between switches to tranmit tagged traffic.

A switch may send untagged traffic across a trunk link. Untagged traffic can come from a switch or from legacy devices. The untagged traffic is usually non-VLAN information (such as data, ARP requests, DNS messages, etc) across the trunk ports, but the main function of the trunk ports is to transmit VLAN data. The native VLAN on a Cisco switch is VLAN 1 / default.

It is a best practice to configure the native VLAN as an unused traffic. It is common to dedicate a fixed VLAN to serve as the native VLAN for all trunk ports on a switched network.

#### Management VLAN

A management VLAN is a data VLAN configured specifically for network management traffic, including:
* SSH
* Telnet
* HTTPS
* SNMP

By default, VLAN 1 is the management VLAN on a layer 2 switch.

#### Voice VLAN

A separate VLAN is needed to support Voice over IP (VoIP). VoIP traffic requires:
* Assured bandwidth to ensure quality
* Tranmission priority over other types of network traffic
* The ability to be routed around congested network regions
* A delay of <150ms across the network

To meet these requirements, the entire network needs to be designed to support VoIP.

## VLANs in a Multi-Switched Environment

### VLAN Trunks

VLANs wouldn't be useful without VLAN trunks. VLAN trunks allow all VLAN traffic to be sent between switches, allowing devices connected to different switches but in the same VLAN to communicate to each other without the need of going through a router. 

A trunk is a point-to-point link between network devices that carries traffic for multiple VLANs. VLAN trunks extend VLANs across networks. 

VLAN trunks do not belong to specific VLANs, instead, they're conduits for multiple VLANs between switches and routers. A trunk can also be used between a network device and a server, or another device that has an appropriate NIC.

![A network topology with highlighted links between S1, S2, and S3 to show where a trunk is required](./Images/VLAN_Trunks.png)

The highlighted links between S1 and S2, and S1 and S3 are trunk links configured to transmit traffic from VLANs 10, 20, and 99 across the network. Without VLAN trunks, this network couldn't work.

### VLAN Identification via Tagging

The standard Ethernet frame header does not contain information about the VLAN to which the frame belongs; therefore, when Ethernet frames are placed on a trunk, information about the VLAN to which they belong must be added. This process of **tagging** is acomplished using the IEEE 802.1Q header. The header includes a 4-byte tag with the original Ethernet frame header which specifies the VLAN the frame belongs to.

When the switch receives a frame on a VLAN, the switch inserts a VLAN tag in the header, recalculates the FCS, and sends the tagged frame out a trunk port.

#### VLAN Tag Field Details

the VLAN tag field consists of a type field, a priority field, a canonical format identifier field, and a VLAN ID field:
* **Type:** a 2 byte value called the _tag protocol ID_ (TPID) value. For Ethernet, it is set to 0x8100.
* **User Priority:** a 3 bit value that supports level or service implementation.
* **Canonical Format Identifier (CFI):** a 1 bit identifier that enables token ring frames to be carried across Ethernet links.
* **VLAN ID:** A 12 bit VLAN id number which supports up to 4096 VLAN IDs.

![The location and breakdown of the VLAN ID tag field in an Ethernet frame](./Images/VLAN_Tag_Field.png)


## Configuration

### Ranges

Different switches support different numbers of VLANs. The number of supported VLANs is large enough to accommodate most organizations. For example, the Catalyst 2960 and 3650 series switches support over 4000 VLANs. Normal range VLANs on switches are numberd 1-1005, and extneded range VLANs are numberd 1006-2094.

#### Normal Range VLANs

The following are characteristics of normal range VLANs:
* used in small-medium sized businesses and enterprises
* Identified by a VLAN ID in the range [1,1005]
* IDs 1002-1005 are reserved for legacy network tech
* IDs 1, 1002-1005 are automatically created and can't be removed.
* Configureations are stored in the switch flash memory in a VLAN database, called `vlan.dat`
* When configured, VLAN trunking protocol (VTP) helps synchronize the VLAN db between switches

#### Extended Range VLANs

The following are characteristics of extended range VLANs:


* They are used by service providers to service multiple customers and by global enterprises large enough to need extended range VLAN IDs.
* They are identified by a VLAN ID between 1006 and 4094.
* Configurations are saved, by default, in the running configuration.
* They support fewer VLAN features than normal range VLANs.
* Requires VTP transparent mode configuration to support extended range VLANs.


### VLAN Setup

#### Creation
```
Switch# 
    configure terminal
    vlan {vlan id}
        name {vlan name}
        end
```

#### Port Assignment
```
Switch#
    configure terminal
        interface {interface id}
            switchport mode access
            switchport access vlan {vlan id}
            end
```

To create a voice VLAN connection, use `switchport voice vlan {vlan id}`.

## VLAN Trunks

### Configuration

```
Switch#
    configure terminal
        interface {interface id}
            switchport mode trunk
            switchport trunk native vlan {vlan id}
            switchport trunk allowed vlan {vlan id list}
            end
```

### Example
In the figure below, VLANs 10, 20, 30 support the Faculty, Student, and Guest computers respectively. The F0/1 port on S1 is configured as a trunk port and forwards traffic for the three VLANs. VLAN 99 is configured to be the native VLAN.

![Network topology example for trunk configuration](./Images/VLAN_TrunkConfig.png)

With each subnet having the following subnets:

| VLAN # | Name | Subnet |
| --- | --- | --- | 
| VLAN 10 | Faculty | 172.17.10.0/24 |
| VLAN 20 | Students | 172.17.20.0/24 |
| VLAN 30 | Guests | 172.17.30.0/24 |
| VLAN 99 | Native | 172.17.99.0/24 |

This example shows the configuration of port F0/1 on S1 as a trunk port. The native VLAN is changed to VLAN 99, and the allowed VLANs on the trunk port is set to 10,20,30,99

```
Switch(config)#
    interface fastEthernet 0/1
        switchport mode trunk
        switchport trunk native vlan 99
        switchport trunk allowed vlan 10,20,30,99
        end 
```

## Dynamic Trunking Protocol

### Introduction to DTP

Some Cisco switches have a proprietary protocol that lets them auto netgotiate trunking with a neighbouring device. This protocol is called Dynamic Trunking Protocol (DTP). DTP can speed up configuration for network admins. Ethernet trunk interfaces support different trunking modes. An interface can be set to trunking or non-trunking, or to negotiate trunking with the neighbour interface.

To enable trunknig fro a Cisco switch to a device that doesn't support DTP, use the following commands to disable negotation (non-Cisco devices cant use DTP).

```
S1(config-if)# switchport mode trunk
S1(config-if)# switchport nonegotiate
```

To reenable DTP, use the following command:
```
S1(config-if)# switchport mode dynamic auto
```

