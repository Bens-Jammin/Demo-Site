# Processes

## Process States
* a set of descriptors for the activity of a process

### States
* New -- the process is being created
* Ready -- waiting to be run
* Running -- running instructions on the CPU
* Waiting -- waiting for an event to complete or occur
    * Signal reception
    * I/O operation
* Terminated -- The process has completed all instructions

### State Switching
The following events can cause the state to switch:
* Process completed initialization (new → ready)
* Process dispatched onto a core (ready → running)
* I/O event or non-busy wait occurs (running → waiting)
* I/O event completes (waiting → ready)
* Time out, interrupt, etc occurs (running → ready)
* Process finishes execution (running → terminated )

![](/Images/ProcessStates.png)

## Process Control Block (PCB)
* represents processes in the os
* used for context switching
* contains the following information:
    * process state -- what was the process doing before it switched out
    * process id -- unique identifier
    * program counter -- pointer to the next instruction to run
        * "bookmark" of where the process was
    * registers -- registers that the process is using
    * memory info -- which partitions of memory are in use
    * ...
