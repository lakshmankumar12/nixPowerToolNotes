# constructs

```sh
if [[ condition  ]] ; then
  statement
elif [[ condition ]] ; then            # else if
  statement
else
  statement
fi
```

```sh
Use [[ condition ]] instead of [ ... ]
[[ $supports_unadorned ]] vs
[ "$better_quote_me" ]
```

## double parenthesis

```
(( 1 + 1 ))
```
* If used without any assignment or other expr, just does arithmetic
    * This is useful when you want to assign values to variables inside that construct
    * `$` to variables inside seems optional. Not sure on this.
* If you want that statment to return its arithmetic result, put a `$(( .. ))`.
    * old bash is to do `$[ .. ]`. Use the newer one instead.
* If used in a if or while, the 0/non-0 value of the expr works normally

See https://stackoverflow.com/a/3427931

## Various dollar expresssion

* `${}` -  name inside expands that variable.
    * ${var:start_idx:length} -- start-idx is 0 based.
    * ${!var} - variable indrection. Expand to var, and then use that as a variable again.
* `$()` -  execute stuff inside like a command and replace with its output. Note that this can nest to any depth
* `$((  ))` - execute stuff inside like a arithmentic expression and replace with its result
* `$[ ]` - Deprecated. Use `$((  ))`
* `$' '` - The word expands to a string, with backslash-escaped characters replaced as specified by the ANSI-C standard.
           Used in some siutaiton like IFS=$' ' assignments. To read.

### special variables

```sh
$?  -- last command exit status
$$  -- invoker's pid
$!  -- last command pid
$#  -- number of arguments.

```


# Operators

http://tldp.org/HOWTO/Bash-Prog-Intro-HOWTO-11.html

## Comparision for string

```sh
#note - only one equal sign
[[ $s1 = $s2 ]]
[[ $s1 != $s2 ]]
[[ -n $s1 ]]
[[ -z $s1 ]]
```

## arithmetic

```sh
[[ $n1 -eq $n2 ]]
-lt (<)
-gt (>)
-le (<=)
-ge (>=)
-eq (==)
-ne (!=)
```

## logical

```sh
# 3 options!
# use -o for ||
[ $condition1 -a $condition2 ]
[ $condition1 ] && [ $condition2 ]
[[ $condition1 && $condition2 ]]

[ ! $condition ]
```

## Doing a integer based arithmetic expression

```sh
$(($var1 * $var2))
#even associating with paranthesis works
$(( ($var1 + $var2) * $var3 ))
```


# substring

```sh
${i:index}     .. substring of i starting at index(0-based)
${i:index:len} .. substring of i starting at index(0-based) for length len
${i::-len}     .. substring of i starting at index(0-based) until last len
```

Note: `${i:-val}` .. will give i or val if is unset

## is substring in string

```sh
if [[ $haystack == *"$needle"* ]]
then
  echo "It's there!";
fi

## starts with a prefix
if [[ "$bigstring" == "$prefix"* ]] ; then
    echo "var bigstring: $bigstring startswith prefix: $prefix"
fi
```

## other string manipulations

http://tldp.org/LDP/abs/html/string-manipulation.html

* mnemonic #-knocks-of-prefix (remember vi-back)


* Deletes shortest match of $substring from front of $string.
```sh
${string#substring}
```

* Deletes longest match of $substring from front of $string.
```sh
${string##substring}
```

* Deletes shortest match of $substring from end of $string.
```sh
${string%substring}
```

* Deletes longest match of $substring from end of $string.
```sh
${string%%substring}
```

* Replace first match of $substring with $replacement
```sh
${string/substring/replacement}
```

* Replace all matches of $substring with $replacement.
```sh
${string//substring/replacement}
```

* If $substring matches front end of $string, substitute $replacement for $substring.
```sh
${string/#substring/replacement}
```

* If $substring matches back end of $string, substitute $replacement for $substring.
```sh
${string/%substring/replacement}
```

## Changing cases for strings

```sh
#to lowercase
lower=${a,,}
#to uppercase
upper=${a^^}
```

## trim white space

search: strip

```sh
var="  one two three  "
trimmed_var=$(echo "$var" | xargs)
#trimmed_var="one two three"

# Rarely-appreciated property of xargs:  it can understand quotes.
# We use it to convert var="asdf" into var=asdf
echo 'var="value"' | xargs
# you will see : var=value
```

## regex matching

```sh
## ingeneral
if [[ "$haystack" =~ $needle ]] ; then
fi


  #   /dev/sda1 : start=        2048, size=     1048576, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=2FFCC127-F6CE-40F0-9932-D1DFD14E9462, name="EFI System Partition"
  #   /dev/sda1 : start=        2048, size=     1048576, type=C12A7328-F81F-11D2-BA4B-00A0C93EC93B, uuid=2FFCC127-F6CE-40F0-9932-D1DFD14E9462
  for partition_data_line in "${partition_data_array[@]}" ; do
    if [[ $partition_data_line =~ ^([^[:blank:]]+)[[:blank:]]:[[:blank:]].*[[:blank:]]uuid=([^,]+) ]] ; then
      device=${BASH_REMATCH[1]}
      uuid="${BASH_REMATCH[2]}"
    fi
  done

```



# Parameter expansion

```sh
#substitution
#  lonest pattern is substituted with string
#  pattern == # , matches start.
#  pattern == % , matches end.
${parameter/pattern/string}
```

## prefixing suffixing in array

```sh
prefix=192.168.122.
array=(14 15 16)

echo ${array[@]/#/${prefix}}  ## 192.168.122.14 ...and so on.
echo ${array[@]/%/${suffix}}

```


# Filenames and extractions

```sh
filename=$(basename "$fullpathfile")
dirname=$(dirname "$fullpathfile")
extension="${filename##*.}"
filename="${filename%.*}"
```

# Quoting

* Quoted items are concatenated with non-quoted or other quoted items.
  The shell turns everything into one argument.
* single quotes protect everything from opening to closing.
    * It is impossible to embed a single quote within a single quoted string
* double quotes protect most things.
    * Double qutoes does variable and command substitution
    * The following can be escaped in double quotes - `",\,$,`. Note that
      single quote isn't special inside double quotes
    * Also if you escape a character that isn't special, then the backslash
      is retained. This way, you dont have to escape-backslash twice.
      Eg, in below sed needs escaping `/`, but that escaped-backslash isn't
      eaten by double-quote expansion.
      ```sh
      sed -e "/${var_having_begin}/,/\/notice_no_need_for_extra_backslash/ p" whatever
      ```


# Expansions

```sh
#Note the absence of dollar sign .. just plain curly brace!
{a,b}          -> expands to a b
{a,b}{c,d}     -> expands to ac ad bc bd
{1..100}       -> expands to 1 2 ... 100
{a,b}{1..5}    -> expands to a1 a2 a3 a4 a5 b1 b2 b3 b4 b5
```


# Passing Arguments

Read: https://unix.stackexchange.com/a/41595

```sh
#note without quotes, $* and $@ are same. Dont every use it this way.
$* - join all args as one with first char of IFS(usually space)
$@ - each arg is a separate word , "$1" "$2"
```

Inside a function, to another function

$*    -- all args as a single word
$@    -- all args are intact, as invidivual quoted strings

## pass arg as reference / pass a name to which value is to be assigned

Search: pass by reference dereference

```sh
function implementor()
{
  var_name_passed=$1
  ...
  #note the eval. Missing it wont work
  eval ${var_name_passed}="Value from here"
}

implementor var_name
echo "got var_name set to $var_name"
```

## Appending to argument for a command

```sh
# flush $@
set --
# add to $@
set -- $@ new_arg_in_end more_args
# add to beginning of $@
set -- this_wil_now_be_1 $@

# keep adding more to args from a file,say
while read LINE
do
        set -- "$@" -v "$LINE"
done < /some/input/file

```


# array

Read on array: http://stackoverflow.com/a/18136920/2587153

Initialize an array literal using paranthsesis
```sh
array=(one two three)
```

* index is a number. Gaps are okay when initializing. those members dont exist
* remember the flow-brace after dollar and before arr-name.

```sh
${Array[index]}

eg:
a=("hello" "world")
echo ${a[0]}   # prints hello
echo ${#a[@]}  # length of array. Note where # appears
echo ${a[*]}   # To confirm: space separated single string of entire array
for i in ${a[@]} ; do echo happy $i ; done #  iterates.

a=()
a+=("hola")   #append to a array
a+=("wold")   #append to a array
a=("$a[@]" "$b[@]") #append another array to one array.
```

* Iterate over an array
```sh
for i in ${array_var[@]} ; do
    do_what_you_want $i
done
```
* Iterate over an array literal
```sh
for i in over these individual words ; do
    do_what_you_want $i
done
```

* does array contain a value
search: presence in array
```sh
printf '%s\0' "${myarray[@]}" | grep -F -x -z -- 'myvalue'

## printf -- null-separates and prints the elements
## grep
##  -F -- fixed strings.. dont interprety any patterns
##  -z -- null spearated (and not \n separated) input
##  -x -- only match whole lines

```



reference: http://www.tldp.org/LDP/abs/html/arrays.html#ARRAYSTROPS

```sh
${a[@]/#/XY}  #adds a XY to the beginning of all members
${a[@]/%/XY}  #adds a XY to the end of all members
```

* gobble a file or command's line into a array:

```sh
IFS=$'\r\n' GLOBIGNORE='*' XYZ=($(command))
```

* pass array by reference

https://stackoverflow.com/a/16461878/2587153
```sh
function array_print() {
arrayname=$1[@] ;
array=(${!arrayname}) ;
printf "elem: %s\n" "${array[@]}" ;
}
my_array=(10 20 30)
array_print my_array
```
* Note that arrayname above is just the string `my_array[@]`. This leverages the `${!...}` in bash, which is indirection.

# Associative array / dict / hash

* Quoting keys should make no diff. But i find them not working in zsh.
* Even if you have spaces it is okay to not quote as the key is protectd by `[]`

```sh
declare -A aa
aa[key]="value"
echo ${aa[key]}
echo ${aa[$var_expanding_to_key]}

declare -A bb_from_list
bb_from_list=([key1]="value1" [key2]="value2")

#Mind the exclamantion! W/o it it gives values
#Mind the Quotes - otherwise, if your key is "key with space", for will loop each word!
for key in "${!aa[@]}" ; do
  echo "value at $key is ${aa[$key]}"
done
# in zsh you do:
for key in "${(@k)aa}" ; do
  echo "value at $key is ${aa[$key]}"
done

if [ ${aa[key]+_} ] ; then
    echo "key found"
else
    echo "key not found"
fi
```


## In zsh

```sh
sentence="Space separated collection of words"
eval "arrayOfWords=($sentence)"
for i in $arrayOfWords ; do echo "word in this iteration is $i"; done

for i (word1 word2) { cmd1 $i ; cmd2 $i }
for i (word1 word2) only_cmd $i
```

# bash completion

* Existing builtin completions for `complete`
    * https://www.gnu.org/software/bash/manual/html_node/Programmable-Completion-Builtins.html#Programmable-Completion-Builtins
    * List:
        ```sh
        # complete with dirs
        complete -A directory my_command_that_wants_directories_as_arg

        # complete with this funciton
        complete -F _do_complete_for_my_func  my_func
        ```

* completion command expectation
    * Return the current list in `COMPREPLY` array
    * build that array using `compgen`
        * `compgen -W "array_of_all_words" -- "prefix"` will automatically filter out that `array_of_all_words` having only `prefix`
    * it gets a array var - `COMP_WORDS`, where
        * `COMP_CWORD` index of current word under cursoe

```

_docomplete_for_command() {
  ## this prevents auto-complete unless its exactly the second(0-basedindex) arg in that command
  if [ "${COMP_CWORD}" != "1" ]; then
    return
  fi

  ## arr is the array of the choices
  one_per_line="$(printf '%s\n' ${arr[@]})"
  COMPREPLY=($(compgen -W "$one_per_line" -- "${COMP_WORDS[COMP_CWORD]}"))
}

complete -F _docomplete_for_command my_command


```



# Iterating over each line of a  file

```sh
while read i ; do echo "one line: $i" ; done < file
```

## zsh way of getting lines of file into array

```
array_of_lines=("${(@f)$(my_command)}")
for i in ${array_of_lines[@]} ; do
    #do with i
    echo $i
done
```


Note: for i in $(cat line) .. will interate over each word of the file, not line!
Note: cat file | while     .. wont cut it as while will work in a bash of its own and variables modifed inside
                                         while wont be seen by this bash.

```sh
while read i ; do ... done   < $(another cmd) <- wont work. as that captures the output into a string.

while read i ; do ... done   < <(another cmd) <- works. as that creates a named-pipe (a fd) and that can be given as stdin.
```

# More than one file

https://wiki.bash-hackers.org/howto/redirection_tutorial
https://catonmat.net/bash-one-liners-explained-part-three

search : redirection stderr

In general `>&` or `<&` is the fd-duplicating operator in bash
Mnemonic `&` always comes after the direction. Otherwise its backgrounding (with one exception below).

```sh
## general open pattern: exec fd>filename
##    will set fd to the filename as a writable-fd. fd<filename, makes it readable-fd

## mostly what you need
exec 1>filename   # will make all stdouts go to this filename  ..
                  #    you will commonly see this to redirect all stdouts to a file in scripts
                  #    1 is optional, it can be ommitted
                  #    w/o exec , it affects only one command. And this your standard
                  #      command > file

exec 1> >(tee -a file) 2>&1  ## duplicate both stdout and stderr to a file as well

exec 3>filename   # will open(or reset if 3 exists) fd-3 to a write-fd for file. Note no & here.

echo "happy"      # writes to stdout.. normal
echo "happy" >&3  # write  to this file!

exec 3>&-         # closes the fd. Note the number comes first.

exec 4<>filename  # open for both reading/writing

# redirection pattern: exec source>&target
#   post that operation, source(-fd) is duplicated to target(-fd)
#   if source-fd is so far non-existant it will be created anew
#   if source-fd was pointing to something before this, it is now
#                           unavailable via source after this.
#   If you omit the exec, then the effect is only for this one command

echo "foo" 2>&1   # writes stderr to stdout
echo "foo" 1>&2   # rare: writes stdout into stderr

# suppress all output /errors .. Order is important
ls /badfile > /dev/null 2>&1


cmd 0<&-          # closes stdin for cmd

cmd &> file       # short for 2>&1 >file.. (the exception to &-not-first rule)
                  # write stderr and stdout to a file.
```

# List all key-bindings in zsh

bindkey -L

# echo with colors

https://en.wikipedia.org/wiki/Tput
https://en.wikipedia.org/wiki/ANSI_escape_code#Colors

tput setaf

reset:
tput sgr0

# Direct colors:

```sh
echo -ne 'Any of these in single quote'

reset:
'\033[0;0m'

set:
'\033[1;35m'

\033[ x;y;z m
x=1 or leave.. bold text ( This doesn't work very well in solarized - only red & magenta are accentuated. Rest all fall to greyish or whitish on bolding)
  4 or leave.. underline
y=30-37  .. for text color        90..97 increased intensity
z=40-47  .. for background color  100..107 increased intensity

    0  1  ..     2 3      ....    4 5       ..    6 7
Black Red .. Green Yellow .... Blue Magenta .. Cyan White
```

## in the 256 color format

```sh
'\033[38;5;<n>m'   where <n> is one of the 256 values. for foreground
'\033[48;5;<n>m'   where <n> is one of the 256 values. for background
```

## cursor up

```sh
function f_cursor_up()
{
    local lines=${1:-1}
    [ -n "${lines}" ] && /bin/echo -ne "\033[${lines}A\033[0G"
}
```

## reset terminal

```sh
stty sane

#or to restore
echo -e '\0033\0143'


#bring cursor back
tput cnorm


```


# Some useful stuff

## Getting yes/no or other inputs from user

```sh
echo "Do you wish to install this program?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) echo "Yay"; break;;
        No ) echo "Nay"; break;;
    esac
done
```

or

```sh
while true; do
    read -p "Do you wish to install this program?" yn
    case $yn in
        [Yy]* ) echo "Yay" ; break;;
        [Nn]* ) echo "Nay" ; break;;
        * ) echo "Please answer yes or no.";;
    esac
done
```

```sh
read -p prompt -t timeout variable_that_stores_input
```

## Find all unique files in 2 folders

```sh
#this WONT GIVE u if a file is present twice is DIR1 itself but absent in DIR2!
export DIR1=whatever
export DIR2=whatever2
find $DIR1 $DIR2 -type f -exec sha1sum '{}' \+ | sort | uniq -c --check-chars 40 | egrep '^ *1 ' | cut -c 51-
```

## Running sth at exit no-matter-what

search: TRAP cleanup

```sh
function my_function {
  rm whatever;
}
trap my_function INT TERM EXIT HUP ERR
```

## Do sth in a lock

```sh
lockfile=/var/tmp/mylock

if ( set -o noclobber; echo "$$" > "$lockfile") 2> /dev/null; then

        trap 'rm -f "$lockfile"; exit $?' INT TERM EXIT

        # do stuff here

        # clean up after yourself, and release your trap
        rm -f "$lockfile"
        trap - INT TERM EXIT
else
        echo "Lock Exists: $lockfile owned by $(cat $lockfile)"
fi
```

## get file-sizes

```sh
cd dir/of/interest
find . type d | xargs du -sh
ls -1 | xargs du -sh

find /dir/of/interest -maxdepth 1 | xargs -n 1 du -b -s | sort -n | awk '{cmd="numfmt --to=iec-i --suffix=B --format=\"%9.2f\" " $1; cmd | getline a; $1=a;print}'
## add -type f  or -type d to find about to filter only files or dirs

# root -- exclude proc and dot
find / -maxdepth 1 | grep -v -e proc -e '^.$' | xargs -n 1 sudo du -b -s | sort -n | awk 'BEGIN{cmd="numfmt --to=iec-i --suffix=B --format=\"%9.2f\" "} 1{ cmd $1 | getline a; sum+=$1; $1=a;print}END{ cmd sum | getline a; print a}'

```

## keep screen active

```sh
date; i=1 ; while [ 1 ] ; do printf "\rThis is iteration $i..." ; i=$((i+1)) ; sleep 3 ; done
```

## empty check

```sh
# lot  simpler
trimmed_var=$(echo "$var" | xargs)

# even if its multi-lined
echo "$var" | grep -qP '[^[:space]]'
test $?

# more detailed
is_empty() {
    var="$1"
    case ${var+x$var} in
      (x) echo empty;;
      ("") echo unset;;
      (x*[![:blank:]]*) echo nonblank;;
      (*) echo blank
    esac
}

```

## assign if empty

search: unset null

```sh
some_command ${value:-defaultvalue}

## also assign to the variable
some_command ${value:=defaultvalue}
# this will now print defaultvalue if it was unset before
echo $value

```


## read from stdin or file

search: dash

```sh
INFILE="${1:-/dev/stdin}"
```

## truncate a file

```sh
: > file

#anotherway
truncate -s 0 file

```

## ensure single instance of a script

search: unique flock

```sh
if mkdir -- "$LOCKDIR"
then
    # Do important, exclusive stuff
    if rmdir -- "$LOCKDIR"
    then
        echo "Victory is mine"
    else
        echo "Could not remove lock dir" >&2
    fi
else
    # some one else running
fi

## you can write a pid into the lock-dir
## but only for debug purposes. Dont expect that to be atomic
```

## delete a file with stray chars

```
# list with inode numbers
ls -li

# delete based on inode number
find . -inum ${inode_num} -delete

```

## check if user is root in a script

```sh
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root to perform sysctl operations"
  exit 1
fi

```




# Argc/Argv Parsing

## Hand rolled

good
* long-options and short-options

bad
* can't support args after options.. Grr!
* no unix sytle combining of options

```sh
# Search argc argv argparse
# poorman's getopt
while [[ $# > 0 ]] ; do
    key="$1"
    shift 1
    case $key in
        -e|--extension)
            EXTENSION="$1"
            shift # past argument
            ;;
        -s|--searchpath)
            SEARCHPATH="$1"
            shift # past argument
            ;;
        -l|--lib)
            LIBPATH="$1"
            shift # past argument
            ;;
        --default)
            DEFAULT=YES
            ;;
        *)
                # unknown option
        ;;
    esac
done
echo FILE EXTENSION  = "${EXTENSION}"
echo SEARCH PATH     = "${SEARCHPATH}"
echo LIBRARY PATH    = "${LIBPATH}"
echo "Number files in SEARCH PATH with EXTENSION:" $(ls -1 "${SEARCHPATH}"/*."${EXTENSION}" | wc -l)
if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 $1
fi
```

## getopts

good
* unix sytle combining of options
* can support args after options.. Grr!

bad
* no long-options support

```sh
OPTIND=1         # Reset in case getopts has been used previously in the shell.

# Initialize our own variables:
output_file=""
verbose=0

while getopts "h?vf:" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    v)  verbose=1
        ;;
    f)  output_file=$OPTARG
        ;;
    esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift
Leftovers=$@
```

## getopt

search: getopts best argparse argc argv

* Seems to be best of all worlds

```sh


usage() {
    echo "$0 -p|--presence -v|--value"
    echo "   -h|--help                mandatory_arg"
    echo
    echo " options:"
    echo "  -p|--presence  indicates-a-bool-arg"
    echo "  -v|--value     indicates-a-val-arg,   default: 2s"
    exit 1
}

parse_args() {
    YES_OR_NO_ARG=""
    STR_ARG=""
    options=$(getopt -o hpv: -l help,presence,value: -n "$0" -- "$@")
    if [ $? -ne 0 ] ; then
        echo "Incorrect options provided"
        exit 1
    fi
    eval set -- "$options"
    while true; do
        opt="$1"
        shift
        case "$opt" in
        -p|--presence)
            YES_OR_NO_ARG="yes"
            ;;
        -v|--value)
            VALUE="$1"
            shift
            ;;
        -h|--help)
            usage
            ;;
        --)
            break
            ;;
        *)
            echo "Unknown option: $opt"
            usage
            ;;
        esac
    done

    EXPECTED_ARG="$(echo $1 | xargs)" ; shift || true
    if [ -z "$EXPECTED_ARG" ] ; then
        echo "Mandatory arg missing"
        exit 1
    fi
    unused_args="$(echo $1 | xargs)"
    if [ -n "$unused_args" ] ; then
        echo "Ignoring remaining args: $@"
    fi
}
parse_args "$@"
```

# Finding who set that env variable

env - typically lists variables in the order in which it was set.

zsh -xl --> Super dump of all scripts that is run during a sesseion init.

bash:
PS4='+$BASH_SOURCE> ' BASH_XTRACEFD=7 bash -xl 7>&2

source: http://unix.stackexchange.com/a/154971

# Get src dir of a script

ref: https://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within

```sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#to also resolve linksk
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
```

# Create Temp file in bash

```sh
#search: mktmp
#create a file with a random name. XXXX is substituted with random chars
#also outputs the name back
tmpfile=$(mktemp /tmp/whatever-XXXXX)

#create dir instead
tmpdir=$(mktemp -d /tmp/whatever-XXXXX)

#just print a name
# note this is unsafe - as by the time you really create a file
# later, its possible that is created by somebody already.
mktemp -u /tmp/whatever.XXXX



```


```sh
tmpfile=$(mktemp /tmp/abc-script.XXXXXX)
#create 1 fd for writing, and 2 fd's for reading
exec 3>"$tmpfile" 4<"$tmpfile" 5<"$tmpfile"
rm "$tmpfile"

ifc=$1
while read i ; do
        echo "what a $i" >&3
done

cat <&4

```

* Note that in the above, the name is gone off the file-system.
* But the file can be read by `/proc/<pid>/fd/<no>`
* It seems the script can either read or write into such numbered-fd's.
* Thus we do a `3>` or a `4<` depending on if we need to write or read
* Further, one numbered-fd can be read only once looks like. Its like a
  stream devide for this script. We cant seek back. So open as many
  numbered fd's as you want to read.

# various set usages in bash

## debugging in bash

```sh
# turn on debugging
set -x
# turn off debugging
set +x
```

## others

```sh
# exit script as soon as a command fails
set -e
# unset variables when used cause a error
set -u
# if some command in pipe files, the entire set gets that return error
set -o pipefail
# by default its the last commands return value, like below
$ grep some-string /non/existent/file | sort
grep: /non/existent/file: No such file or directory
% echo $?
0
# but with pipefail set, its that of the first failing commmand

```


# Daemonizing

Search: daemon demon background

https://stackoverflow.com/questions/3430330/best-way-to-make-a-shell-script-daemon/29107686#29107686

* Quick hack way
```sh
nohup ./myscript 0<&- &> /abs/path/to/my.daemon.log.file &
## note:
## better to do following in script
me_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
me_FILE=$(basename $0)
#fork
$me_DIR/$me_FILE
cd /
umask 0
```

* proper-way
```sh
me_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
me_FILE=$(basename $0)
cd /
# we will use $1 of the script to decide who we are
#   not any of "child","daemon" -- original caller
#   child - first child
#   daemon - goto work
if [ "x$1" = "xchild" ] ; then
    umask 0
    shift # get rid of the child arg
    $me_DIR/$me_FILE daemon "$@" </dev/null >/dev/null 2>/dev/null &
    exit 0
elif [ "x$1" != "xdaemon" ] ; then
    ## DO YOUR ARG PROCESSING HERE
    ## getopts
    export vars_you_want_in_final_deamon
    setsid $me_DIR/$me_FILE child "$@" &
    exit 0
fi
# daemon
exec >/tmp/outfile    # whichever file you want for debugging
exec 2>/tmp/errfile
exec 0</dev/null
shift # get rid of the daemon arg.


# your work!
```

 

# Turn off glob expansion error in zsh

```
$ setopt +o nomatch
$ ls *non_existing_file*
ls: cannot access *non_existing_file*: No such file or directory

Default behavior
$ setopt -o nomatch
$ ls *non_existing_file*
zsh: no matches found: *non_existing_file*
```


# Quick notes on common commands 

## pwd

* Avoid all symlinks
```
pwd -P
```

## ps


```sh
## args explan
-e        every pid in the system
-f        standard column listing
-p <pid>  given pid
-t <term> against a particular terminal
-T        list all threads
-u <user> only processes of this user


#with long names
ps -e -o "pid,user:16,command"

#quickly list all pids in this shell
#  plain ps lists all processes in this shell, with lot of column,
#  pid= will list just pid's without heading.
#  but mind you, you also get bash's pid.
ps -o pid=

#with memory info
ps -u username -o pid,ppid,tt,%mem,bsdstart,args

#info on a given pid
ps -o args= -p $pid

#process against a terminal
ps -t pts/12 -f

#show processor assignment of all threads in a process
ps -o spid,pid,ppid,%mem,bsdstart,psr,s,class,pri,comm -T -p $pid
# show all processed sorted on cpu
ps -o spid,pid,ppid,%mem,bsdstart,psr,s,class,pri,comm -T -e | sort -n -k 6,6
# show proceses on a single cpu, eg:5
ps -o spid,pid,ppid,%mem,bsdstart,psr,s,class,pri,comm -T -e | awk '$6 == 5'


```


```
## search STANDARD FORMAT SPECIFIERS in https://man7.org/linux/man-pages/man1/ps.1.html
## format names for -o arg
pid                - pid
ppid               - parentpid
args               - invocation args
args, cmd, command - full list of command and args. Keep it last
ucmd, ucomm        - just the command.
comm               - threadname


bsdstart           - uptime since process start in Month/Day or HH:MM
etime              - elapsed time since process started in hh:mm:ss.sss format
etimes             - etime in secs.
lstart             - full blow up of start time.

psr                - cpu running on
rtprio             - realtimeprio
ni                 - nicevalue
class              - sched class - (FF, RR are real-time , TS(other), .. are others)

s                  - state code - R, S, I, D, Z

rss                - resident set size (inKB) (Most meaningful)
%mem               - rss as a % of total memory
trs,drz            - text resident size, data resident size
vsz                - virtual size (in 1024b units)
size               - approximate amount of swap space that would
                        be required if the process were to dirty
                        all writable pages and then be swapped out.
                        This number is very rough! (Dont follow)

tt                 - associate tty

```



## ls

```sh
# ls with full path (use abs-path + glob to invoke)
ls -d $(pwd)/*
```

## ln

```sh
ln actual_filename link_name

## args
# -s      create softlik
# -f      force overwrite of link_name
# -n      (not clear) from man: treat LINK_NAME as a normal file if it is a symbolic link to a directory
# -T      no target directory.. treate linkname as a regular file
          (didnt understand this yet)
# -A      list all dot-files. Dont show . and ..
# -a      list all dot-files. show . and ..

```


## cp

```sh

cp src dst

## args
##  -l   hardlink instead of copy
##  -d   preserve links .. no dereference
##  -r   recursive (same as -R)
##  -n   no-clobber, dont overwrite existing file
##  --preserve=LIST    preserve attributes
##      LISTOPTIONS:
##      mode,ownership,timestamps   (default)
##      context,links,xattr,all
##  -a   same as -dR --preserve=all

```

## sort

```sh

#args
-z         # every line is NUL-terminated, not \n
-t SEP     # field separator
-k f1,f2   # use only from field f1 to f2

```

## column

search: col table tabularize tabular output

```sh
# -t    ..  tabular output
# -s    ..  input-separator
cat output | column -t -s "|" --output-separator "|"

```

## date

```sh
#date in a given format
date '+%Y-%m-%d'
#date+time
date '+%Y-%m-%d-%H-%M-%S'

%Y - XXXX
%m - NN
%d - DD
%B - Month in Aaa form
%H - hour
%M - minute
%S - second
%N - nanosecond

-I - give only date portion

#get epoch seconds
date '+%s'

#convert a given epoch into date
date '-d@<epoch>'
#work on a given date as input
date '-dYYYY-MM-DDTHH:MM:SS'
date '-dYYYYMMDD'

## date in rfc-3399 format
date +%Y-%m-%dT%T.%9N%:z

## To assume a given timezone for a input
TZ=America/Los_Angeles date ...

## list of all timezones
timedatectl list-timezones

```

* iterate over date
    * date also supports addition in linux!

```sh
start=20141001
end=20181201
date=$start
while [ $date != $end ] ; do
    date=$(date --date="$date + 1 month" +'%Y%m%d') ;
    yy=${date:0:4} ; mm=${date:4:2} ;
    prefix="$yy-$mm-eStmt_$yy-$mm-21" ;
    pdftotext -layout ../${prefix}.pdf ${prefix}.txt ;
done

#try passwords
file=...
#start="19750101"
start="20041201"
for i in $(seq 0 $((30*365)) )  ; do
    passwd=$(date --date="$start + $i day" +'%d%m%Y');
    echo $passwd
    qpdf --password=${passwd} --decrypt ${file} a.pdf
    if [ $? -eq 0 ] ; then
        break;
    fi
done

```

* phc2sys - sync ptp clock to sys clock

## ts - add a timestamp to every line

```sh
## install
apt install moreutils

## add a timestamp
echo "any outout" | ts

## with a format
echo "any outout" | ts '%Y-%m-%d %H:%M:%S'

## with a format in a tz
echo "any outout" | TZ=Etc/UTC ts '%Y-%m-%d %H:%M:%S'

```


## touch and stat

```sh
## stat file
$ stat /var/log/MME.lakshman-agw-1.root.log.INFO.20250213-143839.3546
  File: /var/log/MME.lakshman-agw-1.root.log.INFO.20250213-143839.3546
  Size: 21349           Blocks: 48         IO Block: 4096   regular file
Device: fc01h/64513d    Inode: 13998       Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-02-13 14:38:41.848000000 +0000            <-- when file was read
Modify: 2025-02-13 14:38:41.348000000 +0000            <-- when file was modified
Change: 2025-02-13 14:38:41.348000000 +0000            <-- when metadata was modified
 Birth: -
$
```
* mount options around a time:
   * noatime    - Never update access time
   * strictatime - Always update access time
   * relatime    - Update access time with conditions (balanced approach)
      * any of
        * The current access time is older than the modification time (mtime)
        * The current access time is older than 24 hours
        * The file's status change time (ctime) needs to be updated
   * lazytime    - Defer timestamp updates to reduce I/O
* Note that any modification will result in both mtime and ctime change, as
  file-content modified => mtime has to be updated. And mtime update means a
  meta-data change so ctime will also be updated
  * touch can edit atime/mtime, but not ctime. Its always maintained by kernel.


```sh

## update all times of a file.
touch file

## update only atime (+ctime ofcourse)
touch -a filename
## update only mtime (+ctime ofcourse)
touch -m filename

## set time to a value of choice
## touch -t YYYYMMDDhhmm.ss filename
touch -t 202312251430.00 filename
touch -t $(date -d "yesterday" +%Y%m%d%H%M.%S) filename
touch -t $(date -d "2 hours ago" +%Y%m%d%H%M.%S) filename

## from that of reference file
touch -r reference_file file1 file2 file3



```


## hostnamectl

```sh
hostnamectl set-hostname newhostname
hostnamectl set-hostname "new-hostname" --pretty

```


## timedatectl

search: timectl datectl datetimectl ntp NTP

```sh
#get status
timedatectl status

# list time-zones
timedatectl list-timezones

# set a timezone
timedatectl set-timezone Asia/Kolkata
timedatectl set-timezone Etc/UTC

# set time
timedatectl set-time "YYYY-MM-DD HH:MM:SS"

# enable ntp
timedatectl set-ntp true

# see ntp status
timedatectl timesync-status

## to edit config .. use
/etc/systemd/timesyncd.conf

```

### phc ptp

```sh
sudo phc_ctl enp25s0f3 get ; sudo phc_ctl CLOCK_REALTIME  get ; date ; wget --method=HEAD -qSO- --max-redirect=0 google.com 2>&1 | sed -n 's/^ *Date: *//p'
sudo phc_ctl enp25s0f3 set $(python -c 'from dateutil.parser import parse ; import sys;  print(parse(sys.argv[1]).strftime("%s")) '  "$(wget --method=HEAD -qSO- --max-redirect=0 google.com 2>&1 | sed -n 's/^ *Date: *//p')")
```

## timeout

* stop a program after some time

```sh
timeout -sHUP 90s sleep 200
# does SIGKILL?
timeout 2m sleep 200

```



## head and tail

* Mnemonic: head is for top part printing, tail is for bottom part printing
* Mnemonic: for head, - is change behavior, for tail + if change behavior

```sh

head file.txt               # first 10 lines
tail file.txt               # last 10 lines
head -n 20 file.txt         # first 20 lines.. syn with head -n +20
tail -n 20 file.txt         # last 20 lines..  syn with tail -n -20
head -20 file.txt           # first 20 lines
tail -20 file.txt           # last 20 lines
head -n -5 file.txt         # all lines except the 5 last
tail -n +5 file.txt         # all lines except the 4 first, starts at line 5

## more args for tail
## -F     -- follow a file even if its rotated (as long as the new file appears with same name)
## -c <n> -- start from byte <n>.. tail -c +0 is equivalent of cat wholefile

```

## cut

```sh

## args

## -d, --delimiter=DELIM            use DELIM instead of TAB for field delimiter
## -f, --fields=LIST                select only these fields;
## -c1-2                            take the chars 1,2 only (1-based index)
## -c5-                             remove first 4 chars


## to achieve cutting last N chars, use 2 rev. Eg to remove last-4 chars
...whatever.. | rev | cut -c5- | rev


```

## split

```sh

split -d -b 10M largefile.txt chunk_
## -d      use numeric suffixes
## -b 10M  file size
## chunk_  your prefix

```


## read

* this is a shell builtin
* this annoyingly is different in bash and zsh. Notably:
    * `-a` is assign to arr in bash, while its `-A` in zsh
* `-d delim` will continue reading until delim instead of newline.
    * useing empty  will go on till EOF
    * This property can be leveraged to read heredocs

bash:
```sh
read -p prompt var_to_assign
IFS=$':' read -a array_var <<< ${var_to_split}
```

* another nifty way.. replace your delimiter with space and array-ize it

```sh
## assuming ; is your delimiter
array_var=(${var_to_split//;/ })

```


zsh:
```
read "var_to_assign?anything_after_qmark_is_prompt:"
IFC=$':' read -A array_var <<< ${var_to_split}
```

### heredoc read to a variable

search: multiline multi-line

```sh
read -r -d '' VAR <<'EOF'
abc'asdf"
$(dont-execute-this)
foo"bar"''
EOF

echo "$VAR"

```


## printf

* Very useful to convert hex to dec to oct etc..
* Has a nifty use to print array one per line
    ```sh
    printf "Element: %s\n" ${array[@]}
    ```
  The above works, because printf, after matching format-specifier, will repeat the matching all over again.
* Has a nift use case to repeat a string n times
    ```sh
    n=5
    printf "willrepeat%.0s" {1..${n}}
    ```
* Assigning to a variable. snprintf in bash!
    ```sh
    printf -v var_to_assign "format_str:%s" $value1
    ```
* join in bash
    ```sh
    # we assume , is the joining char here
    ## BUT - there will a , at the start of the array as well.
    joined_var=$(printf ",%0.s" ${my_array[@]})
    ## strip the first comma
    joined_var=$(printf ",%0.s" ${my_array[@]} | cut -c 2-)
    ```
* escape a variable
    ```sh
    printf -v escaped_var "%q" original_var
    ```

## random shuffle

```
shuf -i lo-hi -n output_count
```

## strace

```sh
## trace child process
strace -f whatever_program

```

## watch

```sh
instr="command1 | command2 | command3 arg1 arg2"
watch "$instr"

instr="source yourfiles.sh ; alias_there"
watch "$instr"

```


## top

Arguments

* `-H` - show threads
* `-d <sec>` - sample so many seconds. Also supports floating points.
* `-p <pid>` - only these pids. Can repeat
* `-b` - batch mode. Useful when dumping output
* `-n <count>` - Only dump count samples

Commands while interactive
* `H` - thread enable
* `p` - sort by cpu
* `m` - sort by memory
* `f` - adjust columns
* `W` - save config

```
## in batch mode, just collect first few lines -- leverage grep -A on the first line
## adjust -n to what you want
top -n 15 -H -d 1 -b | grep "load average" -A 30

## say you have cpu in col-12
top -n 1 -H -d 1 -b | sort -n -k 12 > /tmp/a

```

## nice

* https://askubuntu.com/a/1078563

search: priority realtime rt

* Final priority is a number from -100 to 39 (-100 being the top prio)
    * Real time processes: final priotity: -100 to -1
    * Non-RT processes:    final priotity:    0 to 39
* Real time processes have a RT-prioity a number.
    * RT-prio is a number from 99 to 0
    * RT-99 maps to Final-Prio: -100 Highest
    * RT-0  maps to Final-Prio: -1   Lowest in RT
    * final-prior = -1 - realtime_priority
* non-realtime proceses have a nice value
    * Nice is a number from -20 to 19
    * nice: -20 maps to final priority:  0 (highest)
    * nice:  19 maps to final priority: 39 (lowest)
    * final-prior = 0 + nice
    * nice for RT is always 0


* In ps,
    * pri -> final priority
    * ni  -> nice
    * rtprio -> realtime priority

* for non-realtime:
    * sched-classes
        * SCHED_OTHER   the standard round-robin time-sharing policy
        * SCHED_BATCH   for "batch" style execution of processes
        * SCHED_IDLE    for running very low priority background jobs.
* for real-time:
    * sched-classes
        * SCHED_FIFO    a first-in, first-out policy
        * SCHED_RR      a round-robin policy


```sh

# run as realtime with final-prio= -51
chrt --rr 50 my_prog

# to change a running pids prio to realtime
chrt --rr -p 50 $pid

```



## xargs

* To supply one arg at a time for find
```sh
find . -print 0 | xargs -0 your_command
```

* other useful args
```sh
--no-run-if-empty / -r
-n 1
-I'{}' your_command '{}'
```


## hexdump/od

* dump boht hex and ascii

```
hexdump -C <file>
```

* with a format string
  The following adds a `\x` and every byte as hex value.
```
hexdump -e '"\\\x"/1 "%02x"'
```
Explanation:
* -e is for format-string.
* format string has to be inside double-quotes. hexdump must see
  the double quotes.
  * `"\\\x"` is a literal `\x` to be printed.
  * `\1 ` is outside double quotes. This is a requirement. It
    is a iteration count and byte count. There should be a space
    after this
  * `"%02x"` is a traditional printf style format string to print
    in hex with 0 pre-pended and a width of 2.

## numfmt

search : human readable friendly

```sh
numfmt --to=iec-i --suffix=B --format="%9.2f" 1975684956

```

## reverse lines

* mnemonic .. spell cat backwards!

tac


## reverse a single line

rev

```sh
## works to get rid of last n chars off
##    note cut only snips the first n chars
... | rev | cut -c5- | rev
```

## journalctl

Search: syslog

```sh
journalctl --list-boots
### note: this gives the last boot time
uptime -s

# lists logs of just one unit (service)
journalctl -u some_service

##other args
##  -f                 --  follow
##  -n 100             --  last 100 lines
##  -r                 --  reverse .. newer entries first

# list log of a particular boot
journalctl -b -1

# list log since current boot only
journalctl -b 0

# only from till
journalctl --since "3 hours ago"
journalctl --since "2 days ago"
journalctl --since "2015-06-26 23:15:00" --until "2015-06-26 23:20:00"

#only form processes running as a user
journalctl _UID=108

#only for one service and only from last invocation/start
journalctl _SYSTEMD_INVOCATION_ID=$(systemctl show --value -p InvocationID magma@magmad)

# clean up / clear
journalctl --vacuum-time=2d
journalctl --vacuum-size=500M

## find the earliest log
journalctl --no-pager --reverse | tail -n1
# or more directly:
journalctl --no-pager --output=short-iso --since "1970-01-01" | head -n1

```

## logger

* useful to log from shell scripts

```sh
## args
## -i                 ..   include pid in logline
## -p facility.level  ..   eg: local3.info
##                              levels: emerg alert crit err warning notice info debug
##                              facility: user local0 .. local7
## -s                 ..   output to stderr also
## -t                 ..   use this tag (instead of username)

```


## systemctl

search: systemd

```sh
systemctl list-units --type=service

# This will make systemd read all services and update
# its database
sudo systemctl daemon-reload

# verify a definition file
sudo systemd-analyze verify phy_ifc_map_check.service

# show prperties of a aservice
systemctl show $SERVICE

# any specific one .. Get pid of main process
#  --value avoids printing PropertyName=
systemctl show --property MainPID --value $SERVICE

# gives active inactive .. also exit status gives info
systemctl is-active application.service
```

```sh
# Types:
Type=simple
Type=oneshot

# unit configs
StartLimitInterval=3600
StartLimitBurst=5            ## together StartLimitInterval and StartLimitBurst
                             ## control how much the service can restart in
                             ## the interval. Beyond that systemd will not
                             ## restart the service.

```

search: systemd

* Simple user service
```sh
mkdir -p  ~/.config/systemd/user/

cat <<EOF > ~/.config/systemd/user/devvm_ssh_starter.service
[Unit]
Description=ssh monitor for dev-vm
StartLimitInterval=3600
StartLimitBurst=5

[Service]
Type=simple
ExecStart=ssh -N -o ExitOnForwardFailure=yes -o PreferredAuthentications=publickey -L *:38882:localhost:22 lakshman@192.168.122.162
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now  devvm_ssh_starter.service

systemctl --user status devvm_ssh_starter.service
journalctl --user -u devvm_ssh_starter
```


* dynamically adjust resources

https://www.linkedin.com/pulse/do-you-know-can-limit-service-memory-cpu-linux-tahmid-ul-muntakim

```sh
## set once for this incarnation
ystemctl set-property --runtime fhttpd.servicee CPUQuota=infinity MemoryLimit=infinity

## set forever
systemctl set-property httpd.service MemoryLimit=500M
systemctl set-property httpd.service CPUQuota=20%
```

* man pages

```sh
man systemd.resource-control
```

* watch-systemd

```sh
systemd-cgtop

```

* for timers:
    * https://documentation.suse.com/sle-micro/6.0/html/Micro-systemd-working-with-timers/index.html




## just get ip for a hostname

```sh
#just the ips alone
dig +short hostname

#just show a-records alone
dig +noall +answer hostname

```


### Other ip tools

```sh
#verify if ip is good
#  -c (verify and show all details of ip)
#  -s (silent - suppress all the detalis)
ipcalc -cs $ip
if [ $? -ne 0 ] then echo "bad ip" ; fi

```



## unix user management

```sh
user_to_add=lakshman   #or whoever the name is
cpass=...crypt-encrypted-pass...
#prefer useradd over adduser
useradd -m -p $cpass -s /bin/bash ${user_to_add}
## options
# -m, --create-home    -- creates home directory
# -p <passwd>          -- supply crypted password over commandline
# -s <shell>

#modify user
usermod [optoins] $USER
## optoins
# -a                    -- append to more groups. Must have -G
# -G GROUP1[,Group2,..] -- groups

#eg:
sudo usermod -a -G libvirt ${user_to_add}
# change shell
sudo usermod -s /sbin/nologin ${user}        ## interestingly /bin/nologin totally prevents, while /sbin/nologin allows ssh-forwarding

## change password for a user as root
sudo passwd username
```

* Getting crypted password

```
#one liner
pass=clearpass
cpass=$(python3 -c 'import crypt;print(crypt.crypt("'"$pass"'"))' 2> /dev/null)
echo $cpass


python3
>>> import crypt
>>> crypt.crypt('clearpassword')
'$6$o.bhfCRTBCUr71Qm$Ljmb3Oh8jrSvwzu.S5sdJ/mQorXuBOk9xbQiTY/jQn.FTXYF/gE08Tg09MEK.OAcFPOTCV4A1kuH0QXVWEpeN0'
### Note the first 20 chars is the salt. This is random generated.
### We can pass it as second arg to get the same hash back
>>> crypt.crypt('clearpassword','$6$o.bhfCRTBCUr71Qm$')
'$6$o.bhfCRTBCUr71Qm$Ljmb3Oh8jrSvwzu.S5sdJ/mQorXuBOk9xbQiTY/jQn.FTXYF/gE08Tg09MEK.OAcFPOTCV4A1kuH0QXVWEpeN0'
### if you want to add rounds
>>> crypt.crypt('clearpassword','$6$rounds=5000$o.bhfCRTBCUr71Qm$')
'$6$rounds=5000$o.bhfCRTBCUr71Qm$Ljmb3Oh8jrSvwzu.S5sdJ/mQorXuBOk9xbQiTY/jQn.FTXYF/gE08Tg09MEK.OAcFPOTCV4A1kuH0QXVWEpeN0'
>>>

## here is a command line arg of getting passwd
pass=$(python3 -c 'import crypt; print(crypt.crypt("clearpass"))')

## update it to use
usermod -p $pass $user
```

* delete user

```sh
userdel -f -r ${user_to_del}

### 
##  -r     -- remove home dir and mail spool
##  -f     -- force remove files even if not owned by user

```



### add to sudoers

Search : password

```sh
username="whoever"
username=$(whoami)
echo "${username} ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers > /dev/null

## add a particular command for one user
echo "${USER_NAME}  ALL=NOPASSWD: /usr/local/bin/collect_tech_dump.sh" >> /etc/sudoers


# to add to sudo group
sudo usermod -a -G sudo ${user_to_add}

```

### sudoers file syntax

* https://toroid.org/sudoers-syntax

```sh
## General
## <%group> -- % identifes a group
## this line says, the given user can in the mentioned hosts
##   switch as the tgt-user/grp and run the list of commands.
<user>  <hosts>=(<tgt-users>:<grp>) ALL=[NOPASSWD:] [SETENV:] [=list-cmds]

## eg:
##  lakshman can in All hosts switch as any user/groups and run
##   anything w/o prompt for passwd
lakshman ALL=(ALL:ALL) NOPASSWD: ALL

syslog  ALL=NOPASSWD: /usr/local/bin/rotater_script.sh

remoteagwuser ALL=(root) NOPASSWD: /usr/local/bin/list_listeners.sh
some_admin_user ALL=(remoteagwuser:remoteagwuser) /usr/local/bin/manage_authorized_keys.py


```

### sudo quirks

```sh
# env var having real user
echo $SUDO_USER

```

### hosed sudoers file

https://unix.stackexchange.com/a/677592

* open 2 shells
* ON first, gets its pid - `echo $$`
* On second, run
    ```sh
    pid=...bashofotherterm..
    pkttyagent --process $pid
    ```
* On first, run
    ```sh
    pkexec bash
    ```
* you will have password prompted on other shell, type in and you have a sudo bash on the first

## chomp last line in file

```sh
perl -pe 'chomp if eof' filename > new_filename
perl -pi -e 'chomp if eof' inline_filename

#using bash -- printf
printf %s "$(< $file)" > $file
```



## expand filename soft links

```sh
realpath ${file}

#also
readlink -e ${file}

```



# Give multi-line input as stdin to a command

* this is refered as heredoc
* Note variable expansion happens inside of heredoc. If the delimiter is quoted, no substitution happen
    * i.e Single quote that `'EOF'` will not expand variables and commands
* Adding a `<<-` will allow for initial tabs to be ignored - Otherwise all lines should start from beginning.
    * Note that tabs will be gone in the final output. So tabs might help in indenting in ur source where heredoc is present.
    * spaces following tabs will be preserved on the emitted output.

```sh
# can be any command
## btw, its mostly cat -- NOT echo. The contents are from stdin not an arg.
cat <<EOF
your multi line1 with substitution of ${variable}
your multi line2 with substitution of $(command output)
...
EOF

cat <<'EOF'
no substition for this ${variable}
EOF
```


# Argument referencing

http://zsh.sourceforge.net/Doc/Release/Expansion.html

```sh
<Event Designator>:<Word Designator>:<Modifier>
```

Event Designator - chooses which command

```sh
!! last comand
!-n last nth command .. !-1 is same as !!
!# current command so far
```
Word Designator - if blank, entire command.

```sh
0 - first word (command)
1 - first arg
n - nth arg
$ - last arg
```

Modifier

```sh
a - abs path name
h - like dirname
t - like basename
```


# To see list of all binding

```sh
bash$ bind -p

zsh$ bindkey -L
zsh$ zle -la

#query existing binding
zsh$ bindkey '\C-y'
```


# Linux proc file stuff

```
# typically shows 52 values
wc /proc/${pid}/stat

values=($(cat /proc/${pid}/stat))
pid=${values[0]}
comm=${values[1]}
state=${values[2]}
ppid=${values[3]}
utime_in_ticks=${values[13]}
stime_in_ticks=${values[14]}
num_threads=${values[19]}
vsize_in_bytes=${values[22]}
```

* How to know page-size in the system

```
#just pick any process and use /proc/self/smaps
cat /proc/self/smaps | grep KernelPageSize | head -n 1
```


# To read links

http://chneukirchen.org/blog/archive/2008/02/10-zsh-tricks-you-may-not-know.html


