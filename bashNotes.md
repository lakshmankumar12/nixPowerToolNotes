# constructs

```sh
if [ condition  ] ; then
  statement
elif [ condition ] ; then            # else if
  statement
else
  statement
fi
```

```sh
Use [[ condition ]] instead of [ ... ]
```

See https://stackoverflow.com/a/3427931

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

## Changing cases for strings

```sh
#to lowercase
lower=${a,,}
#to uppercase
upper=${a^^}
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

http://tldp.org/LDP/abs/html/string-manipulation.html

* mnemonic #-knocks-of-prefix (remember vi-back)

## remove the shortest/longest prefix

```sh
${varHavingYourBigString#prefix}
${varHavingYourBigString##prefix}
```

## remove the shortest/longest suffix

```sh
${varHavingYourBigString%suffix}
${varHavingYourBigString%%suffix}
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
  eval ${var_name_passed}="Value from here"
}

implementor var_name
echo "got var_name set to $var_name"
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

a+=("hola")   #append to a array
```

reference: http://www.tldp.org/LDP/abs/html/arrays.html#ARRAYSTROPS

```sh
${a[@]/#/XY}  #adds a XY to the beginning of all members
${a[@]/%/XY}  #adds a XY to the end of all members
```

* gobble a command's line into a array:

```sh
IFS=$'\r\n' GLOBIGNORE='*' XYZ=($(command))
```

# Associative array / dict / hash

```sh
declare -A aa
aa["key"]="value"
echo ${aa["key"]}
echo ${aa[$var_expanding_to_key]}

declare -A bb_from_list
bb_from_list=(["key1"]="value1" ["key2"]="value2")

#Mind the exclamantion! W/o it it gives values
for key in ${!aa[@]} ; do
  echo "value at $key is ${aa[$key]}"
done
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

Note: for i in $(cat line) .. will interate over each word of the file, not line!
Note: cat file | while     .. wont cut it as while will work in a bash of its own and variables modifed inside
                                         while wont be seen by this bash.

```sh
while read i ; do ... done   < $(another cmd) <- wont work. as that captures the output into a string.

while read i ; do ... done   < <(another cmd) <- works. as that creates a named-pipe (a fd) and that can be given as stdin.
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

good
* long-options and short-options

bad
* can't support args after options.. Grr!
* no unix sytle combining of options

```sh
#Usage: ./myscript.sh -e conf -s /etc -l /usr/lib /etc/hosts 
# note: if this is set to > 0 the /etc/hosts part is not recognized ( may be a bug )
while [[ $# > 1 ]]
do
key="$1"

case $key in
    -e|--extension)
    EXTENSION="$2"
    shift # past argument
    ;;
    -s|--searchpath)
    SEARCHPATH="$2"
    shift # past argument
    ;;
    -l|--lib)
    LIBPATH="$2"
    shift # past argument
    ;;
    --default)
    DEFAULT=YES
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
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

or

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


# ps

```sh
#with long names
ps -e -o "pid,user:16,command"
```

# Give multi-line input as stdin to a command

* this is refered as heredoc
* Note variable expansion happens inside of heredoc as long as you put in quotes(!)

```sh
command <<EOF
your multi line1
your multi line2
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
!-n last nth command .. !-1 is same as !-2
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

# Ubuntu pkg mgmt

https://askubuntu.com/questions/170348/how-to-create-a-local-apt-repository

## remove a pkg

```
apt-get remove --purge libav-tools
```


# Centos pkg mgmt

* Force install a rpm
    ```sh
    rpm -ivh --force --nodeps whatever.rpm
    ```

* List files in  a rpm
    ```sh
    rpm -qpl whatever.rpm
    ```

* Just extract files of a rpm
    ```sh
    rpm2cpio ./your-rpm.rpm | cpio -idmv
    ```


## chomp last line in file

```
perl -pe 'chomp if eof' filename > new_filename
perl -pi -e 'chomp if eof' inline_filename
```

# To read links

http://chneukirchen.org/blog/archive/2008/02/10-zsh-tricks-you-may-not-know.html
