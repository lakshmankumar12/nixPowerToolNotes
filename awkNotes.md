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

## Using fields by content

* Instead of specifying field-separator, from awk 4.0 we can specify the field.
    This is done using FPAT - allow for empty patterns if u want non patterns to separate empty columsn.
    Otherwise all non-patters wll be treated as one big separator

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
    * current filename being read
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
mached_result = match(big_string_var, regex_or_literal, result_arr)
result_str = result_arr[0]

#  plain awk - sets RSTART and RLENGTH
mached_result = match(big_string_var, regex_or_literal)
result_str = substr(big_string_var, RSTART, RLENGTH)
```

## find and replace

```awk
gsub(what_to_find,what_to_replace,inline_replaced_var);

```

### replace a block in file

```sh
to_add_block=$(mktemp /tmp/gxc_bash_hist_fixup-XXXXXX)
cat <<'EOF' > $to_add_block
#GXC_BASH_HIST START
export PROMPT_COMMAND='RETRN_VAL=$?;logger -p local6.debug "$(whoami) [$$]: $(history 1 | sed "s/^[ ]*[0-9]\+[ ]*//" ) [$RETRN_VAL]"'
#GXC_BASH_HIST END
EOF
## see if the block is already there
existing_block=$(sed -n -e '/#GXC_BASH_HIST START/,/#GXC_BASH_HIST END/p' $GLOBAL_BASHRC_FILE)
if [ -n "$existing_block" -a "$existing_block" = "$(cat $to_add_block)" ] ; then
    #already good
    rm $to_add_block
    return 0
fi
if [ -z "$existing_block" ] ; then
    #adding for first time
    echo "Adding PROMPT_COMMAND to bashrc for first time"
    cat $to_add_block >> $GLOBAL_BASHRC_FILE
else
    echo "Updating PROMPT_COMMAND in bashrc"
    temp_file=$(mktemp /tmp/gxc_bash_hist_fixup-XXXXXX)
    awk -v f=$to_add_block '/#GXC_BASH_HIST START/,/#GXC_BASH_HIST END/{if (!a) {system("cat " f)};a=1;next}1' $GLOBAL_BASHRC_FILE > $temp_file
    mv $temp_file $GLOBAL_BASHRC_FILE
fi
rm $to_add_block


```


## sprintf

```awk

variable = sprintf("%d %c %s",intvar,charvar,stringvar);

```

# Array stuff

* awk natively supports one-dimensional hash-tables which it calls array
* You just index with key
```awk
array["mykey"]="my value"
for (key in array) { printf "key:%s value:%s\n",key,array[key] }
```
* You can delete one key or entire array
```awk
delete array[key]
delete array
```
* traditional awks dont support multi-dimenstional array.  You can test if your awk supports it with this script in:
    https://stackoverflow.com/a/48025277
* You can fake multi-dimensional array by
```awk
array[a,b]="my value"
#At this point, awk will use the key a SUBSEP b.
#If all you want is print them having both a and b at hand,
#  then nothing much. Just do  array[a,b]
#However, if you want to iterate over all available stuff with array[a], then
#Build 2 arrays:
if (x in first_level_key_tracker_array) {
    first_level_key_tracker_array[x]=y
} else {
    first_level_key_tracker_array[x]=first_level_key_tracker_array[x] SUBSEP y
}
final_array[x,y]=value
#Now you can iterate like:
for (x in first_level_keys) {
    delete available_keys
    available_keys=split(first_level_key_tracker_array[x],available_keys,SUBSEP)
    for (k in available_keys) {
        value=final_array[x,available_keys[k]];
    }
}
```

# Functions

## To split a string into an array

* split(string,array,delim)
    * Note that you get a array, whose key is 1,2,3..N and split-values
      against these keys
* strtonum   # search: atoi , hex to dec

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
# search : shell

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

http://awk.freeshell.org/AllAboutGetline

```
Variant                | Variables Set
---------------------------------------
getline                | $0, ${1...NF}, NF, FNR, NR, FILENAME
getline var            | var, FNR, NR, FILENAME
getline < file         | $0, ${1...NF}, NF
getline var < file     | var
command | getline      | $0, ${1...NF}, NF
command | getline var  | var
command |& getline     | $0, ${1...NF}, NF
command |& getline var | var
```

### Form-2

* getline consumes the next-line. Next iteration wont see this.
* NR,FNR,RT and ofcourse the var is set, B-U-T, $0 (and all of $1,$2...) and NF are still that of orig-line taken in this iteration

```awk
{
    currentline=$0
    getline nextlineconsumed
    stillmaincurrentline=$0
}

```

### Form-4

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

Search: merge join

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

## tablular output

search: col column table tabularize

```sh
# separator as -s
cat output | column -t -s "|"

```




## Strip leading/trailing white spaces

Search: trim strip

```awk
function stripw(var) {
    gsub(/^[ \t]+/,"",var);
    gsub(/[ \t]+$/,"",var);
    return var
}

#oneliner
function stripw(var){gsub(/^[ \t]+/,"",var);gsub(/[ \t]+$/,"",var);return var}

```

## preserve white-space if editing line

```awk
echo "a  2   4  6" | gawk ' {
 n=split($0,a," ",b)   # the 4th arg to split save the separators
 a[3]=7                # edit field(s) of choice
 line=b[0]             # build the line back
 for (i=1;i<=n; i++)
     line=(line a[i] b[i])
 print line
}'
```

* print from nth column till last column -- say skip 2
```sh
... | gawk ' { n=split($0,a," ",b); for (i=3;i<=NF; i++) { line=(line a[i] b[i]) } ; print line }'

```


## Get non-empty lines alone

```awk
cat whatever | awk 'NF'
```

## cams consolidated summary extracter

Search: mutual fund

```awk
#Bring everything | seperated
awk -F\| 'function stripw(var){gsub(/^[ \t]+/,"",var);gsub(/[ \t]+$/,"",var);return var} function printline() { printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n",folio,fund,units,date,nav,value,registrar } NF > 2 { if (NR>2) { printline() } folio=stripw($1) ; fund=stripw($2) ; units=stripw($3) ; date=stripw($4) ; nav=stripw($5) ; value =stripw($6) ; registrar=stripw($7) } NF == 2 { fund = fund " " stripw($2) } END { printline()  }' statement.txt > statement.csv
```

## convert a enum-string to number

Here we convert the Month string to number
The enum strings SHOULD be of same size
```
index("JanFebMarAprMayJunJulAugSepOctNovDec",$2)+2)/3
```


* same above in neat syntax

```awk
function stripw(var){
    gsub(/^[ \t]+/,"",var);
    gsub(/[ \t]+$/,"",var);
    return var
}
function printline() {
    printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\n",folio,fund,units,data,nav,value,registrar
}
NF > 2 {
    if (NR>2) {
        printline()
    }
    folio=stripw($1);
    fund=stripw($2);
    units=stripw($3);
    data=stripw($4);
    nav=stripw($5);
    value =stripw($6);
    registrar=stripw($7)
}
NF == 2 {
    fund = fund " " stripw($2)
}
END {
    printline()
}
```
* to run
```sh
awk -F\| -f instructions.awk pipe_separted_file.txt > copy.txt
```





# Not exactly awk, but text processing

## combile 2 or more files column wise

```
paste -d, file1 file2 file3
```

# print the ip-tcp list

```
cat /proc/net/tcp | awk '
function getip(inhex) {
    match(inhex,"([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2}):([0-9A-F]{4})",res);
    for(i in res){
        res1[i]=strtonum("0x" res[i])
    };
    s=sprintf("%s.%s.%s.%s:%s",res1[4],res1[3],res1[2],res1[1],res1[5])
    return s
}
1 {ip1=getip($2);ip2=getip($3);printf "%4s %20s %20s %s\n",$1,ip1,ip2,substr($0,35,length($0))}'
```
