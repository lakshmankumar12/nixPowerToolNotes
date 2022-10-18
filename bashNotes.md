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
```

Note: `${i:-val}` .. will give i or val if is unset

## is substring in string

```sh
if [[ $haystack == *"$needle"* ]]
then
  echo "It's there!";
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

* Deletes shortest match of $substring from back of $string.
```sh
${string%substring}
```

* Deletes longest match of $substring from back of $string.
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

## Trim white space

```sh
var="  one two three  "
trimmed_var=$(echo "$var" | xargs)
#trimmed_var="one two three"
```


# Parameter expansion

```sh
#substitution
#  lonest pattern is substituted with string
#  pattern == # , matches start.
#  pattern == % , matches end.
${parameter/pattern/string}
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

```
set --

# Rarely-appreciated property of xargs:  it can understand quotes.
# We use it to convert var="asdf" into var=asdf
xargs -n 1 < configfile > /tmp/$$

while read LINE
do
        set -- "$@" -v "$LINE"
done < /tmp/$$

rm -f /tmp/$$
```


# Arrays

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

search : redirection stderr

In general `>&` or `<&` is the fd-duplicating operator in bash
Mnemonic `&` always comes after the direction. Otherwise its backgrounding (with one exception below).

```sh
exec 3>filename   # will duplicate 3 to a write-fd for file. Note no & here.
exec 1>filename   # will make all stdouts go to this filename

echo "happy"      # writes to stdout.. normal
echo "happy" >&3  # write  to this file!

exec 3>&-         # closes the fd. Note the number comes first.

exec 4<>filename  # open for both reading/writing

echo "foo" 2>&1   # writes stderr to stdout
echo "foo" 1>&2   # rare: writes stdout into stderr
                  # target>&source

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

# Getting yes/no or other inputs from user

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

# Find all unique files in 2 folders

```sh
#this WONT GIVE u if a file is present twice is DIR1 itself but absent in DIR2!
export DIR1=whatever
export DIR2=whatever2
find $DIR1 $DIR2 -type f -exec sha1sum '{}' \+ | sort | uniq -c --check-chars 40 | egrep '^ *1 ' | cut -c 51-
```

# Running sth at exit no-matter-what

```sh
function my_function {
  rm whatever;
}
trap my_function INT TERM EXIT HUP
```

# Do sth in a lock

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

* Seems to be best of all worlds

```sh
options=$(getopt -o ab:c -l alpha,bravo:,charlie -n "$0" -- "$@")
if [ $? -ne 0 ] ; then
    echo "Incorrect options provided"
    exit 1
fi
eval set -- "$options"
while true; do
    opt="$1"
    shift
    case "$opt" in
    -a|--alpha)
        echo "a option given"
        ;;
    -b|--bravo)
        echo "b option with arg $1"
        shift
        ;;
    -c)
        echo "c option given"
        ;;
    --)
        break
        ;;
    *)
        echo "Unknown option"
        exit 1
        ;;
    esac
done

echo "remaining parameters: $@"

exit 0;
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

# debugging in bash

```sh
# turn on debugging
set -x
# turn off debugging
set +x
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
if [ "$1" = "child" ] ; then
    umask 0
    $me_DIR/$me_FILE daemon "$@" </dev/null >/dev/null 2>/dev/null &
    exit 0
elif [ $1 != "daemon" ] ; then
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
ps -o args= -p pid
```

* useful headings in ps -o
* args, cmd, command  -- full list of command and args. Keep it last
* comm, ucmd, ucomm   -- just the command.
* time, cputime       -- cumulative cpu time
* etime               -- elapsed time since process started in hh:mm:ss.sss format
* etimes              -- etime in secs.
* bsdstart            -- start-time in Month/Day or HH:MM
* lstart              -- full blow up of start time.
* tt                  -- terminal
* pid,ppid            -- pid and parent pid resp
* rss                 -- resident set size (inKB) (Most meaningful)
* %mem                -- rss as a % of total memory
* trs,drz             -- text resident size, data resident size
* vsz                 -- virtual size (in 1024b units)
* size                -- approximate amount of swap space that would
                         be required if the process were to dirty
                         all writable pages and then be swapped out.
                         This number is very rough! (Dont follow)



## ls

```sh
# ls with full path (use abs-path + glob to invoke)
ls -d $(pwd)/*
```

## sort

```sh

#args
-t SEP     # field separator
-k f1,f2   # use only from field f1 to f2

```


## date

```sh
#date in a given format
date '+%Y-%m-%d'

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
```

date also supports addition in linux!
```
start=20141001
end=20181201
date=$start
while [ $date != $end ] ; do
    date=$(date --date="$date + 1 month" +'%Y%m%d') ;
    yy=${date:0:4} ; mm=${date:4:2} ;
    prefix="$yy-$mm-eStmt_$yy-$mm-21" ;
    pdftotext -layout ../${prefix}.pdf ${prefix}.txt ;
done
```

## hostnamectl

```sh
hostnamectl set-hostname newhostname
hostnamectl set-hostname "new-hostname" --pretty

```


## timedatectl

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



```


## head and tail

* Mnemonic: head is for top part printing, tail is for bottom part printing
* Mnemonic: for head, - is change behavior, for tail + if change behavior

```sh
#simple first n. Both of below are synonymous
head -n 10
head -n +10

#print except last n
head -n -10

#print last n. Both are synonymous
tail -n 10
tail -n -10

#print except first n (note that you desire to exclude first n, you should issue n+1 in command)
tail -n +11
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
IFC=$':' read -a array_var <<< ${var_to_split}
```

zsh:
```
read "var_to_assign?anything_after_qmark_is_prompt:"
IFC=$':' read -A array_var <<< ${var_to_split}
```

### heredoc read to a variable

search: multiline

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
* Assigning to a variable.
    ```
    printf -v var_to_assign "format_str:%s" $value1
    ```

## random shuffle

```
shuf -i lo-hi -n output_count
```

## top

Arguments

* `-H` - show threads
* `-d <sec>` - sample so many seconds. Also supports floating points.
* `-p <pid>` - only these pids. Can repeat
* `-b` - batch mode. Useful when dumping output
* `-n <count>` - Only dump count samples

## xargs

* To supply one arg at a time for find
```
find . -print 0 | xargs -0 your_command
```

* other useful args
```
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

## journalctl

Search: syslog

```sh
journalctl --list-boots

# lists logs of just one unit (service)
journalctl -u some_service

# list log of a particular boot
journalctl -b 1

# only from till
journalctl --since "3 hours ago"
journalctl --since "2 days ago"
journalctl --since "2015-06-26 23:15:00" --until "2015-06-26 23:20:00"

#only form processes running as a user
journalctl _UID=108

```

## systemctl

```
systemctl list-units --type=service

```


Types:
```sh
Type=simple
Type=oneshot

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



## just get ip for a hostname

    dig +short hostname

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
#prefer useradd over adduser
useradd -m -p $pass -s /bin/bash ${user_to_add}
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
```

* Getting crypted password
```
python3
>>> import crypt
>>> crypt.crypt('clearpassword')
'$6$o.bhfCRTBCUr71Qm$Ljmb3Oh8jrSvwzu.S5sdJ/mQorXuBOk9xbQiTY/jQn.FTXYF/gE08Tg09MEK.OAcFPOTCV4A1kuH0QXVWEpeN0'
### Note the first 20 chars is the salt. This is random generated.
### We can pass it as second arg to get the same hash back
>>> crypt.crypt('clearpassword','$6$o.bhfCRTBCUr71Qm$')
'$6$o.bhfCRTBCUr71Qm$Ljmb3Oh8jrSvwzu.S5sdJ/mQorXuBOk9xbQiTY/jQn.FTXYF/gE08Tg09MEK.OAcFPOTCV4A1kuH0QXVWEpeN0'
>>>

## here is a command line arg of getting passwd
pass=$(python3 -c 'import crypt; print(crypt.crypt("clearpass"))')
```





# Give multi-line input as stdin to a command

* this is refered as heredoc
* Note variable expansion happens inside of heredoc. If the delimiter is quoted, no substitution happen
    * i.e Single quote that `'EOF'` will not expand variables and commands
* Adding a `<<-` will allow for initial tabs to be ignored - Otherwise all lines should start from beginning.
    * Note that tabs will be gone in the final output. So tabs might help in indenting in ur source where heredoc is present.
    * spaces following tabs will be preserved on the emitted output.

```sh
command <<EOF
your multi line1 with substitution of ${variable}
your multi line2 with substitution of $(command output)
...
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

## chomp last line in file

```
perl -pe 'chomp if eof' filename > new_filename
perl -pi -e 'chomp if eof' inline_filename
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


