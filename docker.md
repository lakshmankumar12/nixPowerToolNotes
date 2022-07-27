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

#Get all volumes
docker inspect -f '{{ .Mounts }}' containerid

```

### Running a image

```
#syntax
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

#simplest -- just run a image, with the program mentioned as part of image
docker run hello-world

#-p host-port:cont-port -> map port 4000 of local machine to 80 of container
#-p cont-port           -> will random map the container-port to a random host port
#-P                     -> (no-arg) auto-map random ports of host to all exposed container ports
#                       -> use docker port <cont-name> to find the port assigned by host
#                       -> port/prot.. eg:  -p 8080/tcp
#-d                     -> run in detached mode (like daemon)
#-e NAME=VALUE          -> set env NAME and give VALUE
#-u userid              -> start as that userid
#-v host-folder:cont-folder[:ro]    -> mount host-folder at cont-folder
#-t                     -> Give a tty
#-i                     -> Interactive mode
#--name <name>          -> start with this name (instead of the auto-assigned crazy,but,cool name)

docker run -d -p 4000:80 friendlyhello


#Other run args:
--rm               => remove the container on exit (Very useful)
--restart=always   => restart the container if it dies.
--privileged       => run with unrestricted powers
--pid=host         => run in the process namespace of host (you can send signals to other processes)
--memory <max-memory>
--cpu-shares <relative-to-other-container>
--cpu-quota  <to-limit-in-general>

#committing a container
docker commit NameOrIdOfContainer NewImageName
```



* Image/Container states

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
# get pid of main process of a container
docker inspect --format '{{.State.Pid}}' container_name
```

### save and load

```
#save an image locally into a file
docker save -o outputfile.tar.gz existing_image_name

#load save images
docker load -i saved_file.tar.gz
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

# Orchestration

* Start containers -- and restart if they fail
* service discovery -- allow them to find each other
* resource allocation -- match containers to computers

# Kubernetes

Wiki has the info pretty laid out - https://en.wikipedia.org/wiki/Kubernetes

On Kubernetes master

* etcd
* API-server
* Scheduler
* Controller Manager (process)
    * Replication Controller
        * Older. Now use replicaset
    * ReplicaSet
        * Ensures specified number of pods are running at all times
    * Deployments
        * mm.. deployments manages replica-sets which in turn manages pods
        * pause(updates) and resume use-cases.
    * daemonset controller
        * ensures all nodes run a specific pod
    * job controller
        * like cron-job. Run one process to completion
    * Services
        * Allow connectivity between one set of deployments with another
          in a seamless way by anchoring the IP to use.
            ```
                                                +---> Backend Pod 1
                                                |
            FrontEnd Pod ---> Backend Service --+---> Backend Pod 2
                                                |
                                                +---> Backend Pod 3
            ```
        * Can be internal or external.
            * External exposes a node-ip:node-port
            * Load balancer: exposes a application to internet

## Cluster

* Collection of nodes
* one kubectl can handle many clusters (check?)

## nodes

* Can be a physical machine or a VM
* should have a container tooling like docker
* kubelet
    * agent that runs on each node communicating with api-server
    * executes pod-containers via container engine
    * mounts and run pod-volumes and secrets
    * executers health status of pods/volumes and reports back to api-server
* kube-proxy (networking-proxy)
    * reflects services as defined on each node
    * network stream or round-robin forwarding across a set of backend containers
    * 3 modes
        * User-space mode
        * iptables mode
        * ipvs mode
* pods
    * containers within the pods

## Pods

* One single unit of deployment
    * ephemeral, disposable
    * not restarted by scheduler by itself
* All containers inside pod are guaranteed to run in same node
* Each pod has a unique IP address
    * So, apps can use the same port w/o conflict
* Storage resources
* Options that govern how the containers can be run

### Pod States

* Pending - accepted by kubernetes system.
* Running
* Succeeded
* Failed
* CrashLoopBackOff

### PodSpec

* Yaml file that describes a pod

## Deployment / ReplicaSet

* Resource object that defines how pods should be started
* A deployment is a collection of replica-sets
* When you update a image, the current replica-sets are replaced with new ones.


## service

* Logical abstraction for a collection of pods that function exactly alike
* Pods are ephemeral - so service offers a frontend to the pods to other functions
* service spec has a label, which maps it to the backing deployment/pod.

### Service types

* ClusterIP
    * Exposes a service which is only accessible from within the cluster.
* NodePort
    * Exposes a service via a static port on each node’s IP.
* LoadBalancer
    * Exposes the service via the cloud provider’s load balancer.
* ExternalName
    * Maps a service to a predefined externalName field by returning a value for the CNAME record.


## Labels

* Key value pairs
* Eg:
  ```
  "release" : "stable", "release" : "canary"
  ```
* Label selectors
    * Equality
    * Set based - IN, NOTIN, EXISTS

## Namespaces

* All objects are placed in default namespace at start

## Link to instal kubernets/minibox within a vm

https://webme.ie/how-to-run-minikube-on-a-virtualbox-vm/

## kubectl commands

```sh
kubectl cluster-info

kubectl get nodes
kubectl get all

kubectl get deployment/helloworld -o yaml | less

kubectl get pods --show-labels
kubectl label pod/pod_name keyname=value --overwrite
kubectl label pod/pod_name keyname-  # deletes the label keyname
kubectl get pods --selector keyname=value
kubectl get pods -l 'keyname in (value1,value2)'  # notin

kubectl create -f <file.yml>
#other args to create
# --record          => keeps a log of changes.

kubectl expose deployment helloworld --type=NodePort

kubectl rollout history deployment/deployment_name
kubectl rollout undo deployment/deployment_name
#other args
# --to-revision=N       => to that revision as reported in history

kubectl describe deployment/deployment_name
kubectl describe pod/pod_name

kubectl logs pod/pod_name

kubectl exec -it pod/pod_name -c container_name_in_pod /bin/bash

kubectl delete pod pod_name
kubectl delete deployment deployment_name
kubectl delete svc service_name

minikube service list

```

## config file

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: helloworld
spec:
  selector:
    matchLabels:
      app: helloworld
  replicas: 1       # tells deployment to run 1 pods matching the template
  template:         # create pods using pod definition in this template
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: helloworld
        image: karthequian/helloworld:latest
        ports:
        - containerPort: 80
```

## probes

* readiness probe
* liveliness probe

# AWS and kubectl

* Install aws-cli : https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions
```
temp_dir=$(mktemp -d /tmp/install-aws-XXXX)
echo "temp_dir is $temp_dir"
curr_dir=$(pwd)
cd $temp_dir
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

#This should now work
aws --version

cd $curr_dir
rm -rf $temp_dir
```
* aws configure : https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
* setting up aws to a cloudinstance (step-2): https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html


