# CPU Scheduling

### Dispatcher
* Module which gives control (dispatches) of the CPU to a processor 
* Involves the following:
    * Switch context from the running process to another
    * Swtitching to user mode
    * Jumping to the correct location in the process
* Needs to be very fast since it's called every context switch (dispatch latency) 

## Schedling Algorithms

### First-Come-First-Serve (FCFS)
* Implemented with a simple queue
    * The first process to be ready is the first process to be run
* Can cause issues for average wait time
    * If a long process is ready first, other processes need t owait a long time to run
* A non-preemptive algorithm
    * Once the CPU is allocated to a process, it doesn't give it up until it requests an I/O operation or termination
    * very long processes can be disasterous for this reason 

### Shortest Job First (SJF)
* The process with the shortest burst time is selected to rune next
    * If two processes have the same burst time, FIFO applies
* burst time is determined by calculating the expected next burst duration, using exponential averaging
    * τ_{n+1} = αt_{n}+(1-α)τ_{n}

### Round Robin (RR)
* Uses a **time quantum** or **time slice** to run processes
    * Ranges from 10 - 100ms
* If a process is still running by the time it reaches its time quantum, it's returned to the ready state
* Treats the ready queue as a circular queue
* Performance depends on the value of the time quantum
    * A large time quantum approaches FIFO performance
    * A small time quantum can result in a lot of context switches - wasting time

### Priority Scheduling
* A priority is assigned to each process
* Processes run in FIFO if no other processes are running, context switch occurs if a new, higher priority process is ready
    * Can cause **process starvation** - CPU time is always allocated to other processes, and never runs 
    * A solution to starvation is **aging** - gradually increasing a processes priority over time. If a process has waited long enough, it should eventually be run to avoid massive delays
    * A solution to process starvation - RR + priority. Processes with the same priority are processed round-robin style
* Can be *either* preemptive or non-preemptive
    * Preemptive - higher priority processes will be preempted onto the CPU and start running
    * Non-preemptive - higher priority process will be put at the front of the queue and run next

### Multi-Level Queue Scheduling
* Depending on queue implementation, an O(n) search may be needed
* Use different queues for different priorities / process types
    * Queue for foreground, background, systems, etc
* Some queues may have absolute priority over others
    * One queue doesn't feed into the CPU until the higher priority queue is empty
* Some implementations ratio the CPU time across the queues
    * For every 20ms the background queue gets, 80ms gets allotted to foreground processes

### Multi-Level Feedback Queue Scheduling
* In a standard MLQ scheulding, once a process is assigned to a queue, it stays there until it dies
* MLFQ allows processes to move between queue
    * used when separating processes based on the characteristics of the CPU burst
        * Too much CPU time for a burst = lower priority
        * I/O bound & interactive processes (short CPU bursts)
 = high priority
    * can prevent starvation - move a process up a queue after some time
## Evaluating Scheduling Algorithms