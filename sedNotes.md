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
    * for s command, you can use any of `b/,#,:`
    * flags:
        * g
* `n` `N`
    * delete current pattern space. Bring next line to pattern space
        * depending on `-n` arg, the pat space is printed before deleting.
    * append line to pattern space. (line count incrases, i.e = will now print the new line)
    * the line count increases effect is pronounced, when you have a `b<label>` down the
      rule somewhere where you are looping and want to act on line-numbers in the loop.
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
* `b`
    * branch to label, given by `: label-name`
    * without a name goes to end - as in stops this line, and goes to
      next line processing (like next in awk)
* `t`
    * branch to label, if previous substitution(could have been in a previous command) is successful.
* `e`
    * Not be confused with `-e` arg. This is a exec-command, which is a gnu-sed extension.
    * 2 flavors. Typically part of s command's option.
        * `s/abc/tr 'a' 'A'/ep` - executes the pattern space as a command and substitues it with the stdout of the program.
        * e followed by p, will do the above trick and then print the pattern space.
    * just execute what follows. Mostly a hack way to have sed execute something.
        * `sed '1e /bin/bash'`

## Different delimiter

* Other commands. Use backslash before delimiter
    ```
    sed '\,some/path,d'
    ```
* `s` command is special. It doesnt need the backslash
    ```
    sed 's,some/path,other/path,'
    ```

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

#sed remove screen-captured chars
sed -r 's:\\033\[[0-9;]*[mK]::g'

#vim.. remove
%s/\\033.\{-}m//g
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

note: awk'y way, much easier:
```sh
awk 'NF' myFile >> t
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

## stop sed after a pattern

* The whole block is executed on beg_pattern
* In the block, we keep getting next line and printing until its end_pattern, where we quit.
* the :loop is a label, to which we branch (and return that is) if its not end.
```sh
sed -n -e "/beg_pattern/{p; :loop  n; p; /end_pattern/ q; b loop}" in_file
```

## Print both first 10 and last 10 with a separator in between

```sh
gsed -ne'1,9{p;b};10{x;s/$/--/;x;G;p;b};:a;$p;N;21,$D;ba'
```
Explnation
* `1,9{p;b}` - first 9 lines are printed without any further processing
* `10{x;s/../;x;G;p;b}`
    * 10th line is special. Goal is to add a -- and print.
    * x - first put the line in hold-space (which is empty now)
    * s/../ - replace nothing (in pattern space) with --
    * x - swap patt/hold. orig-lines come to patter, -- goes to hold.
    * G - append hold to pattern. so -- comes after the 10th line.
    * p - print both.
    * b - next line.
* `:a` - set a label here.
* `$p` - if you are end, print whatever is the pattern space
    * our goal is to have the patter space, have the last 10 lines at this point.
* `N` - slurp the next line
* `21,$` - starting from 21st line, start delete the oldest line.
    * Note that this rule itself will be working only after 10 lines. Until
      then we have been doing b.
    * net-net that means, 11th line will be deleted when 21st line is processed
      and so on.
    * thus pattern space holds the last N lines.
* `ba`
    * loop back to label a.
    * Note that `N` also incrases line-numbers so that `$p` will eventually match
      on end of file and `N` will also exit the loop at EOF.

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
