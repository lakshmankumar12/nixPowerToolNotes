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

# Modules

* Ansible basic modules in

```
# list all modules
ansible-galaxy collection list

```

