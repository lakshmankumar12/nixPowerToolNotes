# Sed's arguments

* `-n`
    * will suppress the default printing.
* `-i`
    * in place replacement (ensure to have backup!)
* `-r`
    * use extended regex in script.

* pattern space
    * Where all sed executation take place
    * automatically emptied at every line processing
* hold space
    * temporary space. doesn't get auto-deleted on every line

## Commands of sed

* `p` `P`
    * print current pattern space
    * P - print first line in multi-line pattern space
* `d` `D`
    * delete current pattern space
    * D - delete first line in multi-liine pattern space
* `s`
    * sub/replace - 's/match/replace/g'
    * flags:
        * g
* `n` `N`
    * delete current pattern space. Bring next line to pattern space
        * depending on `-n` arg, the pat space is printed before deleting.
    * append line to pattern space. (line count incrases, i.e = will now print the new line)
* `a` `i` `c`
    * append, insert, change resp.
* `l`
    * print pattern space with hidden chars
* `=`
    * print current line number
* `x`
    * exchange pattern & hold space
* `h` `H` `g` `G`
    * h-copy pattern into hold space
    * H-append
    * g/G , copy hold to pattern.
* 




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

Search: alternate, step, every

* tilda in sed gives the step value for a address range

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
* expressions (also referred as primary) can be many, and unless otherwise given, an implicit AND is assumed.
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
* do something with the file
    ```sh
    find . -name '*.c' -exec grep to_find_string '{}' \;
    ```
