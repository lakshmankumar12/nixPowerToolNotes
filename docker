Concepts
--------

https://docs.docker.com/get-started/
https://github.com/wsargent/docker-cheat-sheet

Images : (like program files) - Files with information
Container: (like process) - One running instance of a image. After a container is done, its goes to stopped state.
Dockerfile: Prepares a image
Local-Image-Registry: Machine local repository of image.

#list images
docker images
docker images -a

#remove images
docker rmi <image-id>

#list containers
docker ps
#list just id
docker ps -q

#info
docker version
docker info

#where is docker saving all the files
docker info | grep -i root
sudo du -sh /var/lib/docker

#login from command-shell
docker login

#build from a Dockerfile
# -t  is the name of the image
docker build -t friendlyhello .

#get a shell to some running container
#get container name using docker ps -a
docker exec -i -t <container-name> /bin/bash

#push a image to repo
#if :tag is omitted, it tagged as :latest and existing :latest is lost.
docker tag local_image_name lakshmankumar/repo_name:tag_to_this_version_of_image

docker push lakshmankumar/repo_name:tag

#kill a container
docker kill container_name

Running a image
~~~~~~~~~~~~~~~~

#syntax
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

#simplest -- just run a image, with the program mentioned as part of image
docker run hello-world

#-p host-port:cont-port  -> map port 4000 of local machine to 80 of container
#-P                      -> (no-arg) auto-map random ports of host to all exposed container ports
#-d run in detached mode
#-e NAME=VALUE  -> set env NAME and give VALUE
#-u userid      -> start as that userid
#-v host-folder:cont-folder[:ro]    -> mount host-folder at cont-folder
#-t             -> Give a tty
#-i use this image
docker run -d -p 4000:80 friendlyhello


#Other run args:
--rm   -> remove the container on exit

#delete a container
docker rm <container-id>

#find the mapped ports
docker port devbox

#elimitate prune
docker image prune

#Get the pid of the first process in a docker from the host
pid = "$(docker inspect -f '{{.State.Pid}}' "container_name | Uuid")"


Networking
~~~~~~~~~~

* There are 3 networks - bridge / host / none. By default, all containers run in the bridge network

docker network ls
docker network inspect bridge

#create an isoated bridge
docker network create networkNameX --driver=bridge --subnet=192.168.100.0/24

#connect a container to a bridge
docker network connect networkNameX container_name

#reading more on networking in docker
https://success.docker.com/article/Multiple_Docker_Networks
https://docs.docker.com/engine/reference/commandline/network_create/#bridge-driver-options

#to know about a network
docker network inspect networkNameX

Volumes
~~~~~~~~

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


Compose
--------

#start for frist time
docker-compose up -d

#stop
docker-compose stop

#restart
docker-compose restart

#down
docker-compose down

Dockerfile
----------

FROM some_base_image:version

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
# Do this if you prepare ur image from a particular folder
ADD . /app

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]





Centos 7 Installation
--------------------

Office location has a pristine Centos-7.4 installation.

Steps for getting docker installed

-----
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
-----

Mac host from docker containers:
docker.for.mac.localhost
