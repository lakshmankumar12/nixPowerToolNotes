# Notes on gdb'ing

# General gdb notes

https://sourceware.org/gdb/onlinedocs/gdb/Continuing-and-Stepping.html

## picking shared library

```
set solib-absolute-prefix ${curdir}
set solib-search-path ${curdir}

#did it load rightly
info shared
```

## Remove server

### At machine where process runs

* Typically the test machine
    * Running task
      ```
      gdbserver --attach :port <pid>
      ```
    * Fresh task
      ```
      gdbserver tcp:6969 /path/to/you/bin arg1 arg2
      ```

### At machine where you have code-source and compiled binary

```
TERM=xterm gdb path/to/binary
(gdb) target remote <test-mc-ip:chosen-port>
```

## Convenience variables

```
#ensure to use a surrounding parenthesis w/o space so that
set $my_var=((Type*)0x12345678)
```

## Stl functions

### Orig scirpt

https://sourceware.org/ml/gdb/2008-02/msg00064/stl-views.gdb
* Remember to replace `+4` in the script with `+8` for the 64-bit environment.

### Sample for map

```
pmap <map-by-ptr> <left-type> <right-type>
```

## Proc mappings

```
info proc mappings
```

# Miscellaneous Stuff

## Prompt handling

```
set pagination off
set confirm off
```

## Print a full array

```
set print elements 0
```

* ptype (or) using a class-type will not work in a frame of a member function. Just come out

## disassemble with source

disassemble /m

## get a function at an address

```
info symbol <address>
```

## Ignore a signal

```
handle SIGPIPE nostop noprint pass
```

## thread

```
thread <n>
thread apply all bt
```

* $_thread is a gdb convenience variable for current thread.
  For eg: the following makes breakpoint 2 not stop for thread-57
  ```
  cond 2 $_thread != 57
  ```

### print __thread local variables


* Just go to the thread and print the variable
```
thread 5
p my_tls_variable
```

## Interpreting kernel log lines on seg-fault.

https://stackoverflow.com/questions/2549214/interpreting-segfault-messages/2549363
