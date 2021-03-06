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
* Ranged patterns
    * ranged patterns are activated when begin matches. All further records match till end.
    * records that match begin/end are both passed into action.
    ```awk
    /begin/,/end/ { action }
    ```

## To use posix regular expression character classes like [[:digit:]]

awk --posix

## Input Field Separator

* The darn thing can be a regex!

    ```awk
    awk -F '<(/?)some_xml_ish_tag>' '{ ..  }' infile
    ```
## for loops

```awk

awk 'for ( ; ; ) {  }'

#quickly study fields
 head -n 1 | awk -F'\\.|:|_|[[:space:]]+' '{for (i=1; i<=NF ; i++) {printf "%d : %s\n",i,$i}}'

#for over an array
for (key in array) { print array[key] }
```

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
* ORS
    * output record separator

# string stuff

## substr


```awk
# idx is 1-based.
small_str = substr(big_string_var, begin_idx, length)

# trim the last n(eg:5) chars
small_str = substr(big_string_var, 1, length(big_string_var)-5)
```

## match

```awk
# gawk version - gets the result in 3rd arg
#  plain awk - sets RSTART and RLENGTH
mached_result = match(big_string_var, regex_or_literal, result_arr)
```

## sprintf

```awk

variable = sprintf("%d %c %s",intvar,charvar,stringvar);

```


# Functions

## To split a string into an array

* split(string,array,delim)
* strtonum

## run shell commands

```awk
system("your command with args")

#see getline below to capture output
```

# Some quick awk scripts

## Collect output of a command in a vairable

* awk has this quirky way of spawing other programs.
* When a variable containing a command(with args) is used in a pipe-construct,
  awk seems to exec that command the first time. Further uses continue to
  use the same invoked program, until its closed. The same variable represents
  the file-handle to close that program.

```awk
cmd = "build your command"
cmd | getline var_name
close (cmd)
```

## Run a command on a block

* everytime block begins we close the previous cmd
* and then we pipe-in the current line to the curreng invocation of cmd
```awk
awk -v cmd='whatever your command is' '
    /blockbegin/ { close(cmd); }
    { print | cmd }' infile
```

## getline

### Form-1

* getline consumes the next-line. Next iteration wont see this.
* NR,FNR,RT and ofcourse the var is set, B-U-T, $0 (and all of $1,$2...) and NF are still that of orig-line taken in this iteration

```awk
{
    currentline=$0
    getline nextlineconsumed
    stillmaincurrentline=$0
}

```

### Form-2

* this is getline with a redirection. This getline is a parallel read of any file. using FILENAME variable, u can read the current file too.

Search : Process one line with next line

* The trick is to read the file parallely 2 times.
    * Awk's main processing goes on normally
    * An extra processing is done by an extra getline
* note that FILENAME is a awk variable for current file under process

```awk
BEGIN {
    getline discard_first_line < FILENAME
}
{
    getline next_line < FILENAME
    current_line=$0
}
```

## Detect duplicate lines in 2 files.

* Note that the `== 1` ensures the dups are printed just once (the second occurence is printed).
```awk
sort file1 file2 | awk ' seen[$0]++ == 1' > dups
```

## uniq without sorting

```awk
cat whatever | awk ' seen[$0]++ == 0' > uniq_lines
#same .. more crisp
cat whatever | awk '!x[$0]++'
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

## Club N lines together

Search: merge

```
awk '{ORS=NR%10?"\t":"\n";print}' in_file
```

note: sed-way
You have to n-1 `N`s to merge n lines.
```
sed 'N;N;N; s/\n/\t/g;' in_file
```

note: paste
```
paste -d'\t' - - - - < in_file
```



## Strip leading/trailing white spaces

Search: trim strip

```awk
function stripw(var) {
    gsub(/^[ \t]+/,"",var);
    gsub(/[ \t]+$/,"",var);
    return var
}
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
