# The Application Layer

## Application, Presentation, and Session

### Application Layer

The closest layer to the end user. Application layer provides the interface between applications and the network from which the data is transmitted. Application layer protocols are used to exchange data programs running on the host machines.

Based on the TCP/IP model, the three highest layers of the OSI model (application, presentation, session) define functions of the TCP/IP application layer.

There are many applications protocols, and new protocols are being developed everyday. Some of the most common protocols include HyperText Transfer Protocol (HTTP), File Transfer Protocol (FPT), Trivial File Transfer Protocol (TFTP), Internet Message Access Protocol, and Domain Name System (DNS) protocol.

### Presentation and Session Layer

#### Presentation Layer

The presentation layer has three main functions:
* Formatting and presenting data at the source device into a comptible format for the destination machine
* Compressing data in a way that can be decompressed by the destination machine
* Encrypting / decrptying data 

#### Session Layer

As the name suggest, this layer creates and maintains dialogs between the source and destination applications. The session layer handles the exchange of information to initiaite dialogs, keep them active, and restart sessions that are disrupted or idle for a long period of time.

### TCP/IP Application Layer Protocols

The TCP/IP application protocols specify the format and control information for most internet communications. Application layer protocols are used by both the source and destination machines. Similar to the Transport layer, the protocols implemented on the source and destination machines need to be compatible.

## Peer-to-Peer

### Server-Client Model

Server and client processes are considered to be in the application layer. The client begins by requesting data from the server, which responds by sending at least one stream of data to the client. Application layer protocols describe the format of the requests and responses between servers and clients. 

One example of a server-client network is using the email service of an ISP to send, receive, and store the email. The email client on a computer issues a request to the email server for any unread mail. The server responds by sending the emails to the client.

### Peer-to-Peer Model

In the peer-to-peer (P2P) model, all host machines act as both a server and a client. Machines act as "peers" in a network, and data is accessed from a peer device without using a dedicated server.

In a P2P network, two or more computers that are connected using a network can share resources without a dedicated server. One computer can act as a server for one interaction and as a client for another, all at the same time. 

Files aren't the only thing that can be shared. A P2P network would allow users to play networked games or even share an internet connection. 

In P2P exchanges, both devices are considered equal in the communication process. Peer 1 has files that it shares with Peer 2 and can access the shared printer that is directly connected to Peer 2. Peer 2 is sharing the directly connected printer with Peer 1 while accessing the data stored on Peer 1.

### Common P2P Applications

With P2P applications, each computer in a network running one application can act as a client or server for other computers in the network that are also running the application. Common P2P networks include:
* BitTorrent
* Direct Connect
* eDonkey
* Freenet

## Web and Email Protocols

### HTTP and HTML

When a web address or Uniform Resource Locator (URL) is entered into a browser, the web browser establishes a connection to the web service. The web service is running on a server using the HTTP protocol. URLs and Uniform Resource Identifiers (URIs) are names people most associate with web addresses.
 
As an example, lets see how a webpage is opened in a browser. This example will use the [http://www.cisco.com/index.html](http://www.cisco.com/index.html) URL as an example

#### Step 1
The browser interprets three parts of the URL:
* http (the protocol)
* www.cisco.com (the server)
* `index.html` (the specific file)

#### Step 2
The browser then checks with the name server to convert [http://www.cisco.com/index.html](http://www.cisco.com/index.html) into an IP address to connect to the server. The client initiates an HTTP request to a server by sending a GET request to the server to *get* the `index.html` file.

#### Step 3
In response to that request, the server sends the HTML code for the web page to the browser

#### Step 4
The browser deciphers the HTML code and formats tha page for the browser


### HTTP and HTTPS

HTTP is a requst/response protocol. When a client (usually a web browser) sends a request to a web server, HTTP specifies the message types used for the communication. The three most common message types are:
* **GET:** The client is requesting to *get* data from the server.
* **POST:** The client uploads data files to the web server (e.g. form data)
* **PUT:** The client uploads content/resources to the web server (e.g. images) 

HTTP is exxtremely flexible but insecure. The protocol messages are sent using plain text that can be intercepted and read.

For secure communication, the HTTP Secure (HTTPS) protocol is used. HTTPS uses authentication and encryption to secure the data as it travels across the internet. HTTP uses the same client request / server response process as HTTP, but the data stream is encrypted with Transport Layer Security (TLS) or its predecessor Secure Socket Layer (SSL) before being transported across the internet. 

### Email Protocols

One of the primary services offered by an ISP is email hosting. To run on a computer or other end device, emails require several applications and services, as seen below in the figure. Email uses a store-and-forward method of sendting, storing, and retrieving emails. Emails are stored in databases or mail servers.

![A logical topology of an email being sent](./Images/APL_Email.png)

Email clients communicate with mail servers to send and receive mail. Mail servers communicate with other mail servers to transport messages from one 'domain' to another. Email clients do not directly communicate with each other, they both require an intermediary mail server.

Email supports three separate protocols:
* Simple Mail Transfer Protocol (SMTP)
* Post Office Protocol (POP)
* Internet Message Access protocol (IMAP)
The application layer from the sender sends mail using SMTP, and the receiver using either POP or IMAP.

### SMTP, POP, and IMAP

#### SMTP
SMTP message formats require a header and body. The message body has no length limit, but the header must have a properly formatted recipient email address and a sender address.

When a client sends email, the SMTP process connects with a server on the well-known port of 25. After a connection is made, th ecleint attempts to send the email to the server across the network. When the server receives the message, it either places the message in a local account (if the recipient is local) or forwards the message to another mail server for delivery.

The destination email server may be offline or busy when emails are sent; therefore, SMTP spools messages to be sent later. Periodically, the server checks the queue for messages and tries to send them. If the message continues to fail after some predetermined time, it tells the client the email was undeliverable.

![A logical topology example showing the email-hopping for an email being sent](./Images/APL_SMTP.png)

#### POP
POP is used by an application to retrieve mail from a mail server. With POP, mail is downloaded from the server to the client and deleted on the server. This is the default operation for POP.

The server starts the POP service by passively listening on TCP port 110 for client requests. When a client wants to the the service, it sends a TCP connection request with the server. When the connection is established, the POP server sends a greeting. The client and POP server then exchange commands and responses for the duration of the connection.

With POP, email messages are downloaded to the client and removed from the server so there is no centralized location of where emails are kept. Since POP doesn't store messages, it isn't recommended for small business that needs a centralized backup soluion.

The most common version of the protocol is POP3.

![A logical topology example showing the email-hopping for an email being sent](./Images/APL_POP.png)

#### IMAP

IMAP is another protocol that describes a retrieval method for emails. Unlike POP, when the user conencts to an IMAP server, copies of the messages are downloaded to the client, but the originals are kept on the server until manually deleted. Users view copies of the messages in their email client. 

Users can create a file heirarchy on the server to organize and store the mail, which is duplicated on the email client. when a user decides to delete a message, the server synchronizes the action and deletes the message from the server as well.

![A logical topology example showing the email-hopping for an email being sent](./Images/APL_IMAP.png)

## IP Addressing

### Domain Name System

The Domain Name System (DNS) is essential to the modern internet because its much harder to remember IP addresses instead of URLs, or manually configuring devices in a network. 

On the internet, fully quanified domain names (FQDNs) such as [www.cisco.com](https://www.cisco.com) are much easier for people to remember than, say, `198.133.219.38`, which is the actual address of the server. If Cisco decides to changes the IP address of the server, it doesn't affect the user since the domain name stays the same. The new address is simply linked to the existing domain name.

The DNS protocol defines an automated service that matches resource names with the associated IP address. It includes the format for queries, responses, and data. The DNS protocol uses a single format called a message. The message format is used for all types of client queries and server responses, error messages, and rourse information transfer for communication between servers.

#### Step 1
A user types an FQDN into a browsers url field

#### Step 2
A DNS query is sent to the machines designated DNS server for the client computer

#### Step 3
A DNS Server matches the FQDN with its IP address


#### Step 4
The DNS query response is sent back to the client with the desired IP address

#### Step 5
The client computer uses the IP address to make requests to the server

### Message Format

The DNS server stores different types of resource records used to resolve names. These records contain the name, address, and type of the record. Some of these types are as follows:
* **A** - an end device IPv4 Address
* **NS** - an authoritative name server
* **AAAA** - an end device IPv6 address (pronounced quad-A)
* **MX** - a mail exchange record

When a client makes a query, the DNS server process looks at its own records first to resolve the name. If it is unable to resolve the name by using its stored records, it contacts other servers to resolve the name. After a match is found and returned to the original requesting server, it temporarily stores the numbered address, in case the same name is requested again. 

The DNS client service on Windows machines also stores previously resolved names in memory. The command `ipconfig /displaydns` displays all of the cached DNS entries.

### DNS Hierarchy

The DNS protocol uses a hierarchical system to create a database to resolve names. As seen in the figure below, DNS uses domain names to form the hierarchy.

The nameing structure is broken down into small, manageable zones. Each DNS server maintains a specific database file and is only responsible for managing name-to-IP mappings for that small portion of the whole DNS structure. When a DNS server receives a request for a name translation not within its DNS zone, the DNS server forwards the request to another DNS server with the proper zone for translation. DNS is scalable because hostname resolution is spread across multiple servers.

The top-level domains represent the type of organization or the country of origin. Some examples of top-level domains are:
* **.com** - a business or industry
* **.org** - a non-profit
* **.ca** - Canada
* **.fr** - France

![DNS](./Images/APL_DNS.png)

### nslookup

When configuring a network device, usually one or more DNS server addresses are provided that the client can use for name resolution. Usually the ISP provides the addresses to use for the DNS servers. When a user application requests to connect to a remote device by name, the requesting DNS client queries the name server to resolve the name.

Operating systems have a utility called Nslookup that allows users to manually query the name servers to resolve a host name. This utility can be used to troubleshoot name resolution issues, and to verify the statuses of the servers.

#### DHCP

The Dynamic Host Configuration Protocol (DHCP) for IPv4 services automatically assignes IPv4 addresses, subnet masks, gateways, and other IPv4 information. This is referred to as *dynamic addressing*. the alternative to this is manual (static) addressing.

When a host connects to the network, the DHCP server is contacted, and an address is requested. The DHCP server chooses an address from a given range of addresses called a pool, and assigns it to the requesting host.

On large networks, or where the user population changes often, DHCP is the preferred method of address assignment. 

DHCP can allocate IP addresses for a configurable set period of time (the lease period). When the lease period experies or the DHCP server gets a `DHCPRELEASE` message the adderss is returned to the DHCP pool for reuse. Users can freely move from location to location and easily re-establish a connection using DHCP.

As the figure below shows, many types of devices can be DHCP servers. The DHCP server in most medium-large networks are usually a dedicated local server. With home networks, the DHCP server is used on the local router that connects the home network the the ISP.

![A Logical topology of various networks highlighting DHCP servers in different settings](./Images/APL_DHCP.png)

Many networks use both DHCP and static addressing. DHCP is used for general purpose hosts such as your device. Static addressing is usually used for network devices such as gateway routers, switches, servers, and printers.

DHCP for IPv6 (DHCPv6) provides a similar service for IPv6 clients. One important difference is that DHCP doesn't provide a default gateway address. This can only be obtained dynamically using Router advertisement from the router.

### DHCP Operation

When an IPv4 DHCP-configured device boots up or connects to the network, the client broadcases a DHCP discover (DHCPDISCOVER) message to identify any DHSP servers on the network. A DHCP server replies with a DHCP offer (DHCPOFFER) message, which offers a lease to the client. The offer message contains the IPv4 address and subnet mask assigned, the IPv4 address of the DNS server, the IPv4 address of the default gateway, and the lease duration.

The client may recieve multiple DHCPOFFERs if there are multiple DHCP servers in the network; therefore, it must choose between them and sends a DHCP request (DHCPREQUEST) that identifies the explicit server and lease offer the client is accepting. A client may also choose to request an address it was using before.

If the address requested by the client od offered by the server is still available, the server returns a DHCP acknowledgement (DHCPACK) to acknowledge the lease is finalized. If the offer is no longer valid, the server responds with a DHCP negative acknowledgement (DHCPNAK). If a DHCPNAK is returned the selection process must begin with another DHCPDISCOVER. After the client has the lease, it must be renewed before the lease expires by using another DHCPREQUEST.

![DHCP Connection](./Images/APL_DHCPConnection.png)

The DHCP server ensures all IP addresses are unique. Most ISPs use DHCP to allocate public IPs to their customers. 

DHCPv6 has a different set of message, although the format is similar to DHCPv4. The messages are SOLICIT, ADVERTISE, INFORMATION REQUEST, and REPLY.

## File Sharing

### FTP

File Transfer Protocol (FTP) was developed to allow a server and client to transfer data between each other. An FTP client is an application which runs on a computer that is being used to push and pull data from an FTP server.

The client establishes the first connection to the server for control traffic using TCP port 21. The traffic consists of client commands and server replies. The client then establishes the second connection to the server for actual data transfer using the TCP port 20. This connection is created everytime thre is data to be transferred. The data transfer can happen in either direction; the client can download (pull) data or upload (push) data to the server.

### Server Message Block

The Server Message Block (SMB) is a server/client file sharing protocol that describes the structure of shared network resources (directories, files, printers, etc). It is a request-response based protocol. All SMB messages share a common format which uses a fixed-sized header followed by a variable-sized parameter and data componenent.

The three functions of SMB messages are:
* Start, authenticate, and terminate sessions
* Control file and printer access
* Allow an application to send/receive messages to/from another machine

![A file can be copied from PC to PC with Windows Explorer using SMB](./Images/APL_SMB.png)