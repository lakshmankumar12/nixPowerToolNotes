# Ansible notes

* Control-node
    * where ansible is running
    * uses clientless ssh to access remote systems
        * its agentless, so besides requiring ssh in remote systems, nothing else is required.
    * playbooks written in YAML, ansible its is in python
* Ansible Tower
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

or as yml itself

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

# ad-hoc commands


```sh
ansible -i hosts all -m ping

ansible -i hosts all -m copy -a "src=/root/test_ansible/testfile dest=/tmp/testfile"

ansible -i hosts all -m yum -a 'name=ncdu state=present'

```

## command line args for ansible

* ansible-playbook
```sh

## run a playbook
ansible-playbook -i $inventory_file $playbook_file

## --ask-become-pass   ... interactively ask password for become

```


# playbook


```yaml
- hosts: group1                               ## which hosts to work on
  tasks:
  - name: Install lldpad package
    yum:                                      ## module name
      name: lldpad
      state: latest
  - name: check lldpad service status
    service:
      name: lldpad
      state: started

```

Another example

```yaml
- hosts: group1
  tasks:
  - name: Enable SELinux
    selinux:                                    ## selinux module
      state: enabled
    when: ansible_os_family == 'Debian'         ## ansible_os_family is a ansible 'fact' collected via
                                                ##        'gather_facts' functionality that is always run by ansible
                                                ## when controls if this task should be run or not.
    register: enable_selinux                    ## the task output is stored in the varialbe enable_selinux for later use.

  - debug:
      Imsg: "Selinux Enabled. Please restart the server to apply changes."
    when: enable_selinux.changed == true

```

run a handlers once

```yaml
- hosts: group2
  tasks:
  - name: sshd config file modify port
    lineinfile:
     path: /etc/ssh/sshd_config
     regexp: 'Port 28675'
     line: '#Port 22'
    notify:
       - restart sshd                           ## notify handler to be run later

handlers
    - name: restart sshd                        ## run only if it was notifed. run once at the end of all tasks
      service: sshd
        name: sshd
        state: restarted

```

# roles

```sh
## dir structure
[root@ansible-server test2]# tree
`-- role1
    |-- defaults
    |   `-- main.yml
    |-- handlers
    |   `-- main.yml
    |-- meta                                    ## store author and role dependencies
    |   `-- main.yml
    |-- README.md
    |-- tasks
    |   `-- main.yml
    |-- tests
    |   |-- inventory
    |   `-- test.yml
    `-- vars
        `-- main.yml


## create the above tree structure
$ ansible-galaxy init role

```

# documentation

https://docs.ansible.com/ansible/latest/collections/ansible/builtin/copy_module.html

# Useful modules

## lineinfile

Link: https://www.middlewareinventory.com/blog/ansible-lineinfile-examples/
    

