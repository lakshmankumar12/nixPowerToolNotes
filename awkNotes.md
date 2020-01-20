# General Awk construct

```awk
/pattern/ {action}
condition {action}
```

* pattern and action together is called a rule
    * Either pattern or action can be ommited. Default pattern is to match
      all lines, and default action is to print $0
* Usually one line is one rule.
    * you can add more rules in a line with a `;`
    * you can extend a rule to more than a line with a backslash
        * or in gawk, any of `, { ? : || && do else` continue the
          rule in the next line
* Note: dont put assignments outside of blocks. Its treated as a
  condition that is always true, and the default action of printing $0
  happens

## Example conditions

* Check if a string matches a regexp
    ```awk
    your_big_string_to_search ~ /regexp/
    string !~ /regexp/
    ```
    * regex-literal is inside a `/../`,
    * A regexp in a variable is simply: `value ~ variableHavingRegex`
* check if a string is non-empty or existing
    ```awk
    length(string) != 0
    ```

## To use posix regular expression character classes like [[:digit:]]

awk --posix

# Special variables

* FILENAME
    * current file being read
* NR
    * current cumulative record number
* FNR
    * current file record number. reset to 0 when a new file is started
* RS
    * record separator
    * IN gawk, RS can be a regexp. Then RT has the actual text that matched regex
* NF
    * number of fields in the current record.
    * since 0 is the whole record and $1 is the first, thus $NF is always the last record
* FS
    * field separator
    * the unset FS or `FS=" "` is a special case where its one or more white-spaces and
      ignores leadig white spaces
    * is always a single char, when assigned to a single char
    * can be multi-field by using a regex like FS="[ \t\n]+"
        * however, leading field-seps make a empty field char
    * gawk extn: `FS=""` makes each char a field. Compatibility mode will make
      the whole line as 1 field
* OFS
    * output field separator.
    * This is used when you modify $0, even a "$2 = $2"


# Functions

## To split a string into an array

* split(string,array,delim)
* strtonum

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
function stripw(var) {
    gsub(/^[ \t]+/,"",var);
    gsub(/[ \t]+$/,"",var);
    return var
}
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
