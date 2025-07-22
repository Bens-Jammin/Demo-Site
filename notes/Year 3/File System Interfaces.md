# File System Interfaces
- - - 
## The File Concept

### File Attributes

File attributes vary from one OS to another, but they generally contain the following: 
* **Name**: a string of characters to differentiate one from another. The only human-readable information stored
* **Identifier**: a unique integer to identify one file from another 
* **Type**: the type of information stored in the file
* **Location**: A pointer to the device and the physical location in the device
* **Size**: The amount of data, and sometimes the max amount of data that can be stored in the file. Usually in bytes, words, or blocks
* **Protection**: Access-control information to determine who can read, write, execute, etc 
* **Timestamps / User ID**: Information about the creation of the file, last modify 

This information is kept in the directory structure, which is stored on the same device as the file itself. Directory structure entries usually contain the file name and its ID. The ID is used to locate the other attributes.

### File Operations

A file is an abstract datatype. To define a file, we need to define operations which can be performed on them. The OS can provide system calls to create, read, write, relocate, delete, and truncate files. 

#### Creating a File
Two steps are needed to create a file.:
1. Find enough space in the file system to store it
2. An entry for the new file must be made in the directory

#### Opening a File
Instead of having every file operation require the files name, which would need the OS to evaluate the name then check access permissions, all operations aside from `create` and `delete` require the file to be open first. If successful, the `open` call returns a *file handle* (a reference to the file) which is used as an argument in other file operations.

#### Writing to a File
To write to a file, a system call with both the open file handle and the information written to write is made. the System searches the directory to find the file's location. The system maintains a *write pointer* to the location in the file where the next write will take place (assuming the writes are sequential). The write pointer is updated whenever a write occurs

#### Reading a File
To read from a file, we can use a syscall with the file handle and where in main memory the next block of the file should be put. The directory is searched for the file entry, and the system keeps a *read pointer* to the location in the file where the next read will take place (assuming reads are sequential). The read pointer is updated after every read. Because a process is usually either reading or writing from a file, the current location can be kept as a per-process *current file position pointer*, which can be used for both reading and writing, saving space and reducing complexity.

#### Repositioning Within a File
Repositioning (aka 'seek') causes current file position pointer of the file to be repositioned to a new location. Since this doesn't return or modify the contents of the file, this doesn't need any I/O operations.

#### Deleting a File
To delete a file, we search the directory for the file. After finding the entry, all the file space is released, and mark the directory entry as free. Some systems use *hard links*, multiple entries for the same file. In this case, the contents of the file are not deleted until the last entry is deleted.

#### Truncating a File
A user may want to erase the contents of the file, but maintain its attributes. Instead of forcing them to delete the file then recreate it, this changes only the file length and releases the file space.

### File Structure
Some file types can be used to indicate the internal file structre. Source and object files have structures that match the expectations of the programs which read their contents. Some files must also conform to a structure that is understood by the OS (e.g. the OS requires that executables have a specific structure so that it can determine where in memeory to load the file, and what the location of the first instruction is).  

One of the big disadvantages of having an OS support multiple file types is that the OS becomes large and cumbersome. If the OS defines five different file structures, it must contain code to support each of those file structures.
- - - 
## Access Methods

Files store information. When used, this information must be accessed and read into memory. The information in this file can be accessed in multiple ways. Some systems provide only one access method, and some (such as mainframe OSes) can support multiple methods. Choosing the right one for the job can be a major design decision

### Sequential Access

The simplest access method is sequential access. Information in the file is processed in order: one record after the other. This mode of access is by far the most common, and is used in editors and compilers.

Reads and writes make up most operations on a file. A read operation `read_next()` reads a portion of the file and automatically advances the file pointer. Similarly, the write operation `write_next()` appends data to the end of the file, and advances to the new end of the file. On some systems, a program may be able to skip forward or backward `n` records, given some positive integer `n`. Sequential access is based on a tape model of a file, and works as well on sequential access machines as it does on random-access ones. 

![An image of a sequential access file model](./Images/SequentialFileAccess.png)

### Direct Access

Another method is direct or relative access. Here, a file is composed of fixed-length logical records which allows programs to read nadn write records quickily and in no particular order. The direct-access method is based on a disk model of a file, since disks allow random access to any block. The file is viewed as an ordered sequence of records. In this model, we may want to read record 14, then record 53, then write record 7.

Direct-access files are great for immediate access to a lot of information, such as databases. When retrieving data, we compute the block contains the result then read that block directly.

For example, on an airline reservation system, we may store all the information about a flight in the block identified by the lfight number. Therefore, the number of available seats for flight 713 is stored in block 713. To store larger sets of information (e.g. people), we may compute a hash on the set of people, or search a small index to determine the block to read.

For direct access, file operations need to be modified to include the block number as a parameter. Therefore, we would then have `read(n)` (where `n` is the block number) rather than `read_next()`, and `write(n, data)` rather than `write_next(data)`. 

Not all operating systems support both sequential and direct access for files. Some allow only sequential, and some supoprt only direct access. Some systems require that a file be defined as sequential or direct upon creation. These files can only be access in a way that is consistent with the access declaration. 

We can simulate sequential access on a direct-access file by keeping a variable `cp` that defines the current position. Simulating direct-access on a sequential-access is extremely inefficient and clumsy.

![A table containing the sequential access methods and a way to implement them on a direct access file model](./Images/SequentialFileAccess.png)

### Other Access Methods

Other access methods can be built on top of a direct access method. These methods usually involve an index on a file. The index contains pointers to the blocks. To find a record in the file, we search the index and then use the pointer to access the file directly.

With large files, the index itself may become too large to be kept in memory. One solution is to index the index for the file. The primary index contains pointers to secondary indexes, which point to the data in the file.

![An example of an indexed file access](./Images/IndexedFileAccess.png)

- - - 
## Directory Structure

The directory can be viewed as a symbol tabel which translates file names into the file control blocks. If we take this view, we can see the directory itself can be organized in multiple ways. The organization must allow us to insert and delete entries, search for named entries, and list all entries in the directory. 

When considering a particular structure, we need to keep in mind the following oeprations that must be able to be performed on a directory:
* **Search**: we need to be able to search a directory to find the entry for a particular file. Since files have symbolic names, and similar names can sometimes indicate some relationship, we may want to be able to find all files whose names match some pattern
* **Create**: New files must be able to be added to the directory
* **Delete**: When a file is no longer needed, we must be able to remove it from the directory. Note that when a file is deleted, it leaves a hole in the directory structure and the system may want to have a method to cover holes
* **List**: We need to be able to list all entries in the directory and the contents of each entry in the list
* **Rename**: Because the name of a file represents its contents to users, we must be able to rename the file when the contents or use changes.
* **Traversal**: We may want to access every directory and every file within a directory. For reliability, it's a good idea to save the contents and structure of the entire file system at regular intervals. This is often implemented by copying all files to a secondary non-volatile storage (sometimes a magnetic tape), across the network, or to the cloud. This provides a backup copy in case of system failure. In addition, if a file is no longer in use, the file can be copied to the backup and the disk space of that file is released or reused.

### Single-level directories

The simplest directory structure is the single-level directory. ALl files are contained in the same directory.

![An example of a single-level directory](./Images/SingleLevelDir.png)

Although simple, a single-level directory has significant limitations. When the number of files increases or the system has multiple users, for example. Since all files are in the same directory, they must have unique names. If two users call their data file `test.txt`, then the unique-name rule is violated.

Even for a single user it can become difficult to remember the names of all the files as the number offiles increases. It is not uncommon to have hundreds of files on one computer system per user. Keeping track of that many files can become very difficult.

### Two-level directory

Single-level directories can lead to confusion and becomes a hassle to maintain. The standard solution is to create a separate directory for each user.

In the two-level directory, each user has their own *user file directory* (UFD). The UFDs have similar structures, but each lists only the files of one user. When a job starts or a user logs in, the systems *main file directory* (MFD) is searched. The MFD is indexed on the username or account number, and each entry points to a UFD for the user. 

![An example of a two-level directory](./Images/TwoLevelDir.png)

When a user refers to a file, only their own UFD is searched. Thus, different users can have files with the same name, as long as each of a users files have unique names. To delete a file, the OS again only searches their UFD, thus it can't accidentally delete a different users file with the same name.

Although the two-level directory structure solves name-collision, it still has disadvantages. This structure only isolates one user from another. This isolation is an advantage when all users are completely independent, but is a disadvantage if users want to cooperate on some tasks and want to access each others files. 

In this case, if access is permitted, one user must be able to name a file in another user's directory. In a two-level directory, the we must give both the username and the files name. This specifies a path from the root (MFD) to a leaf (the file), and is thus called a path name. To name a unique file, a user must know the path of the file.

Extra syntax is needed to specify the volume of a file. For example, in Windows a volume is specified by a letter followed by a colon. A file specification may look like `C:\userA\test`.

### Tree-structured Directories

Once we have seen how to view a two-level directory as a two-level tree, the natural generalization is to extend the directory structure to a tree of arbitrary height. This generalization allows users to create their own subdirectories and to organize their files however they choose. A tree is the most common directory structure. The tree has a root directory, and every file in the system has a unique path.

![An example of an tree-structured directory](./Images/TreeDir.png)

A (sub)directory contains a set of files or subdirectories. In most implementations, a directory is simply another file, but treated in a different way. All directories ahve the same internal format. One bit in each directory entry defines the entry as either a file (0) or a subdirectory (1). Special system calls are used to create and delete directories. In this case, the OS implements another file format of a directory.

In normal use, each process has a current directory. The current directory should contain most of the files that are of interest to the process at the time. When a reference is made to a file, the current directory is searched. If a file is needed that is not in the current directory, then the user must either specify a path name of change the current directory to be the directory holding that file. To change the directory, a system call could be made that takes the directory name as a parameter and uses that to redefine the current directory. Some other systems leave it to the application (for example, a shell) to track and operate on the current directory, since multiple processes may have different current directories.

Allowing users to define their own subdirectories allows them to impose a structure of their choosing on their files.

An interesting policy decision in a tree-structured directory concerns how to handle the delection of a directory. If a directory is empty, then its entry in the parent directory can simply be deleted. However, suppose the directory contains files or subdirectories. One of two possible approaches can be made here: (1) directories can only be deleted if it is empty, or (2)recurisvely delete all items in the directory, then the directory itself. Requiring a user to delete all entries before deleting the directory can become very combersome. Recursive deletion is more convenient, but can be dangerous because the entire directory structure is removed with a single command. 

With a tree-structured directory, users are allowed to access not only their files, but also the files of other users. 

### Acyclic-Graph Directories

Consider two programmers working on a joint project. The files associated with that project can be storied in a subdirectory, separating them from the files of other projects. Since both programmers are equally responsible for the project, both want the subdirectory to be in their own directories. In this situation, the common subdirectory should be shared (both users have references to it in their user directories). 

A tree structure prohibits sharing files or directories, but an acyclic graph allows directories to share files and subdirectories. The same file or subdirectory may be accessed in two different directories.

![An example of an acyclic graph directory structure](./Images/GraphDir.png)

It's important to note that a shared file / directory is not the same as two copies of the file. In a copy, changes from one user don't reflect on the other's copy. With a shared file, there is only one version of the file, so any changes made by one are visible to the othe. 

When people are working as a team ,a ll files they want to share can be put into one directory. The home directory of each team member could contain this directory of shared files as a subdirectory.

Shared files and subdirectories can be implemented in multiple ways. A common method is to create a new directory entry called a *link*. A link is just a pointer to another file / subdirectory. For example, a link can be implemented as a relative or absolute path. When a reference to a file is made, we search the directory. If the directory entry is tagged as a link, then the name of the real file is included in the link information. We **resolved** by using the path name to locate the actual file. Links are easily identified by their format in the directory entry and are efffectively just indirect pointers.

Another common approach is to duplicate all information about them in both directories. In this case, both entries are identical and equal. Consider the difference between this and a link. The link is a different format from the original directory entry; therefore, the two are not equal. Duplicate entries make the original and the copy indistinguishable. A major issue with duplicates is maintaining consistency when a file is modified.

Acyclic graph directories are more flexible than tree directories, but are more complex. Several problems must be considered carefully;
* A file may now have multiple valid absolute paths
* Distinct file names may refer to the same file
* Directory traversal should not count the shared file / directory multiple times
* What should happen to the file / directory if one user wants to delete it
    * deletion may cause dangling pointers
    * simply deleting links could work, but how would you know when the last link was deleted?

- - - 
## Protection

When information is stored in computer systems, we want to keep it safe from both physical damage (reliability) and improper access (protection).

Reliability is generally provided by having duplicates of the files. Most computers have systems programs that automatically copy disk files to tape at regular intervals to maintain a copy should a file system be accidentally destroyed. Some file systems can be damaged by hardware issues (such as read / write errors), power surges or failes, head crashes, dirt, temperature extremes, and vandalism. Files may be accidentally deleted. Bugs in the file system software can cause the file contents to be lost.

Protection can be provided in many ways. For a laptop running on a modern OS, we may provide protection by requiring a username and password to authenticate access to the file, encrypting the secondary storage so even someone opening the laptop and removing the disk would have a hard time accessing the data. In multi-user systems, valid access of the system needs more advanced mechanisms to allow only valid data access.

### Types of Access

The need to protect files is a direct result of the ability to access the fiels. Systems that do not allow other users to access files of other users do not need protection; therefore, we could provide complete protection by prohibiting access. Alternatively, we can provide free access with no protection. Both approaches are too extreme for general use, so we need controlled access.

Protection mechanisms provide controlled access by limiting the types of file access that can be made. Access is either permitted or denied depending on several factors, one of which is tyhe type of access requested:
* **Read**: read from the file
* **Write**: write or rewrite into the file
* **Execute**: load the file into memory and execute its contents
* **Append**: Write new information at the end of the file
* **Delete**: Delete the file and free its space for reuse
* **List**: List the name and attributes of the file
* **Attribute change**: change an attribute of the file

Other operations (renaming, copying, editing, etc) on the file may also be controlled. For most systems, these high-level functions may be implemented by a system program that makes lower level calls. Protection is provided only at the lower level. For example, copying a file may be implemented by a sequence of read requests. In this case, a user with read access can also copy the file, printed, etc.

Many protection mechanisms have been proposed, each with advantages, disadvantages, and should be appropriate for the intended application. A small computer system that is used by only a few members of a research group may not need the same types of protections as a large corporate computer used for research, finance, and personnel operations, for example. 

### Access Control

The most common approach to the problem is to make access dependent on the identity of the user. Different users may need different types of access to a file or directory. The most general scheme to implement identity-based access is to associate each file and directory with an *access-control list* (ACL), specifying usernames and access types allowed for each user. When a user requests access to some file, the OS checks the access list of the file. If the user is listed for their requested access, then access is granted. Otherwise, a protection violation occurs and the user is denied access to the file. 

This approach has the advantage of enabling complex access methods. The main issue with access lists is their length. If we want to allow everyone to read a file, we must list all users with read access. This has two undesirable concequences:
* Constructing a list can be tedious, especially if we don't know in advnace the list of users in the system
* The directory entry, which was previously a fixed size, must now be variable in length, resuling in even more complex space management

These problems can be resuloved by a condensed version of the access list. To condense the list, many systems recognize three classifications of users for each file:
* **Owner**: the user who created the file
* **Group**: a set of users who are sharing the file and need similar access
* **Other**: all other users in the system

The most common recent approach is to combine access control lists with the more general owner, group, and universe access control scheme. For example, Solaris uses the three categories by default but allows access-control lists to be added to specific files and directories when more fine-grained control is needed.

As an example, consider a person (Sara) is writing a new book. She hired three grad students (Jim, Dawn, Jill) to help. The text of the book is kept in a file called `book.txt`. The protection with this file is as follows:
* Sara is granted all permissions
* Jim, Dawn, and Jill should only be able to read and write. They should not be able to delete the file
* All other users should be able to read, but not write

To achieve this protection, we must create a new group (called "text") with Jim, Dawn, and Jill as members. 

Now consider a visitor to whom Sara would like to grant temporary access to the introduction chapter. The visitor can't be added to the text group because that would give them access to all chapters. Because the file can only be in one group, Sara can't add another group to the chapter. With addition of the access-control list functionality, the visitor can be added to the access control list of the chapter. 

For this to work properly, permissions and access lists must be controlled tightly. This control can be acomplished in multiple ways. In the UNIX system, groups can be created and managed only by the manager of the facility. This, control is achieved through human interaction. 

With more limited protection classification, only three fields are needed to define protection. Each field is implemented as a collection of bits, which either allows or prevents the access associated to it. For example, the UNIX system defines three fields of three bits each: `rwx` where `r` controls read permissions, `w` controls write permissions, and `x` controls execution permissions. Separate fields are kept for the file owner, the files group, and all other users. In this scheme, nine bits per file are needed to maintain the protection information. In our example, the protection fields would be as follows: Sara has all permissions (`rwx`), the text group would have read and write permissions (`rw-`) and everyone else would have only read permissions (`r--`).

### Other Protection Approaches

Another approach to the protection system is to associate a password with each file. Just as access to a computer is controlled by a password, access to a file can be controlled in the same way. If passwords are chosen randomly and changed often, this can be effective in limiting access to a file. The use of passwords does have some disadvantages, however. The number of passwords a user may need to remember can become large, making this method impractical. Another issue is if only one password is used for all files, then if someone discovers the password to one file, they have access to all files. 

In a multilevel directory, we need to protect not only the files themselves but directories themselves. The directory operations that must be protected are different from file operations. We want to control:
* The creation / deletion of files in the directory
* Whether or not a user can see the directory / know of its existence
* Listing the contents of a directory (implied from the above point)

- - - 
## Memory-Mapped Files

There is one other method of accessing files which is very commonly used. Consider a sequential read of a file on disk using the system calls `open()`, `read()`, and `write()`. Each file access requires a system call and disk access. Alternatively, we can use virtual memory techniques to read file I/O as routine memory accesses. This approach - known as *memory mapping* - allows a part of the virtual address space to be logically associated with the file.

### Basic Mechanism

Memory mapping a file is accomplished by mapping a disk block to page(s) in memory. Initial access to the file goes through ordinary demand paging, resulting in a page fault. However, a page-sized portion of th efile is read from the file system into a physical page. Subsequent reads and writes tothe fiel are then handled as routing memory access. Manipulating files through memory rather than the overhead of using `read()` and `write()` system calls can simplify and speed up file access and usage. 

Note that writes to memory mapped files aren't reflected on disk immediately. In general, systems update the file based on the changes in memory when the file is closed. Under memory pressure, systems will have any intermediate changes to swap space to not lose them when freeing memory for other uses. When the file is closed, all the memory-mapped data is written back to the file on secondary storage and removed from the virtual memory. 

Some OSes provide memory mapping only through a specific system call and use the standard system calls to perform all other file I/O. Other systems choose to memory-map a file regardless of whether the file was specified to be memory mapped.

Multiple processes may be allowed to map the same file concurrently to allow the sharing of data. Writes by any of the processes modify data in virtual memory and can be seen by all others that map the same section of the file. The memory-mapping system calls can also support copy-on-write functionality. This allows processes to share a file in read-only mode but to have their own copy of any data they modified. Sometimes mutexes are used in order to ensure coordination of access to shared data.

![An example of a memory mapped file system](./Images/MemoryMappedFiles.png)

Shared memory is often implemented by memory mapping files. In this scenario, processes can communicate using shared memory by having the communicating processes memory-map the same file into their virtual address spaces. The memory mapped file serves as the region of shared memory between the communicating processes.

![An example of how two processes can use a memory-mapped file to communicate between each other](./Images/FSI_SharedProcessMem.png)
