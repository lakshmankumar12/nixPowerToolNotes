# Ansible notes

* Control-node
    * where ansible is running
    * uses clientless ssh to access remote systems
        * its agentless, so besides requiring ssh in remote systems, nothing else is required.
        * for windows it uses a winrm module.
    * playbooks written in YAML, ansible its is in python
    * for now control-node should be linux
* Managed node
    * the ones where the tasks are run
* Ansible Tower
    * paid version
    * manages ansible itself with a UI server
* galaxy.ansible.com
    * has lots of roles that have been uploaded

* role
    * downloadable component that you install in your ansible system
    * contains all ingredients that would be needed to do some orchestration
    * distribution unit in ansible

## Post installing

```
# Learn about the ansible environment.
$ ansible --version
ansible [core 2.12.3]
  config file = None
  configured module search path = ['/home/lakshman/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/lakshman/.local/lib/python3.8/site-packages/ansible
  ansible collection location = /home/lakshman/.ansible/collections:/usr/share/ansible/collections
  executable location = /home/lakshman/.local/bin/ansible
  python version = 3.8.10 (default, Nov 26 2021, 20:14:08) [GCC 9.3.0]
  jinja version = 3.0.3
  libyaml = True
```

# Inventory file

* Typically at `/etc/ansible/hosts`
* Can be in ini, yaml or json
* See: https://docs.ansible.com/ansible-core/devel/user_guide/intro_inventory.html#intro-inventory
* basically you can group servers hierarchially
* you can give attributes to servers/hosts - like ip(and use a alias name)/username/port

```ini
mail.example.com

[webservers]
foo.example.com
bar.example.com

[dbservers]
one.example.com
two.example.com
three.example.com
```

or as yaml itself

```yaml
agws:
  hosts:
    cnh:
      ansible_host: remoteagw
      ansible_port: 61111
    utaustin:
      ansible_host: remoteagw
      ansible_port: 61112
```


# Modules

* Ansible basic modules in

```
# list all modules
ansible-galaxy collection list

```

# global ansible config

```sh

```


# ad-hoc commands


```sh
## General format
ansible hosts-spec -i inv-file -m module -a module-args

## just list hosts
ansible all -i inv-file --list

## host spec
## all -> all hosts



## other args

# -m <module>         .. run this module
# -a <module-args>    .. args for the module
# -o                  .. one liner output
# -i <inventory-file> .. inventory
# -u <user>           .. login with this user
# --ask-pass          .. ask for password for this user (for ssh)
# --become            .. become a different user post login
# --become-user=user  .. post login, become this user. (default is root)
# --ask-become-pass   .. su/sudo password
# --become-method=su  .. how to become
# --list              .. list hosts


```

## command line args for ansible

* ansible-playbook
```sh

## run a playbook
ansible-playbook -i $inventory_file $playbook_file

## args

## --syntax-check       .. perform syntax-check
## --check, -C          .. smoke-test
##                      ..   will evaluate conditionals

```

# modules

* Some common args for a lot of commands
    ```
    state: started, restarted, present, absent, touch

    ```


## ping

* ping module verifies reachability

```sh
ansible -i hosts all -m ping
```

## copy

https://docs.ansible.com/ansible/latest/collections/ansible/builtin/copy_module.html

* copy modules copiles a file from controller node to managed node

```sh
ansible -i hosts all -m copy -a "src=/root/test_ansible/testfile dest=/tmp/testfile"
```

```yaml
- name: another copy task
  copy:
    content: "Here are some contents for the file"
    dest: /path/in/node
```


## yum

* yum install package in centos nodes, state=present/absent to install/uninstall

```sh
ansible -i hosts all -m yum -a 'name=ncdu state=present'
```

## command

* run any random command

```sh
ansible -i hosts all -m command -a "uptime"
```

## user, group

* create a user

```sh
ansible -i hosts all -m user -a "name=magma uid=9999 shell=/bin/bash comment='mg user'"
```

* create a group

```sh
ansible -i hosts all -m group -a "name=magma gid=9999 state=present"
```

## file

* create a file

```sh
ansible -i hosts all -m file -a "name=magma state=present mode=0777"
ansible -i hosts all -m file -a "name=/tmp/somedir state=directory mode=0777"
ansible -i hosts all -m file -a "name=/tmp/exist_or_new_file state=touch mode=0777"
```

## lineinfile

```sh
- name: Ensure SELinux is set to enforcing mode
  ansible.builtin.lineinfile:
    path: /etc/selinux/config
    regexp: '^SELINUX='
    line: SELINUX=enforcing

- name: Make sure group wheel is not in the sudoers configuration
  ansible.builtin.lineinfile:
    path: /etc/sudoers
    state: absent
    regexp: '^%wheel'

- name: Replace a localhost entry with our own
  ansible.builtin.lineinfile:
    path: /etc/hosts
    regexp: '^127\.0\.0\.1'
    line: 127.0.0.1 localhost
    owner: root
    group: root
    mode: '0644'
```


## service

* start a service

```sh
ansible -i hosts all -m service -a "name=nfs state=started"
```

## debug

```yaml
tasks:
  - name: debug illustration
    debug: msg="This is just a test for debug module"

  - name: catpure first with register
    command: "uptime"
    register: somevariablename

  - name: dump it with debug
    debug: msg="Output of uptime was {{somevariablename}}"

  - name: another way to show
    debug: var=somevariablename
```

## setup

* dump the ansible facts

```sh
ansible -i hosts all -m setup -a "filter=ansible_all_ipv4_addresses"
ansible -i hosts all -m setup -a "filter=ansible_date_time"
ansible -i hosts all -m setup -a "filter=ansible_eth0"
```



# facts

* information gathered by ansible from managed nodes
* `setup` module can show this. This module is automatically run when a playbook is run.
* are in json format.. so `{{<ansible_facts>}}` would work in the playbook.



# playbook

## General Structure

```yaml
---
- name: Name of first play
  hosts: hosts-to-run
  user: remote-user
  become: true
  become_method: sudo
  become_user: privilege_user
  gather_facts: no
  var:
    var1: value
  tasks:
    - name: Name of first task
      module: arg1=value1 arg2={{var1}}

```

## variables
    * can be combined like this:
        ```yaml
        vars:
            onevar: "value/with/spl/chars"
            anothervar: "{{onevar}}somemore"

        tasks:
            ...
            module: arg1="{{homedirprefix}}/{{username}}"
        ```

### variables from inventory

```yaml
[group1]
1.1.1.1
1.1.1.2
[group1:vars]
user=raheja
```

## conditionals

* Added to tasks

```yaml
tasks:
  - name: only for ubuntu machines
    file: path=/var/tmp/something state=touch
    when: ansible_distribution == "Ubuntu" and (ansible_distribution_major_version == "16" or ..)
```

## loops

```yaml
tasks:
  - name: loop illustration
    yum:
      name: "{{item}}"
      state: installed
    with_item:
      - php
      - gcc
      - talk
      - vim
      - httpd

  - name: another one with dict-items
    user:
      name: "{{item.name}}"
      state: present
      groups: "{{item.groups}}"
    with_items:
      - {name: "user1", groups: "appgroup"}
      - {name: "user2", groups: "cloud"}
```

* there are `with_file` , `with_nested`. to learn.

## handler

* `notify` handlers are run when a task has changed something on the managed node
* `handlers` are very similar to task in definition.
    * Their names MUST be unique. that is how its referenced.

```yaml
tasks:
  - name: copy ntp conf
    copy: src=/path/in/controller/node  dst=/etc/ntp.conf
    notify:
      - restart ntp

handlers:
  - name: restart ntp
    service: name=ntp state=restarted
```


## roles

```sh
## create the above tree structure
$ ansible-galaxy init myrole

## dir structure
[root@ansible-server test2]# tree myrole
`-- myrole
    |-- defaults
    |   `-- main.yml
    |-- handlers
    |   `-- main.yml
    |-- meta                                    ## store author and role dependencies
    |   `-- main.yml
    |-- README.md                               ## doc for your role
    |-- tasks
    |   `-- main.yml
    |-- tests
    |   |-- inventory
    |   `-- test.yml
    |-- vars
    |   `-- main.yml
    |-- files
    `-- templates
```

* sample `meta/main.yml` files
```yaml
galaxy_info:
  author: whoever
  description: what ist his role
  company: mycompany
  license: GPLv2
  min_ansible_version: 1.2
  platforms:
    - name: Centos
      versions:
        - 7

dependencies: []

dependencies:                         ## note that its like include for roles
  - {role: "another_role"}
```

* Invoke a role from a playbook
    Just use `roles` instead of `tasks`

```yaml
roles:
  - myrole

roles:
  - role: /home/magma/onyx-corenw/orc8r/tools/ansible/roles/apt_cache
    vars:
      distribution: "stretch"
      oai_build: "{{ c_build }}/core/oai"
      repo: "dev"
```

* include another file from one file

```
- name: include a file
  include: anotherfile.yml

```
