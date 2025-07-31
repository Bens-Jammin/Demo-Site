# The Task Synchronization Problem

The problem of synchronizing multiple threads which access shared data together

## Lock - Test and Set
* A hardware solution to the synchronization problem
* A simple variable which can either be set to the values 0 or 1
    * 0 = unlocked
    * 1 = locked
* Before entering a critical section, a process checks the state of the lock (test part)
    * If the lock is locked (val = 1), it waits until it is free
    * If the lock is unlocked (val = 0), it instantly locks it and continues, allowing the process to run in the critical section

### Implementation  
```c
bool test_and_set(bool *lock) {
    // --- begin atomic segment ---

    // if the initial value of the lock is true (locked), 
    // then return `true` to signal the lock is being used. 
    // Setting the value of lock to true will do nothing.
    // 
    // If the initial value of the lock is false (unlocked), then 
    // the return value will signal the lock is free to be used. 
    // Setting the value of the lock to `true` will then lock it 
    // to signal to all other threads that the lock is 
    // unavailable (because of you)
    bool initial_lock_state = lock;
    lock = true;
    // --- end atomic segment ---

    return initial_lock_state;
}
```

### Use in a Spinlock
``` c
bool lock = false;
void attempt_unlock() {
    // if the initial state of the lock is locked, then wait until it's not
    while ( test_and_set(&lock) == true ) { ; }
    // shared values are now locked, you are free to do critical actions
    perform_critical_actions();

    lock = false; // unlock once out of critical section
}
```

## Lock - Compare and Swap

### Implementation
```c 
bool compare_and_swap(bool *lock, bool expected_value, bool new_value) {
    int initial_lock_state = *lock;
    if (lock == expected_value) {
        lock = new_value;
    }

    return initial_lock_state;
} 
```


### Usage
```c 
lock = 0;

void attempt_unlock() {
    
    // extra code ...

    // if the lock was initially locked, wait until it frees 
    while (compare_and_swap(&lock, false, true) == true) { ; } // do nothing

    perform_critical_actions();


    // unlock once you're done with critical actions
    lock = false;
}


```

## Mutex
* enables **mut**ual **ex**clusion for shared data
* mutexes lock a value
    * Only one thread can access shared resource at a time
    * thread tries to "open" value - waits if it can't
    * locks itself in once available
    * unlocks and leave when critical section is complete
* performs a *system wide* lock
* the thread that locks the mutex must also be the one to unlock it

### Usage
* Intended to be taken and released in that order
* Used mostly for resource sharing

### Example
A shop has one bathroom, there is only one key needed to access the bathroom. Customers can access the bathroom if it's not in use, lock the door behind them, and unlock it once they're done

## Semaphore
* similar to a mutex, but allows for >1 thread to have access at a time
* used to limit the number of cpu, I/O intense tasks running at the same time
* aquired by one thread and released by another

### Usage
* used mostly for signalling


### Example
A bouncer controls access to a bar. If there are too many people in the bar, the bouncer doesn't allow customers in. Once space frees up, more customers are allowed to get access to the shared resources (bartenders)

### Example of Difference From Mutex
A shop has multiple bathrooms, each with a key. Once you get access to a key, you don't know which bathroom is available

## Spinlock
* A lock which, if failed to acquire, continues to try until it gets access
* Never goes into the waiting state
* assumes that **locks are only used for a short period of time**

## Usage
Suppose two threads try to perform some operation on shared resource. If the operations are quick, it is often better for the threads to maintain access to the CPU, rather than giving up access to another thread. In this case, the thread which fails to gain access to the lock keeps trying, until the lock is freed up

![](/Images/SpinLockExample.png)


## Priority Inversion
* A rare edge case where a process is running even though a higher priority process is waiting to run, because there is a low priority process which holds a lock that the high priority process needs.

### Scenario - Bounded Priority Inversion
1. A low priority task (Task L) is running and acquires a lock
2. A high priority task (Task H) comes in and tries to acquire the same lock
3. Task L begins to run again in its critical section to free up the lock
4. Task L releases the lock
5. Task H begins to run again, acquires the lock, and runs until termination
6. Task L comes back and runs to termination

![](/Images/BoundedPriorityInversion.png)

This is a **bounded** priority inversion, because wait time of task H is bounded by the time that task L is inside the critical section.
The only way to prevent such an issue is to not use critical sections or mutexes, or use a multicore processor.

### Scenario - Unbounded Priority Inversion
1. A low priority task (Task L) is running and acquires a lock
2. A high priority task (Task H) comes in and tries to acquire the same lock
3. Task L begins to run again in its critical section to free up the lock
4. A task with a higher priority than task L but lower priority than task H is created. Since it is a higher priority than task L, it runs - even though there's a higher priority task that should be running instead.
5. Task M finishes, and task L begins again
6. Task L finishes it's critical section, releasing the lock
7. Task H begins again, finishes it critical section, and runs to terminatin
8. Task L begins again and runs to termination

![](/Images/UnboundedPriorityInversion.png)

This is an **unbounded** priority inversion, because task M could theoretically run forever, starving task H