# Notes on gdb'ing

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

```
pmap <map-by-ptr> <left-type> <right-type>
```


# Miscellaneous Stuff

* ptype (or) using a class-type will not work in a frame of a member function. Just come out

