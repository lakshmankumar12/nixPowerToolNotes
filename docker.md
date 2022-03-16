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

```
#list images
docker images
docker images -a

#remove images
docker rmi <image-id>

#cleanup old images
docker image prune

```

## Container Management

```
#list containers
docker ps

#list just id
docker ps -q

#login to your docker-account from command-shell
docker login

#copy files into a container
docker cp /path/to/file/on/host/file container_name:/path/in/container/

#get a shell to some running container
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

```

### Running a image

```
#syntax
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

#simplest -- just run a image, with the program mentioned as part of image
docker run hello-world

#-p host-port:cont-port  -> map port 4000 of local machine to 80 of container
#-p cont-port            -> will random map the container-port to a random host port
#-P                      -> (no-arg) auto-map random ports of host to all exposed container ports
#                        -> use docker port <cont-name> to find the port assigned by host
#                        -> port/prot.. eg:  -p 8080/tcp
#-d run in detached mode
#-e NAME=VALUE  -> set env NAME and give VALUE
#-u userid      -> start as that userid
#-v host-folder:cont-folder[:ro]    -> mount host-folder at cont-folder
#-t             -> Give a tty
#-i use this image
#--name <name>    -> start with this name (instead of the auto-assigned crazy,but,cool name)
docker run -d -p 4000:80 friendlyhello


#Other run args:
--rm               => remove the container on exit (Very useful)
--privileged       => run with unrestricted powers
--pid=host         => run in the process namespace of host (you can send signals to other processes)
--memory <max-memory>
--cpu-shares <relative-to-other-container>
--cpu-quota  <to-limit-in-general>
```

* Image/Container states

```
Image --run-command-> Running Container --> Stopped Container -- commit-commnd --> New Image
```

### Docker logs

```
docker logs <container-name>

```

### inspect

```
# get pid of main process of a container
docker inspect --format '{{.State.Pid}}' container_name
```


# Repository mgmt

```
#push a image to repo
#if :tag is omitted, it tagged as :latest and existing :latest is lost.
docker tag local_image_name lakshmankumar/repo_name:tag_to_this_version_of_image

docker push lakshmankumar/repo_name:tag

#Tag composition
registry.example.com:port/organization_name/image_name:version-tag

```

# DockerFile

```
#build from a Dockerfile
# -t  is the name of the image
# The . is the path where dockerfile is present.
docker build -t friendlyhello .
```

* Note that each line creates a new image.
* So, you dont want a huge Dockerfile as there will be lots of intermediate images!
* Are not shell scripts. Processes running on one line will not be running on next line
* ENV commands take up one line(and hence one image)

## File syntax

```
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

# Networking

* special name for host - `host.docker.internal`
    * works in windows and mac
    * it will typically be 172.17.0.1 for linux

* There are 3 networks - bridge / host / none. By default, all containers run in the bridge network

    ```
    docker network ls
    docker network inspect bridge

    #create an isoated bridge
    docker network create networkNameX --driver=bridge --subnet=192.168.100.0/24

    #connect a container to a bridge
    docker network connect networkNameX container_name
    # or use this when starting a container
    docker run --rm -ti ubuntu --net networkNameX

    #to know about a network
    docker network inspect networkNameX

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

    # Not if the host-path exists and is a file, it will be shared as a flie.
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


# Compose

```
#start for frist time
docker-compose up -d

#build any dockerfiles
docker-compose build

#stop
docker-compose stop

#restart
docker-compose restart

#down
docker-compose down
```

## Compose file

```
version: '3'
services:
    jenkins:                                          <-- Will the dns-name of the container that runs whereby you can reach from other containers.
        container_name: jenkins                       <-- Container name
        image: jenkins/jenkins                        <-- Image for the container (if you are building, this will be the target name used)
        build:                                        <-- If you are building your own, use this
            context: centos7                          <-- Directory relative to this yml file as to where the Dockerfile is present
        ports:
            - "8080:8080"
            - "50000:50000"
        volumes:
            - "$PWD/jenkins_home:/var/jenkins_home"
        networks:
            - net
        environment:
            - "MYSQL_ROOT_PASSWORD=1234"              <-- Note quoted.
networks:
    net:
```

# Centos 7 Installation

Office location has a pristine Centos-7.4 installation.

Steps for getting docker installed

```
yum install policycoreutils-python
http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.28-1.git85ce147.el7.noarch.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/skopeo-containers-0.1.24-1.dev.git28d4e08.el7.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-storage-setup-0.7.0-1.git4ca59c5.el7.noarch.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/oci-systemd-hook-0.1.14-1.git1ba44c6.el7.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/oci-umount-2.0.0-1.git299e781.el7.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/oci-register-machine-0-3.13.gitcd1e331.el7.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/container-selinux-2.28-1.git85ce147.el7.noarch.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/docker-common-1.12.6-61.git85d7426.el7.centos.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/docker-client-1.12.6-61.git85d7426.el7.centos.x86_64.rpm
http://mirror.centos.org/centos/7/extras/x86_64/Packages/docker-1.12.6-61.git85d7426.el7.centos.x86_64.rpm

systemctl enable docker
systemctl start docker
```

# Mac host from docker containers:

docker.for.mac.localhost

* get into the sheel of the docker-for-mac's linux host:

```
screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
```
