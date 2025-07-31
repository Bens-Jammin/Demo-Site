# File System Implementation

## Structure
- - -
Disks provide most of the storage for file systems because:
1. A disk can be rewritten in place. You can read a block from the disk, modify the block, and write it back into the same block on disk
2. A disk can directly access and block of information it contains. Because of this, it is simple to access any file (either sequentially or randomly), and switch from one file to another requires the drive moving the readwrite heads and watiting for the disk to rotate

Nonvolatile memory (NVM) devices are increasingly being used for file storage and file systems. They are different from hard disks in that they cannot be reqritten in place, and they have different performance characteristics. 

To improve I/O efficiency, I/O transfers between main memeory and storage are performed in units of blocks. Each block on a hard  disk has one or more sectors, usually either 512 bytes or 4096 bytes. 

File systems provide efficient and convenient access to the storage device by allowing data to be stored, located, and fetched easily. 

## Operations
- - -

### Overview 

Several on-storage and in-memory strucutres are used to implement file systems. Theses structures vary depending on the OS and fs, but there are general principles which can apply. 

On storage, the fs may contain information about:
* How to boot an os stored on disk
* The total number of blocks
* The number / location of free blocks
* The directory structure
* Data about individual files

Although these structured are described later, here is a brief description of a few of them:
* **boot control block** (per volume) contains information needed by the system to boot an OS from that volume. This block can be empty if a boot loader isn't needed. This is typically the first block of a volume. Sometimes also called the boot block, or partition boot sector.
* **volume control block** (per volume) contains details about the volume, such as the number of blocks in the volume, the size of blocks, a free-block count with free-block pointers, a free-FCB count with FBC pointers. Sometimes also called a superblock or the master file table.
* A directory structure (per file system) organizes files. This can sometimes include file names and associated inode numbers.
* A per-file FCB contains critical file data. It has a unique id to allow association with a directory entry. 

The in-memory information is used for both file-system management and performance improvement via caching. The data is loaded at mount (made accessible) time, updated during file-system operations, and discarded at dismount (made inaccessible). Some structures used include:
* An in-memory **mount table** holds information about each mounted volume
* An in-memory directory structure cache holds directory information of recently used directories
* The system-wide open-file table contains a copy of the FCB of each open file
* The per-process open-file-table contains pointers to the entries in the system-wide open-file table for all files a process has open.
* Buffers hold file system blocks when they are undergoing I/O operations

To create a new file, a process calls the logical file system. To create a new file, the lfs allocates a new FCB (or allocates a free FCB if all FCBs are created at file-system creation). The system then reads the appropriate directory into memory, updates it with the new name and FCB, and writes back to the file system. 

![A logical view of the information stored in a typical file control block (FCB)](./Images/FSI_FCB.png)

Some systems (e.g. UNIX) treat a directory like a file, with a type of directory. Some other systems (e.g. Windows) implement separate system calls for files and directories, and treat directories as a separate entitiy from files. 

### Usage

Now that a file is created, it can be used for I/O. First, we need to open the file. The `open()` call pases a file name into the lfs. the `open()` syscall first searches the system-wide open-file table to see if it is already in use by another process. If it is, a per-process open-file table entry is created pointing to the existing system-wide open file table. This saves significant overhead. If the file is not already open, the directory is searched for the given file name. Parts of the directory structure are usually cached in memory to speed directory search operations. Once found, the FCB is copied into a system-wide open file table in memory. This table stored the FCB and the numnber of processes which have this file open. 

Next, an entry is made in the per-process open file table with a pointer to the entry in the system-wide open file table, along with other fields. These other fields may include a pointer to the current location in the file (for `read()`ing or `write()`ing), and the current access mode used for the file. The `open()` call returns a pointer to the appropraite entry in the per process file-system table. All file operations are performed on this pointer. The file name may not be a part of the file-system table, because the file has no use for the name once the FCB is located on disk. It is sometimes cached in order to save time on subsequent opens. The name to the entry is usually called either a *file descriptor* (UNIX-based) or a *file handle* (Windows).

When the process closes the fiel, the per-process table entry is removed, and the system-wide entry's open count is decremented. When the open count reaches 0, any updated metadata is copied back to the disk-based structure, and the system-wide table entry is removed.

Caching is very important for file-system structures to help save time. Most systems keep all information about an open file except for the actual data in memory. 

![A visual demonstrating opening a file in memory and on disk](./Images/FSI_OpenFileProcess.png)

Steps for opening the file:
1. A process requests to open a file of a given name
2. The directory structure is searched for the given file name
3. The entry is loaded into kernel memory, if it is not already there
4. The directory structure includes the FCB of the file, which is loaded into the system-wide open file table
5. The per-process open file table creates an entry which points to the entry in the system-wide table, which the process can access
6. A file descriptor/handle is an index into the per-process table that is returned to the calling process which allows it to access the now opened file

![A visual demonstrating read from a file](./Images/FSI_FileReadProcess.png)

Steps for reading from a file:
1. A read of a data block of an open file uses the file descriptor/handle as an index into the per-process open file table, which points to the FCB in the system-wide open file table
2. The FCB has the information needed to find the data blocks on disk, which is returned to the calling process. 

## Directory Implementation
- - -

The choice of directory management algorithms significantly affects the efficiency, performance, and reliability of the file system.

### Linear List

The simplest method of implementing a directory is to use a linear list of file names with pointers to the data blocks. This is simple to program but has bad performance. To create a new file, we must search the directory to ensure no other file exists with that same name. Then, we add a new entry at the end of the directory. To delete a file, we search the directory for the file and release the space allocated to it. To reuse the directory entry, we can do one of the following:
1. Mark the entry as unused (by assigning a special name, usually an all-blank name or an invalid inode number of 0 )
2. Attach it to a list of free directory entries
3. Copy the last entry in the directory into the freed location and decrease the length of the directory

The biggest disadvantage of a linear list is that finding a file requires a linear search of the directory. Directory information is used frequently, and users will feel the O(n) search time. Most operating systems use a cache to store the most recently used directory information. A cache hit avoids the need to constantly reread from storage. A sorted list allows us to use a binary search to find the files, but this requires the list to be sorted after every creation and deleting - also time consuming.

### Hash Table

Another data structure used for a file directory is a hash table. Here, a linear list stored the directory entries, but a hash data structure is also used. The hash table take sa value computed from the file name and returns a pointer to the file name in the list. Therefore, it can greatly decrease the search time. Insertion and deletion are also relatively straightforward, although some provision must be made for collisions.

the biggest difficulty with hash tables are the fact they are generally fixed in size and the dependence on a hash function of that size. For example, assume we make a linear-probing hash that can hold 64 entries. The hash function converts file names into integers in the range [0, 63]. If we later try to create a 65th file, we must enlarge the directory's hash table. As a result, we need a new hash function that can map the file names to the new range of [0, 127], and we must reorganize the existing entries to reflect their new hashed values.

Alternatively, we can use a chained-overflow hash table. Each hash entry can be a linked list, and we can resolve collisions by appending the entry to the end of the linked list. Lookups may be slightly slowed because we may need to search a list of colliding table entries, but this is likely much faster than a linear search through the entire directory.

## Allocation Methods
- - -
The direct-access nature of secondary storage gives us the flexibility in the implemenation of files. In almost every case, many files are stored on the same device, the main problem is how to allocate space to these files that also optimizes the space used, and allows us to access the files quickily. Three major methods are widely used for allocating secondary storage space: contiguous, linked, and indexed. 

### Contiguous Allocation

Contiguous allocation requires that each file occupies a set of contiguous blocks on the device. Device addresses define a linear ordering on the device. With this ordering, assuming that only one job is accessing the device, accessing block `b+1` after block `b` normally requires no head movement. When head movement is needed (when going from the last sector of one cylinder to the first sector of the next cylinder), the head only needs to move from one track to the next. Thus, for HDDs, the number of disk seeks required for accessing contiguously allocated files in minimal. This also applies for seek time when a seek is needed.

The contiguous allocation of a file is defined by the address of the first block, and the length (in block units) of the file. If the file is `n` blocks long and starts at location `b`, then the file occupies blocks `b`, `b+1`, `b+2`, ... `b+n-1`. The directory entry for each file records the start address and the length of the area allocated to the file. Contiguous allocation is easy to implement but has limitations, and is therefore not used in modern file systems.

![An image showing an example of a directory and file locations on disk, noting the file name, the start block index, and the length of the allocated area](./Images/FSI_ContiguousMemoryAllocation.png)

Accessing a file that has been allocated contiguously is simple. For sequential access, the file system remembers the address of the last block referenced and, when necessary, reads the next block. For direct access to some block `i` of a file that starts at block `b`, we can immediately go to block `b+i`. Thus, both sequential and direct access is supported on contiguously allocated file structures.

The contiguous allocation problem can be seen as a particular application of the general dynamic storage-allocation problem, which involves how to statisfy a request of size `n` from a list of free holes. First fit and best fit are common strategies used to select a free hole from a set of available holes. Neither first nor best fit are clearly better than the other in terms of storage utilization, but first fit is generally faster.

All these algorithms suffer from the problem of *external fragmentation*. As files are allocated and deleted, the free storage space is broken into pieces. External fragmentation exists whenever free space is broken into chunks. This becomse a major problem when the largest contiguous chunk is insufficient for a request. Storage is fragmented into a number of holes, none of which can supply enough storage for the data. The severity of external fragmentation varies, depending on the total storage of the disk and the average size of files.

One strategy for preventing loss of significant amounts of storage space to external fragmentation is to copy the entire file system onto a different device. The original device is then completely free, creating a single, massive contiguous free space. We then copy the files back on to the original device by allocatin from this single large hole. This effectively compacts all the free space into one contiguous space. The cost of this is time, and the cost can be significant, depending on how large the storage device is. Compacting the devices may take hours, and can sometimes be necessary to complete weekly. Some systems require this be done offline, with the file system unmounted. During the downtime, normal system operations are generally prohibited, so compaction is generally avoided at all costs on production machines. 

Another problem with contiguous allocation is determining how much space is needed for a file. When the file is created, the total amount of space it will needed needs to be determined then allocated. How does a program/person know the size of the file? In some cases, this determination can be fairly simple (e.g. copying an existing file), but in general, the size of an file is difficult to estimate. 

If too little space is allocated, we might find the file cannot be extended, especially with a best-fit allocation since the space on both sides of the file could be in use. In this case, two possibilities exist:
1. Terminate the user program and provide an appropriate error message. This then requires the user to allocate more space and re-run the program.
2. Find a larger hole, copy the contents of the file to the new space, then release the old space. This can be repeated as long as space exists, but is a time-consuming process. This option does not require the user to know that it happened, and the system continues running.

Even if the total space needed for a file is known in advance, preallocation may be inefficient. A file that grows slowly over a long period of time (months or years) must have all its space allocated in advance for its final size, even if most of that space won't be used for a long time. The file therefore has a long of internal fragmentation.

To minimize these drawbacks, an OS can use a modified contiguous allocation scheme. here, a contiguous chuck of space is loaded initially. If the amount is insufficient, another chunk of contiguous space called an **extent** is added. The location of a files blokcs are then recorded as a location and block count, plus alink to the first block of the next extent. Internal fragmentation can become a problem if the extents are too large, and external fragmentation can become a problem as extents of varying sizes are allocated and deallocated.

### Linked Allocation

Linked allocation solves every problem with contiguous allocation. With linked allocation, each file is a linked list of storage blocks. The blocks can be scattered anywhere on the device. The directory contains a poitner to the first and last blocks in the file. These pointers are not available to users. Therefore, if each block is 512 bytes and a block pointer requires 4 bytes, then the user sees blocks of 508 bytes.

![An image showing an example of a file might appear like on disk using linked allocation](./Images/FSI_LinkedMemoryAllocation.png)

To creat a new file, we create a new entry in the directory. With linked allocation, each directory entry has a pointer to the first block of the file. This pointer is initialized to `null` and the size field is set to 0 to signify an empty file. A write to the file causes the free-space management system to find a free block. This new block is written to and is linked to the end of the file (if it is the first write, is is also written to the start of the file). To read a file, we read blocks by following the pointers from block to block. There exists no external fragmentation using linked allocation, and any free block on the free-space list can be used to satisfy any request. The size of a file does not need to be known ahead of time. A file can continue to grow as long as there is space available. Concequently, it is never required to compact the disk space.

Linked allocation has some disadvantages. The biggest of which is that it can be used effectly only for sequential-acess files. To find the `i`th block of a file, we must start at the start of the file and follow the pointers until you get to the `i`th block. Each access to a pointer requires a storage read, and sometimes also require an HDD seek. Consequently, it is inefficient to support direct-access on linked-allocation files.

Another disadvantage is the space required for the pointers. If a pointer requires 4 bytes out of a 512 byte block, then 0.78% of the disk is being used for pointers instead of useful information. Each file requires therefore requires slightly more space than it would without pointers.

The standard solution to this problem is to collect blocks into groups, called **clusters**, and to allocate in clusters rather than blocks. For example, the file system may define a cluster as four blocks and operate on the secondary storage only in units of clusters. Pointers then use much less of the files overall space on disk. This method allows logical-to-physical block mapping to remain simple but improve the HDDs throughput since fewer seeks are required. The cost of this approach is an increase in internal fragmentation, because more space is wasted when a cluster is partially full compared to when a partially full block. 

Another problem with linked allocation is reliability. Recall that the files are linked together by pointers scattered across the device. What would happen if a pointer is lost or damaged? A bug in the operating system or hardware failure can result in a wrong pointer. This error can result in linking into the free-space list or into another file. One (partial) solution is to use doubly linked lists, and another is to store the file name and relative block number in each block. These solutions require even more overhead for each file.

An important variable on linked allocation is the use of a **file-allocation table** (FAT). This simple but effective method of disk allocation was used in MS-DOS. A section of storage at the beginning of each volume is set aside to contain the table. The table has one entry for each block and is indexed by block number. the FAT is used in a similar way as a linked list. The directory contains the block number of the first block of the file. This chain continues until it reaches the last block, which has a special `end-of-file` value in the entry. An unused block is indicated by a value of `0`. Allocating a new block to a file is a simple matter of finding the first 0-valued table entry and replacing the previous `end-of-file` value with the address of the new block. The `0` is then replaced with `end-of-file`.

![An example of a FAT used to track the blocks used for a file](./Images/FSI_FAT.png)

The FAT allocation can result in a significant number of disk head seeks, unless the FAT is cached. The disk head must move to the start of the volume to read the FAT to find the location of the block in question, then move to the location of the block itself. In the worst case, both moves occur for each of the blocks. A benefit is that random-access time improved because the disk head can find the location of any block by reading that in the FAT.

### Indexed Allocation

Indexed allocation solves the external fragmentation and size-declaration problems of contiguous allocation; however, in the absence of a FAT, linked allocation cannot support efficient direct access because the pointers are scattered across the disk and must be retrieved in order. Indexed allocation solves this problem by bringing all the pointers together into one central **index block**.

Each file has its own index block, which is an array of storage-block addresses. The `i`th entry in the index block points to the `i`th block of the file. The directory contains the address of the index block. To find and read the `i`th block, we use the pointer in the `i`th index in the block entry. This is similar to paging.

![An example of how an indexed allocated file is implemented](./Images/IndexedFileAccess.png)

When the file is created, all pointers in the index block are set to `null`. When the `i`th block is first written, a block is obtained from the free-space manager, and its address is put in the `i`th index in the block.

Indexed allocation supoprts direct access without suffering from external fragmentation, because any free block can satify the request (like with ;linked allocation). Indexed allocation does suffer from wasted space. The pointer overhead of the index block is general greater than the pointer overhead of linked allocation. Consider a common case where we have a file which only needs a couple blocks. With linked allocation we only lose the space of one pointer per block, but with indexed allocation we lose an entire block of memory.

This point raises the question of how large the index block should be. Every file must have an index block, so the block should be as small as possible. If the index block is too small, it won't be able to hold enough pointers for large files, and a workaround would need to be implemented, such as:
* **Linked scheme**: An index block is normally one storage block; therefore, it can be read and written to directly. To allow for larger files, we can link together several index blocks. For example, an index block may contain a small header containing the name of the file and the first 100 disk-block addresses. The last address is either `null` (for small-medium files) or is a pointer to another index file (for large files).
* **Multilevel index**: A variant of linked representation uses a first-level index block to point to a set of second-level index blocks, which point to the file blocks. This is similar to a two-level directory system. To access a block, the OS uses the first-level index to find a second-level index block, then use that block to find the data block address. This can be continued to third or even fourth level, depending on the desired max file size. With 4096-byte blocks, we could store 1024 four-byte pointers in a single index block. Two levels of indexes allow 1 048 576 data blocks and a file size of up to 4 GB. 

* **Combined scheme**: The combined scheme keeps the first, say, 15 pointers of the index block in the files inode. The first 12 of these point to blocks of actual file data. Therefore, the data for small files do not need a separate index block. For 4kb blocks, up to 48 kb of data can be accessed directly. The next three pointers can opint to indirect nodes. The first points to a single indirect block which contain pointers to file data. The second points to a double indirect block, which contains pointers to index blocks of pointers to data. The last pointer contains the address of a triple index block. With this method, the number of blocks that can be allocated for a file exceeds the amount of addressible space by the 4-byte file pointers most operating system uses, as a 32-bit pointer can point to 2^32 addresses, or up to 4gb. 

![An example of a combined inode and its pointer structure ](./Images/FSI_CombinedIndexMemAllocation.png)

Indexed allocation schemes suffer from some similar performance problems as linked allocation, specifically, the index blocks can be cached in memory, but the data blocks may be spread all over a volume.

## FreeSpace Management
- - -

With limited storage space, we need to reuse space from deleted files for new files. To keep track of free disk space, the system maintains a free-space list. The free-space list records all free device blocks - those not allocated to a file or directory. To create a file , we search the free spce list to find enough space for the job and allocate that space to the new file. This space is removed from the free-space list once allocated. Once a file is deleted, its space is added to the free-space list.  

### Bit Vector

Also called a bitmap, a freespace list can be implemented using a bit vector / bitmap, where each block is represented by a bit. The block is free if the bit is 0, and allocated if its a 0.

As an example, if a disk has blocks, 2,3,4,6,8,9 free, and the rest allocated, the freespace bitmap would look like:

`0011101011`

The biggest advantage of this is the simplicity and efficiency in determining if a block or `n` concecutive blocks are free. 

## Efficiency and Performance
- - -


## Recovery
- - -