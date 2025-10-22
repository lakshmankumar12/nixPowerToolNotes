# Concepts

https://docs.docker.com/get-started/
https://github.com/wsargent/docker-cheat-sheet

* Images               : (like program files) - Files with information
* Container            : (like process) - One running instance of a image. After a container is done, its goes to stopped state.
* Dockerfile           : Prepares a image
* Local-Image-Registry : Machine local repository of image.

# Docker commands

## Docker overall

```
#info
docker version
docker info

#where is docker saving all the files
docker info | grep -i root
sudo du -sh /var/lib/docker
```

## Image Management

```sh
#list images
docker images
docker images -a

#remove images
docker rmi <image-id>

#cleanup old images
docker image prune

## explicitly remove the <none> images
docker image rm $(docker image ls | awk '/<none>/ {print $3}')

## tag a image
docker image existing_tag new_tag

#another command to reclaim space
docker system prune -a -f

# to see which images are dependendant on a given image
#   https://gist.github.com/altaurog/21ea7afe578a523e3dfe8d8a746f1e7d
python3 docker_descendants.py <image_id>

```

### save and load

```sh
#save an image locally into a file
docker save existing_image_name | gzip > saved_image.tgz
#or
docker save -o outputfile.tar.gz existing_image_name

#load save images
gunzip < saved_image.tgz | docker load
#or
docker load -i saved_file.tar.gz
```



## Container Management

```sh
#list containers
docker ps

#list just id
docker ps -q

#login to your docker-account from command-shell
docker login
docker login http://myregistry.com

#copy files into a container
docker cp /path/to/file/on/host/file container_name:/path/in/container/

#get a new shell to some running container
#get container name using docker ps -a
#this will die if the original container exits
docker exec -i -t <container-name> /bin/bash

#attach to a container (you shoul rather exec as quitting that bash wont stop the container)
#  heopfully the container is running a shell of sort
docker attach container_name
## Note the special key-sequence - ctrl-p,ctrl-q will detach you out of the container

# stop a container
#  .. will send a SIGKILL (or any signal passed as arg) to the main process in the container
docker kill container_name

#cleanup a stopped
docker rm <container-id>

#cleanup all existed containers
docker rm $(docker ps -q -f status=exited)

#find the mapped ports
docker port container_name

#Get the pid of the first process in a docker from the host
pid = "$(docker inspect -f '{{.State.Pid}}' "container_name | Uuid")"

#Get all volumes
docker inspect -f '{{ .Mounts }}' containerid

```

### running a image

search: docker run args

```
#syntax
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

#simplest -- just run a image, with the program mentioned as part of image
docker run hello-world

#-p host-port:cont-port -> map port 4000 of local machine to 80 of container
#-p cont-port           -> will random map the container-port to a random host port
#-p host-port:cont-port/udp  -> map udp port 4000 of local machine to 80 of container
#-P                     -> (no-arg) auto-map random ports of host to all exposed container ports
#                       -> use docker port <cont-name> to find the port assigned by host
#                       -> port/prot.. eg:  -p 8080/tcp
#-d                     -> run in detached mode (like daemon)
#--detach               -> opposite of -i -t  .. run as daemon ( but not sure, i see -itd as args )
#-e NAME=VALUE          -> set env NAME and give VALUE
#                       -> mere -e NAME , will get current value from environment.
#                       -> useful if you dont want to expose the value in commandline
#--env-file ./env-list  -> file with NAME=VALUE pairs. Useful if you have lots or dont want env on command line
#-u userid              -> start as that userid
#-v host-folder:cont-folder[:ro]    -> mount host-folder at cont-folder
#-t                     -> Give a tty
#-i                     -> Interactive mode
#-w <dir>               -> set working directory in the container to this dir.
#--name <name>          -> start with this name (instead of the auto-assigned crazy,but,cool name)
#--cap-add=NET_ADMIN    -> if you want to add dummy ifcs (other other networking admin stuff) in the cont
#--privileged           -> Works as well for above.
#--device /dev/host/device:/dev/cont/device
#--entrypoint=/bin/bash -> Override the image's entrypoint. (make sure to give all args before image name)

docker run -d -p 4000:80 friendlyhello


#Other run args:
--rm               => remove the container on exit (Very useful)
--restart=always   => restart the container if it dies.
--privileged       => run with unrestricted powers
--pid=host         => run in the process namespace of host (you can send signals to other processes)
--memory <max-memory>
--cpu-shares <relative-to-other-container>
--cpu-quota  <to-limit-in-general>
--net <nwname>    =>  connect to the network. --net none doesn't attach any interface to the container.

#committing a container
docker commit NameOrIdOfContainer NewImageName

# my standard run args
name=my_cont_name
docker run -it --name $my_cont_name
```


### Image/Container states

```
Image --run-command-> Running Container --> Stopped Container -- commit-commnd --> New Image
```

### Docker logs

```
docker logs <container-name>
```

* The information that is logged and the format of the log
  depends almost entirely on the container’s endpoint command.
* Basically you get to see /dev/stdout and /dev/stderr of the
  container.
* If you have a daemon like program that is your container's
  command, you can employ tricks to redirect log files of that
  daemon to stdout/stderr
* For eg, nginx image sets the `/var/log/nginx/access.log` as a
  softlink to `/dev/stdout`

### inspect

```
# dump all
docker inspect  container_name

# get pid of main process of a container
docker inspect --format '{{.State.Pid}}' container_name
```

# Repository mgmt

```
#push a image to repo
#if :version is omitted, it is tagged as :latest and existing :latest is lost.
docker tag local_image_name lakshmankumar/repo_name:tag_to_this_version_of_image

docker tag <existing-img:version> <new>


docker push lakshmankumar/repo_name:tag

#Tag composition
registry.example.com:port/organization_name/image_name:version-tag

```

# DockerFile

```
#build from a Dockerfile
# -t  is the name of the image
# The . is the context for the build ( it will copy contents of the dir into its build-context, and you
# can refer files from here in the building continer)
docker build -t friendlyhello .

# use PWD as build-context but find dockerfile elsewhere. use the -f option
docker build . -f someother/path/Dockerfile

## other args
--no-cache  .. force build from scratch w/o using earling intermediate images.

```

* Note that each line creates a new image.
* So, you dont want a huge Dockerfile as there will be lots of intermediate images!
* Are not shell scripts. Processes running on one line will not be running on next line
* ENV commands take up one line(and hence one image)

## File syntax

```dockerfile
# typically the first line in your dockerfile
# the last from will be the one that that image is based on.
#    With the help of COPY --from=... (multi-staged builds)
#    you can have many FROM. See
#    https://docs.docker.com/develop/develop-images/multistage-build/
FROM some_base_image:version

#your name or whoever maintains and the email"
MAINTAINER firstname lastname <firstname.lastname@xyz.com>
LABEL "comments on this dockerfile"

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
# Do this if you prepare ur image from a particular folder
ADD . /app
# uncompresses the tarball to the image.
ADD project.tar.gz /install/
# download from url
ADD http://someurl.com/path/to/file.rpm /target_dir

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# expose the volumes inside container
VOLUME /path/inside/container1 /path/inside/container2

# copy a file from host into the container
COPY rel-or-abs/path/in/host /abs/path/inside/container

# Define environment variable
# Available both further for next commands and also in the container as well.
ENV NAME World

# Run app.py when the container launches
# Shell form - just type
CMD python app.py
# exec form - replaces the main shell
CMD ["python", "app.py"]

# entry points serve as the launch program. So whetever u give when starting the container
# are passed as args to this command

# change to user
USER authur
USER 1000
```

## multistage builds

* Before this you had separate dev-docker image and prod-docker image
* dev-docker image had all build tools in it, while prod-image has only runtime deps

* Multistage quick demo
```dockerfile
## First half .. developer prone
# syntax=docker/dockerfile:1
# you can name with the AS syntax
FROM golang:1.16 AS builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html
COPY app.go ./
RUN CGO_ENABLED=0 go build -a -installsuffix cgo -o app .

## final production image. It just picks the binary from above
## with the COPY --from=0 or --from=builder
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=0 /go/src/github.com/alexellis/href-counter/app ./
CMD ["./app"]

```

* Stop at a stage:
```sh
docker build --target builder -t alexellis2/href-counter:latest .
```
* You can even copy from totally different images not involved in earlier building!
```sh
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```


# Networking

* special name for host - `host.docker.internal`
    * works in windows and mac
    * it will typically be 172.17.0.1 for linux
    * in linux you can do this when you start docker:
        * `--add-host host.docker.internal:host-gateway`
        * this will setup `/etc/hosts` appropriately. eg:
            * `172.17.0.1      host.docker.internal`

* There are 3 networks - bridge / host / none. By default, all containers run in the bridge network

    ```sh
    docker network ls
    docker network inspect bridge

    #create an new bridge
    docker network create networkNameX --driver=bridge --subnet=192.168.100.0/24
    ## add the --internal arg to create an isolated bridge
    docker network create networkNameX --driver=bridge --subnet=192.168.100.0/24 --internal
    ##
    ## more args
    ## --gateway 192.168.100.100    ## use a diff ip other than .1 for the brige itself.

    #connect a container to a bridge
    docker network connect networkNameX container_name
    # or use this when starting a container
    docker run --rm -ti ubuntu --net networkNameX

    #to know about a network
    docker network inspect networkNameX

    #delete
    docker network rm networkNameX
    ```
* reading more on networking in docker
    https://success.docker.com/article/Multiple_Docker_Networks
    https://docs.docker.com/engine/reference/commandline/network_create/#bridge-driver-options

# Volumes

* Virtual discs to store and share data
* 2 types
    * Permanent - present even after all containers are stpped
    * Ephemeral - goes when when the last container using it is gone
* Not part of images
* Between host and container
    ```
    # arg to run
    -v host-folder:cont-folder[:ro]    -> mount host-folder at cont-folder

    # Note if the host-path exists and is a file, it will be shared as a flie.
    # If the host-path does't exist , it will be assumbed to be a dir.
    ```
* Ephemeral
    ```
    # this -v arg with only_path, creates a ephemeral volume
    docker run -v only_path image_name --name cont_name

    # another container can now use this using --volumes-from
    docker run --volumes-from orig_container_name --name this_container
    ```

Old notes:
* Created using docker create or implicitly by docker run
* A volume is a directly in a container/image that bypasses UFS
  * volumes are initialized when (runtime)containers are created. If the baseimage
      has data at that location, then that data is copied into the newly initalized
      volume. (This doesnt apply to host-mounted dir/file)
  * Data volumes can be shared and reused among containers.
  * Changes to a data volume are made directly.
  * Changes to a data volume will not be included when you update an image.
  * Data volumes persist even if the container itself is deleted.
* Data volumes have persist lifetime, and not related to container lifetime

(I dont understand this fully - for now -v host-dir:container-dir is good enuf)

# nw_demo_image

search: simple_routerish nw_demo_image

https://hub.docker.com/r/phusion/baseimage/

```sh

base_image=phusion/baseimage
# if the above doesnt work.. goto github and get latest version
base_image=phusion/baseimage:jammy-1.0.1
docker pull ${base_image}

docker run --privileged -t -i ${base_image} /sbin/my_init -- bash -l

mkdir -p /etc/apt/keyrings
curl -fsSL https://swupdate.openvpn.net/repos/repo-public.gpg | gpg --dearmor > /etc/apt/keyrings/openvpn-repo-public.gpg
arch=amd64
version=release/2.6
DISTRO=$(lsb_release -c | awk '{print $2}')
echo "deb [arch=$arch signed-by=/etc/apt/keyrings/openvpn-repo-public.gpg] http://build.openvpn.net/debian/openvpn/$version $DISTRO main" > /etc/apt/sources.list.d/openvpn-aptrepo.list
apt update
apt install -y iproute2 iputils-ping  iptables  net-tools  \
        bridge-utils  conntrack  ethtool  tcpdump  \
        strongswan strongswan-swanctl iperf3 lsof wget curl \
        wireshark tshark ipcalc jq openvpn isc-dhcp-server dnsmasq \
        netcat openconnect traceroute dnsutils isc-dhcp-client \
        python3-pip netperf

pip3 install twisted

exit

docker ps -a
containerid=...
docker commit $containerid nw_demo_image
docker tag nw_demo_image lakshmankumar/simple-routerish-docker:latest
docker push lakshmankumar/simple-routerish-docker
docker tag nw_demo_image my_routerish_container
docker image prune

#and to use this in other machines
docker pull lakshmankumar/simple-routerish-docker

#to fire the docker
docker run -it --name machineA nw_demo_image

```

## fire nw_demo_image on a host

```sh
contname=TestContainer
contnet=default
datadir=$HOME
docker run --privileged -v $datadir:/data --rm --name $contname --hostname $contname --net $contnet -t -i nw_demo_image /sbin/my_init -- bash -l
#detached
docker run --privileged -v $datadir:/data --rm --name $contname --hostname $contname --net $contnet -d nw_demo_image /sbin/my_init
```

## enable ssh on the host

```sh
## create this file in a folder
cat <<EOF > $datadir/initd/enable_ssh.sh
#!/bin/sh
rm -f /etc/service/sshd/down
ssh-keygen -A
#ssh-keygen -P "" -t dsa -f /etc/ssh/ssh_host_dsa_key
cat /data/id_rsa.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
EOF

## create a pub/private pair on the $datadir/data/id_rsa{,.pub}
ssh-keygen -t rsa -N "" -C "test-keys" -f $datadir/id_rsa

## and mount this in the container
cat <<EOF > $datadir/fire.sh
#!/bin/bash
initd_for_cont=$datadir/initd
docker run --privileged -v $datadir:/data -v $initd_for_cont:/etc/my_init.d -p 8822:22 --rm --name VpnClient --hostname VpnClient  --detach nw_demo_image /sbin/my_init
EOF

#you can now login to the container with:
ssh -p 8822 root@localhost


## to enable ssh on a running host:
## Note, you should have exposed port at start. Otherwise touch luck
rm -f /etc/service/sshd/down
cat /data/id_rsa.pub >> /root/.ssh/authorized_keys
ssh-keygen -A
echo x > /etc/service/sshd/supervise/control

```




# Compose

* Single machine co-ordination
* designed for testing and development
* brings up all containers, networks, volumes with one command

```
#start for frist time
# -d does the containers in detached mode.
docker-compose up -d

#build any dockerfiles
docker-compose build

#stop
docker-compose stop

#restart
docker-compose restart

#down
docker-compose down

#list
docker-compose ps
```

## Compose file

* docker-compose.yml (default)
* docker-compose.override.yml (default)
* Typically compose creates a private network named after the container parent folder
    * Use the -p argument to override this name choice.
    * Note this -p is a arg to the docker-compose command itself (and not just the up or other commands)

```
version: '3'
services:
    jenkins:                                            <-- Will the dns-name of the container that runs whereby you can reach from other containers.
        container_name: jenkins                         <-- Container name
        image: jenkins/jenkins                          <-- Image for the container (if you are building, this will be the target name used)
        build:                                          <-- If you are building your own, use this
            context: centos7                            <-- Directory relative to this yml file as to where the Dockerfile is present
        ports:
            - "8080:8080"
            - "50000:50000"
        volumes:
            - "$PWD/jenkins_home:/var/jenkins_home"
        networks:
            - net
        environment:
            - "MYSQL_ROOT_PASSWORD=1234"                <-- Note quoted.
        depends_on:                                     <-- will start the db container first
            - db
    db:
        image: couchbase:latest
        ports:
            - 8091:8091
        extends:
            file: an_include_file.yml
            service: config                             <-- take contents of the service and apply to this service
networks:
    net:
```

## Orchestration

* Start containers -- and restart if they fail
* service discovery -- allow them to find each other
* resource allocation -- match containers to computers

