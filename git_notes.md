# day to day working

```sh

#revert modified changes and come back to HEAD
## WARN :: IRREVERSIBLE
git checkout -- .
# only that of particular file
git checkout -- path/to/file


```

## git diff args

```
git diff <lhs-commit> <rhs-commit> <file-path>

git diff HEAD -- <all-files>

#show staged changes
git diff --cached

#avoid getting the a/ b/
git diff --no-prefix

#get only added files between 2 commits that patch a patten
git diff --name-only --diff-filter=A HEAD HEAD~1 *.md

```

## backup

```
#get a beautiful list of all local commits as a mail format
git format-patch --stdout <Any-range>   # eg: base..

#apply the generated file
git am <file>
```

## grep with git

```sh
git grep -nH 'yourGrepPattern' -- '*path/spec/*'
```

## push

### Push only one or a few commits when we have more local commits

```
git push <remotename> <commit SHA>:<remotebranchname>
git push <remotename> <commit SHA>:refs/heads/<new-remotebranchname-name>
```



# working on files

## List all tracked files

```sh
git ls-files
## this is very useful if your current repo is in a flux
## and you want to see the tree as of some other commit
## giving HEAD is ofcourse is same as git ls-files
git ls-tree --full-tree -r <treeish>
```

* See permission of a file. Note we will only see 644 or 755 here.

```sh
git ls-files -s file/to/check/permission
```


## List all untracked files

```sh
git ls-files --others --exclude-standard
```

## show a particular revision

```sh
git show treeish:path/to/file
```

## staging

search: stage cache

```sh
#add
git add file-to-stage

#show
git ls-files --staged

#unstage
git restore --staged file-to-unstage

#add exec bit
git update-index --chmod=+x ${file}


```


# Commits handling

## come to any commit

```sh
git reset --hard HEAD~1
```

* you can get it back as long as its in the same repo with git reflog (git pack
  may erase it after some time..)

## To get the commit from where you started working

Normally, `@{u}` is enuf. However, if you did a git fetch, chances are `@{u}` has advanced.

```
git merge-base @{u} $(git symbolic-ref --short -q HEAD)

#find the most-common-ancestor /parent of 2 commits
git merge-base <commt1> <commit2>
```

## getting latest /top commit

```
git log -n 1
git log -n 1 --pretty=format:"%H"
```

## geting parent commit of a commit

```
git show --quiet --pretty=format:"%P" <commit>

commit~1  .. First Parent of commit
commit~2  .. Grand(second) Parent of commit

commit^1  .. First left parent of commit
commit^2  .. second left parent of commit (meaningful for merge commits)
```



# Branches

## List all branches in server and clone

```sh
git branch -a

# list them in last update order
git branch --sort=committerdate
```
NOTE: If you dont see remotes/origin branches here, then your refspec isn't good.
See section on refspec

## checkout remote branch with tracking

```sh
git checkout --track -b <local branch> <remote>/<tracked branch>

# if -b <name> is to be same as remote's name, you can skip it
git checkout -t origin/haml

# if brach is already present locally / existing track
git branch -u origin/remote_branch_name local_branch_name
git branch --set-upstream-to=upstream/remote_branch_name

# to set the refspec right.
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
```

## delete branches

```sh
git push -d <remote_name> <branchname>   # Delete remote
git branch -d <branchname>               # Delete local
git branch -D <branchname>               # force delete local even if it has unmerged commits

# if remote deleted branches, then use this to clear if off ur local repo too
git remote prune origin
```

## which remote am i tracking

```
git rev-parse --abbrev-ref @{u}
```

## which branches contain a commit

```
git branch -a --contains <commit>
```

* To check if current branch has a commit
  * Replace HEAD with branch_name to check on other branch
```sh
git merge-base --is-ancestor $COMMIT_ID HEAD

```



# refspec


Check repo_root/.git/config and see if you have this:

```
[remote "origin"]
    url = WHATEVER
    fetch = +refs/heads/*:refs/remotes/origin/*
```
* If you are missing the fetch line, add it.

## reset the origin url

search: uri remote

```sh
git remote set-url origin new.git.url/here

```


# log

## To see all changes to a file across all branch

```
git log --all -- <path/to/file>
```

## Various flavors of git-log

```
git log --author=abc         # show all commits of author
git log --grep=efg           # show all commits with comments having the string
git log -S=hij               # show all commits with changed lines having the string. Slower -> so narrow ur commit-list
git log --name-only          # display filename changed with every commit

git log --pretty=fuller      # shows both dates
```

### Various pretty

```
git log --pretty=oneline     # <sha1> <title line>
                 short       # 2LH + message, commit/author
                 medium
                 full
                 fuller
                 format:".."

                 %H/%h = commit hash/abbr-hash
                 %T/%t = tree   hash/abbr-hash
                 %P/%p = parent hashes
                 %an   = author name
                 %ad/%aD/%ar/%i/%I = author-date  (data=/2822/relative/unixTim/ISO8601/strict)
                 %cd/%cD/%cr/%i/%I = author-date  (data=/2822/relative/unixTim/ISO8601/strict)

--name-only   : Adds filenames
--name-status : Adds a M to filename.
--stat        : count of lines changed.
```

# tags

## Creating a simple tag

git tag <tagname> <commit>

## creating a annotated tag

git tag -a <tagname> -m '<message>'

## Get info of a annotaed tag

```
git tag -l 'prefix*'   # will give all tags that start with prefix
git tag -l '*substr*'  # will give all tags that have substr

git show <tag-name>    # will show info of tag + the commit as well. Can get the time of the tagging.
```

## To get the tag done on a given date

```
git describe branch_name@{mar.04.2016}  # This uses reflog.. so u may see only available till date.

git log branch_name --until=aug.04.2016

git describe --tags $(git rev-list -n 1 --before=05.aug.2015 HEAD)  #sub head with branch if u are not in branch

mgtags 80S | tail -n 100 | while read i ; do npgit log -n 1 --decorate --pretty=format:"$i %cD" $i ; echo ; ; done

#print every 50th tag.
mgtags 80S | sed -n '1~50p' | while read i ; do npgit log -n 1 --decorate --pretty=format:"$i %cD" $i ; echo ; ; done
```

## Push a tag

```
git push origin <tag_name>
```

## delete a tag from local remote

```sh
#local
git tag -d tagname

#remote -- same for branch as well
git push --delete origin tagname

#https://nathanhoad.net/how-to-delete-a-remote-git-tag
git push origin :refs/tag/tagname
```

## list tags sorted by createdate

```sh
git for-each-ref --sort=creatordate --format '%(refname) %(creatordate)' refs/tags
```

# Backend

## general args

```sh
--abbrev-ref   -- usually gets the branch name instead of sha

```


## Variables

```sh
@{u} -- short for @{upstream}
     -- the name of the tracked branch in the remote.

```


## To quickly get the sha-1 of any tag/branch-name/commit-representative!

```
#especially if you are in a script
git rev-parse HEAD
git rev-parse tag_name

#to check if this is a git-repo
git rev-parse HEAD
if [ $? -eq 0 ] ; then
  echo "you are in a git repo"
else
  echo "you are NOT in a git repo"
```

## Difftool with a different tool

git difftool -t meld

# stash

```
#create a stash
git stash

#create a stash with a custom message
git stash save "some custom message"

#re-apply a stash
git stash pop

#list all stashes
git stash list

#delete a stash
git stash drop
git stash drop stash@{1}

#show content w/o applying
git stash show -p
git stash show -p stash@{1}

#stash only certain files
files_list=<files-that-shouldn't-be-staged>
git add $files_list
git stash save --keep-index
git reset HEAD $files_list
```


# Vim-fugitive notes

* fugitive works only on a file. So just open a file and then issue any fugitive command

```
:Gdiff             # diff the current file's changes from index
:Gdiff HEAD
:Gdiff any_treeish

:Gedit <commit>
:Glog -n 5         #log the current-file, until 5 commits
:Glog -n 5 --      #log from HEAD to HEAD~4
```

To get the current commit while watching Gedit - y, then ^g

## Equivalents

```
cmd-line           fugitive            Comments
git anything       :Git anything       Execute any random git command

:Git add %         :Gwrite             Stage the current file to the index
:Git checkout %    :Gread              Revert current file to last checked in version
:Git rm %          :Gremove            Delete the current file and the corresponding Vim buffer
:Git mv %          :Gmove              Rename the current file and the corresponding Vim buffer

:Git commit        :Gcommit
:Git status        :Gst
```


# Git-notes

There are 3 object types

1. blob   - File-contents
2. tree   - dir-listing, that bundles blobs together
3. commit - that points to a tree, with a meta-data like comments, author and a pointer to the previous commit(s)!.

A branch is simply a pointer to a commit. HEAD is a pointer to the current branch!

## Know type of a sha

git cat-file -t <sha>

## Get new clone

```sh
git-ws --branch v160.main asr5k/master.git master

git submodule
git submodule status | grep '^ '

rolldown:

git forest pull
```

# Uncategorized

## delete commits from remote

```
#This will force remote to sync up with us.
#Assuming all refspecs are set i.e tracking branch is set
git push remote_name -f

# This will do it wherever u are w/o any tracking branch set.
git push remote_name +COMMIT_ID:branch
```



## which commit has a certain version of file

```
which_commit_has_this_blob.pl <blob-sha>
```

## getting rid of a submodule

```
git submodule deinit packages/<..>
```


## doing a csettool:

```
commit=<whatever>
parent=$(git show --quiet --pretty=format:"%P" $commit)
git meld $parent $commit
```

## Getting older revisions of files:

* Get the revision of a submodule of a particular revision of a super module

```
git ls-tree buildnumber_50269 packages/common
cd packages/common
git show <commit>:<file>
```

## getting the commit id of a submodule for a given commit of super-module

```
git ls-tree -r <master-commit> | grep 'packages/<package>'
git ls-tree -r HEAD | grep 'packages/<package>'
```

## is a commit in a build-number

```
git merge-base --is-ancestor <commit> buildnumber_<build>
```

## During merging / merge

```
# list conflict files
git diff --name-only --diff-filter=U

# to keep local or remote files
git checkout --theirs /path/to/file
git checkout --ours /path/to/file

git ls-files -u
  1: common
  2: ours
  3: theirs
```

## Better merge strategy

```
git merge|rebase|cherry-pick  --strategy=recursive --strategy-option=patience
```

## record merge but retain our file

```sh
git checkout master
# merge from release branch, but dont get any changes
git merge -s ours release -m "merge from release but discard any commits on the release branch by using the merge strategy 'ours'"

```


## To amend dates for a bulk of commits

```
git rebase -i
#choose edit in the EDITOR
#and do this when you are prompted in each stage

git commit --amend --date="Wed Feb 16 14:00 2011 +0100"
git rebase --continue

#rebase w/o a tracking branch or if u have pushed
git rebase -i parent_of_commit_to_rebase master
```

## Reflog

```
#track how HEAD moved
git reflog --date=relative
```

## Bisect

```
git bisect start <bad> <good> --
git bisect run /script

git bisect start HEAD TiMOS-MG_0_0_I1630 --

git bisect reset
```

## worktree

```
git worktree add <path> [<branch>]    # add path and checkout branch into it.
```

```
$ git worktree add -b emergency-fix ../temp master
$ pushd ../temp
# ... hack hack hack ...
$ git commit -a -m ´emergency fix for boss´
$ popd
$ rm -rf ../temp
$ git worktree prune
```

```
git worktree list
```

## goto root of repo

```
#gives absolute path
git rev-parse --show-toplevel

#gives relative-path (or) empty if already in root
git rev-parse --show-cdup

#useful bash-alias for bashrc
alias gitroot='cd ./$(git rev-parse --show-cdup)'
```

## panos-flow

```
#to create study only branches off some tag
git worktree add -b 60R4_study   ../../60R4_study/panos TiMOS-MG_6_0_R4

#to create a regular working branch to push
git worktree add -b mg80f ../../mg80f/panos remotes/origin/TiMOS-MG_8_0_future
```


## Avoid typing passwords

```
#WARNING: very very weak. All passwords in clear text 

#locally update your repo's config.
git config credentials.helper store

#your password will bein ~/.git-credentials in clear text.
```

* you can also use .netrc , that is common for git and curl

```sh
machine github.com
login technoweenie
password SECRET

machine api.github.com
login technoweenie
password SECRET
```


# gitlab urls

```
# compare URL, where ref_source and ref_target can be commit SHA, tag, or branch
https://${gitlab_host}/${repo_path}/-/compare/${ref_target}...${ref_source}

# tag example 1, comparing tag v1.5.1 to master
https://${gitlab_host}/${repo_path}/-/compare/v1.5.1...master

# tag example 2, comparing tag v1.5.1 to tag v1.5.2
https://${gitlab_host}/${repo_path}/-/compare/v1.5.1...v1.5.2

# commit example 1, comparing commit SHA to master
https://${gitlab_host}/${repo_path}/-/compare/f6098082f...master

# commit example 2, comparing commit SHA to another commit SHA
https://${gitlab_host}/${repo_path}/-/compare/f6098082f...2b8daf28
```


# Old commands equivalent

```
bk -r diffs -u -p            git diff -u -p
bk sfiles -Ug                git ls-tree -r HEAD --name-only
bk sfiles -cg                git ls-files --modified
bk sfiles -gp                git ls-files --cached
bk unedit <file>             git checkout -- <file>                       .. careful!
bk unedit $(bk sfiles -cg)   git checkout -- $(git ls-files --modified)   .. careful!
bk delta -Y $(..)            git add $(git ls-files --modified)
bk sfiles -x                 ??
bk changes                   git log
bk changes -L                git log  origin/v160.main..HEAD
bk changes -R                git fetch ; git log ..origin/v160.main
                             git fetch ; git log ..$(git branch -vv | grep '^*' | awk -F\' '{print $2}')
bk cset -r                   git diff-tree --no-commit-id --name-only -r <commit-id>
model                        git submodule status | grep -v '^-'
                             git submodule status | grep -v '^-' | awk ' {print $2 }' | awk -F\/ '{print $2}'| grep -v buildtools
bk undo -r<>                 git reset --hard HEAD~1
bk cset -x                   ??
bk export -tpatch            git show --pretty=format: <commit> | tail -n +2
bk changes -u<user>          git log --author=<user>
bk changes -/text/           git log --grep=<text>
```

## Create a new branch

```
git checkout -b branch_name
git checkout -b newbranch some_tag

Switch to a branch

git checkout test

Create a new branch that tracks a branch

git branch -t name remotes/origin/name
git checkout name

## create a branch w/o commits
git checkout --orphan new_branch_name
```

# Info model

files,
a working tree,
an index,
a local repository,
a remote repository,
remotes (pointers to remote repositories),
commits,
treeishes (pointers to commits),
branches,
a stash

refs
tags
the reflog
fast-forward commits
detached head state
remote branches
tracking
namespaces


# cvs commands

```
#set a CVSROOT
cvs -d '<...>' co repoName

#get root
cat CVS/Root

#update a repo
cvs update -Pqd
```

# svn commands

Reference: http://svnbook.red-bean.com/en/1.7/index.html

## Concepts

### Revisions

```
HEAD     -> the top one in the repo(remote/origin)
BASE     -> the one in my working-dir, before my changes
COMMITED -> the actual revision starting from BASE(inclusive) in which the file changed.
PREV     -> COMMITED-1.
```

branches are represented as sub-folders in repos/your_repo_name/branches/branch_name
master is under                            repos/your_repo_name/trunk/

svn-status symbols

M modified
X untracked
~ file-type has changed (very likely a file became a link etc..)

## Commands

```
#see what's changed - just filenames
svn status

#list all files that are revision controlled
svn ls --recursive

#see what's locally changed - patches
svn diff

#log a file
svn log filename

# add a new file. Directory is implicitly addede when you add a file.
svn add path/to/filename
## undo a add
svn revert path/to/filename

# remove/delete/del/rm a file
svn delete path/to/file
svn delete path/to/entire/folder
## undo the delete
svn revert path/to/deleted/file_or_folder

#get a particular version of file .. equivalent of git show
svn cat -r 3 http://svn.red-bean.com/repos/test/readme.txt

#reset to a particular revision
svn update -r <earlier_revision_number>

#revert any modifications (or merge) - WARN changes are LOST
svn revert -R .

#unedit checkout revert just one file
svn revert path/to/file

#dump file names of a commit
svn log --verbose -r <commit>
svn diff --summarize -r<rev>:<rev-1>

#log commits on one author/user
user=
svn log | sed  -n "/${user}/,/-----$/ p"

#log all comments between 2 points
svn log --verbose -r29720:29733

#export
#dump actual contents of a commit with diffs
svn diff -r<rev-1>:<rev>

#check what files have changed in remote w/o updating
svn status -u

#commit
svn commit -m "ASN-XXXX: commit message"

#merge
cd target_repository
svn merge -c <commit-no> /path/to/src/branch/repository

#properties
svn proplist -v

#list branches
svn ls http://url/to/repo/root/branches --verbose

#find where a branch was created
svn log --verbose --stop-on-copy $REPOSITORY/branches/feature
The last line of will say something like this:
		Changed paths:
		   A /branches/feature (from /trunk:1234)
link: https://stackoverflow.com/a/6258369

#find which branch a commit was put into
# link : https://stackoverflow.com/a/18446482/2587153
svn log -v -q <repo-root> -r NNN -l 1
svn log -v -q $(svn info | grep 'Repository Root' | cut -d: -f2-) -r NNN -l 1
svn log -v -q http://depot/repo/asn -r 27824 -l 1


#conflict
* pospostone during update
* conflict files are marked with C.
* Work on it.
* svn resolve --accept=working

conflict resolved tree
svn resolve --accept working -R path/to/deleted/conflict/folder

# link on svn-concept
http://svnbook.red-bean.com/en/1.7/svn.advanced.externals.html
http://wordaligned.org/articles/a-subversion-pre-commit-hook
```


## git-svn

```
export CPPFLAGS="-I$HOME/local/include -I$HOME/local/lib/libffi-3.0.13rc1/include -I$HOME/install/ra_serf/include/serf-1"
export LD_FLAGS="-L$HOME/local/include -L$HOME/local/include/ncurses -L$HOME/local/lib -L$HOME/local/lib64 -L$HOME/install/ra_serf/lib"
export LDFLAGS="-L$HOME/local/include -L$HOME/local/include/ncurses -L$HOME/local/lib -L$HOME/local/lib64 -L$HOME/install/ra_serf/lib"
export LD_LIBRARY_PATH="$HOME/local/lib64:$HOME/local/lib:$HOME/install/ra_serf/lib"

git svn clone --stdlayout --authors-file=./authors.txt "http://depot/repo/asn" git_asn
git checkout -b R_1_8_0-svn origin/R_1_8_0
git checkout -b R_1_6_5-svn origin/R_1_6_5

git checkout R_1_8_0-svn && git svn rebase
git checkout R_1_6_5-svn && git svn rebase

#Do a git update before you start

#on a new branch
branch=R_1_8_2
git_wt_dir_name=182_first_git

#these are standard - no need to edit.
git_root=/home/lakshman_narayanan/ws/git-dir-for-svn
git_work_tree_dir=/home/lakshman_narayanan/ws/git-clones
wt_asn=${git_work_tree_dir}/git_asn_worktree_main
wt_import=${git_work_tree_dir}/git_import_worktree_main

svn_added_name=${branch}-svn
cd ${git_root}/git_asn
git checkout -b ${svn_added_name} origin/${branch}
cd ${git_root}/git_import
git checkout -b ${svn_added_name} origin/${branch}

cd ${wt_asn}
git fetch
git worktree add -b $svn_added_name ../${git_wt_dir_name}/${branch} remotes/origin/${svn_added_name}

cd ${wt_import}
git fetch
git worktree add -b $svn_added_name ../${git_wt_dir_name}/${branch}/import remotes/origin/${svn_added_name}

cd ${git_work_tree_dir}/${git_wt_dir_name}
echo ${branch} > .branch_name
echo "${branch} worktree" > .comments
cp ~/gitlab/aryaka-new-clone/gitignore_for_git_wt $(cat .branch_name)/.gitignore

export SVNGITROOT=$(pwd)
~/gitlab/aryaka-new-clone/prepare_git_clone_files.sh
build_cscope.sh

#update aryaka-new-clone/shiftclone.py of the dir-names both normal and git.
#update aryaka-new-clone/update_git_root_clones.sh of the new branch
#update /home/lakshman_narayanan/bitbucket/aryaka-notes/commands_to_refer.md
```


## adding a new author:

Just add to /home/lakshman_narayanan/ws/git-dir-for-svn/authors.txt
and return update_git_root_clones.sh
