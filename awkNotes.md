# General Awk construct

```awk
/pattern/ action
condition action
```

## Example conditions

```awk
value ~ regexp
```

hard-coded regex is inside a `/../`, while a regexp in a variable is simply: `value ~ variableHavingRegex`

## To use posix regular expression character classes like [[:digit:]]

awk --posix

# Functions

## To split a string into an array

* split(string,array,delim)
* s*trtonum

# Some quick awk scripts

## Collect output of a command in a vairable

```awk
cmd = "build your command"
cmd | getline var_name
close (cmd)
```

## Peek one line ahead

```awk
BEGIN {
  getline discard_first_line_as_this_is_never_peeked_by_any_line
}
getline peeked_next_line
this_line=$0
```

## Detect duplicate lines in 2 files.

* Note that the `==` ensures the dups are printed just once.
```awk
sort file1 file2 | awk ' seen[$0]++ == 1' > dups
```

## get extra lines in file2 that are not in file1

```awk
awk 'NR==FNR{a[$0];next}!($0 in a)' file1 file2 > diff.txt
```
* NR is record(i.e line) number being processed by awk as a whole
* FNR is like NR, but gets reset back to 1 for every file. So the cond NR==FNR is true for first file only.

## Get rid of 1st field

* The sub(FS,"") gets rid of the first field separator
* print is implicit

```awk
awk '{$1=""}sub(FS,"")'
```

## Strip leading/trailing white spaces

```awk
function stripw(var) { gsub(/^[ \t]+/,"",var); gsub(/[ \t]+$/,"",var); return var }
```

## Get uniq lines w/o spoiling order

```awk
cat whatever | awk '!x[$0]++'
```

## Get non-empty lines alone

```awk
cat whatever | awk 'NF'
```

# Not exactly awk, but text processing

## combile 2 or more files column wise

```
paste -d, file1 file2 file3
```
