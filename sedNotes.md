# Sed's arguments

* `-n` 
    * will suppress the default printing.
* `-i` 
    * in place replacement (ensure to have backup!)

Basic syntax

's/match/replace/g'

# Some quick sed scripts

## Print only the matching back-reference part

```sh
sed -n 's/^\s*discard\(want\)discar.*$/\1/p'
```

## print from one patter to another

```sh
sed -n '/pat1/,/pat2/p'
sed -n '1,/pat/p'    # print from beg-of-file to pat
sed -n '/pat/,$p'    # print from pat to end-of-file
```

## prints from 2nd line, every 3rd line.

```sh
sed -n '2~3p' <>
```

## Remote color-codes form screen/tmux capture

```sh
sed -r 's:\x1B\[[0-9;]*[mK]::g'
```

## Remove the unix'ish ctrl-m ^m

```sh
sed -r 's:\x10::g'
```

## Delete empty lines

```sh
sed '/^$/d' myFile > tt

sed '/^[[:space:]]*$/d' myFile > tt
```

### delete trailing white spaces

```sh
sed -i 's/[[:space:]]\+$//' myfile
```

## Delete nth line

sed -e '5d'

## Add at nth line

* You should use n-1 in script.

```sh
sed -n '3a' "you line content"
```

* Or add before

```sh
sed -n '3i' "you line content"
```

# Not really SED but text stuff with other tools

## Use perl when sed doesn't cut it

esp - greedy regex .*?

```sh
.. | perl -ne 's/regex/replace/' | ..
perl -ne -i 's/regex/replace/' file_to_work_inline
```

## Find all non-ascii characters in a file

```sh
\grep --color=auto -n -P '[^\x00-\x7F]+' <file>
```

## Grep source-files for cscope for a file-list

```sh
egrep -i '\.([chlys](xx|pp)*|cc|hh|tcl|inc)$'
```

## Delete all non-printing chars (but retain lines)

```sh
cat file |   tr -dc '[\011\012\015\040-\176]' > result

#\015 is ^M ctrl-m

cat file |   tr -dc '[\011\012\040-\176]' > result
```

## Print from nth line to end of file

```sh
tail -n +2 <file>
```

## Print till the nth line of file

```sh
head -n -3 <file>
```

## List a file wiht both hex and ascii

```sh
hexdump -C <file> | less
```

# Using find

```sh
find <global-options> <path-one-or-more> <expressions>
```

* At its core find prints every file in the given path, provided the expression returns True for that file.
* expressions (also referred as primary) can be many, and unless otherwise given an implicit AND is assume.
* -print is assumed to be given unless other stuff like -print0 , -ls, -exec, -execdir is given.

* List upto a certain depth
    ```sh
    find . -maxdepth 2
    ```
* ls just dirs
    ```sh
    find . -maxdepth 1 ! -path . -type d
    ```
* prune a few dirs from search
    ```sh
    find . -type f \( -path dir1 -o -path dir2 -o -path -dir3 \) -prune -o -print
    ```
