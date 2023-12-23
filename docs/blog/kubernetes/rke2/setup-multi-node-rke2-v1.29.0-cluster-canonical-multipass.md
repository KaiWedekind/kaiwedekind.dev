---
title: Multi Node RKE2 v1.29.0 with Canonical Multipass
description: Setup a Multi Node RKE2 v1.29.0 cluster with Canonical Multipass 
outline: deep
---

# Setup a Multi Node RKE2 v1.29.0 cluster with Canonical Multipass

## What is a Multi Node Cluster

A multi-node cluster refers to a computing cluster that consists of multiple interconnected nodes or servers that work together to achieve a common computing goal. In the context of technologies like Kubernetes, a multi-node cluster typically refers to a cluster of machines that collectively form a distributed computing environment for running containerized applications.

### Key concepts

1. Node: In a cluster, a node is an individual computing unit, which could be a physical server or a virtual machine. Each node contributes resources such as CPU, memory, storage, and network connectivity to the overall cluster.

2. Cluster: A cluster is a group of interconnected nodes that work together as a single system. In the context of Kubernetes, a cluster is used to deploy, manage, and scale containerized applications.

3. Multi-Node Cluster: A multi-node cluster, in the context of Kubernetes or other container orchestration systems, means that the cluster spans across multiple nodes. This allows for the distribution of workloads and provides high availability and scalability. In a multi-node cluster, nodes collaborate to deploy and manage containers, ensuring that applications can run on multiple machines and handle increased workloads.

4. High Availability: One of the advantages of a multi-node cluster is the ability to achieve high availability. If one node fails, the workloads can be distributed across the remaining nodes, ensuring that applications continue to run without disruption.

5. Scalability: Multi-node clusters can be easily scaled by adding more nodes to the cluster. This allows organizations to adapt to changing resource requirements and accommodate the growth of their applications.

In summary, a multi-node cluster in the context of Kubernetes or similar container orchestration platforms refers to a distributed system where multiple nodes work together to provide a resilient, scalable, and highly available environment for running containerized applications.

## Pre-requisite

### Install Multipass

Follow installation instructions to install Multipass, if you haven't yet:
https://multipass.run/install

### Launch Multipass VM instances

Ubuntu 23.04 VM Machines

### Launch Controller instances

```shell{4}
multipass launch 23.04 --name rke2-controller-1 --cpus 2 -m 2.5GB --disk 10G
multipass launch 23.04 --name rke2-controller-2 --cpus 2 -m 2.5GB --disk 10G
multipass launch 23.04 --name rke2-controller-3 --cpus 2 -m 2.5GB --disk 10G
```


### Launch Worker instances

```shell{4}
multipass launch 23.04 --name rke2-worker-1 --cpus 2 -m 1GB --disk 5G
multipass launch 23.04 --name rke2-worker-2 --cpus 2 -m 1GB --disk 5G
multipass launch 23.04 --name rke2-worker-3 --cpus 2 -m 1GB --disk 5G
```

### Verify Multipass instances

```shell{4}
multipass list
```
*Output:*
```shell{4}
Name                    State             IPv4             Image
rke2-controller-1       Running           192.168.205.2    Ubuntu 23.04
rke2-controller-2       Running           192.168.205.3    Ubuntu 23.04
rke2-controller-3       Running           192.168.205.4    Ubuntu 23.04
rke2-worker-1           Running           192.168.205.5    Ubuntu 23.04
rke2-worker-2           Running           192.168.205.6    Ubuntu 23.04
rke2-worker-3           Running           192.168.205.7    Ubuntu 23.04
```

## Install first rke2 controller

```shell{4}
multipass shell rke2-controller-1
```

```shell{4}
sudo apt update
```

### Download Installation script
```shell{4}
curl -sfL https://get.rke2.io --output rke2-install.sh

chmod +x rke2-install.sh
```

### Configure network service
*Enable the recommended IPv4 and/or IPv6 forwarding settings in the sysctl configuration files. Create a file named 90-rke2.conf in the /etc/sysctl.d/ directory*
```shell{4}
sudo vi /etc/sysctl.d/90-rke2.conf
```

```shell{4}
net.ipv4.conf.all.forwarding=1
net.ipv6.conf.all.forwarding=1
```

### Install RKE2 server

```shell{4}
sudo INSTALL_RKE2_TYPE=server INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 ./rke2-install.sh
```

*All-in-one command*
```shell{4}
curl -sfL https://get.rke2.io | sudo INSTALL_RKE2_TYPE=server INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 sh -
```

### Configure the rke2-server service
```shell{4}
sudo mkdir -p /etc/rancher/rke2
sudo vim /etc/rancher/rke2/config.yaml
```

```shell{4}
write-kubeconfig-mode: "0644"
tls-san:
  - 10.74.10.200
disable: rke2-ingress-nginx
node-taint:
  - "CriticalAddonsOnly=true:NoExecute"
cni:
  - calico
disable-cloud-controller: true
```

### Start the service
```shell{4}
sudo systemctl start rke2-server
sudo systemctl enable rke2-server
```

### Confirm status of the service after starting it
```shell{4}
sudo systemctl status rke2-server
```

Output:
```shell{4}
● rke2-server.service - Rancher Kubernetes Engine v2 (server)
     Loaded: loaded (/usr/local/lib/systemd/system/rke2-server.service; enabled; preset: enabled)
     Active: active (running) since Sat 2023-12-23 14:53:15 CET; 10s ago
       Docs: https://github.com/rancher/rke2#readme
   Main PID: 2637 (rke2)
      Tasks: 78
     Memory: 859.9M
        CPU: 2min 49.718s
     CGroup: /system.slice/rke2-server.service
             ├─2637 "/usr/local/bin/rke2 server"
             ├─2652 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /var/lib>
             ├─2662 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 --anonymous-auth=false --au>
             ├─2707 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id aede11a9b6ce6dad3ec51d13aef7d26d74a527f306dc1f>
             ├─2793 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 3ac6e3e2b532779a8175f19dc34352a561b4c5c086f6a1>
             ├─2881 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 3a48d6d9d6efaf446e450a5cde2fe3b58bd710bf2d3fb0>
             └─2882 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 8d3aed5efe9e33a5f40cccf36b614641813652ec3c188b>

Dec 23 14:53:17 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:17+01:00" level=info msg="Cluster dns configmap has been set successfully"
Dec 23 14:53:17 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:17+01:00" level=error msg="error syncing 'kube-system/rke2-calico': handler helm-controller-chart-regi>
Dec 23 14:53:18 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:18+01:00" level=info msg="Reconciling snapshot ConfigMap data"
Dec 23 14:53:19 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:19+01:00" level=error msg="error syncing 'kube-system/rke2-metrics-server': handler helm-controller-ch>
Dec 23 14:53:19 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:19+01:00" level=error msg="error syncing 'kube-system/rke2-calico-crd': handler helm-controller-chart->
Dec 23 14:53:19 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:19+01:00" level=error msg="error syncing 'kube-system/rke2-coredns': handler helm-controller-chart-reg>
Dec 23 14:53:19 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:19+01:00" level=error msg="error syncing 'kube-system/rke2-snapshot-controller-crd': handler helm-cont>
Dec 23 14:53:20 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:20+01:00" level=info msg="Running kube-proxy --cluster-cidr=10.42.0.0/16 --conntrack-max-per-core=0 -->
Dec 23 14:53:21 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:21+01:00" level=error msg="error syncing 'kube-system/rke2-snapshot-controller': handler helm-controll>
Dec 23 14:53:21 rke2-controller-1 rke2[2637]: time="2023-12-23T14:53:21+01:00" level=error msg="error syncing 'kube-system/rke2-snapshot-validation-webhook': handler helm->
```

### Update path with rke2 binaries

```shell{4}
echo 'export KUBECONFIG=/etc/rancher/rke2/rke2.yaml' >> ~/.bashrc;
echo 'export PATH=${PATH}:/var/lib/rancher/rke2/bin' >> ~/.bashrc;
echo 'alias k=kubectl' >> ~/.bashrc ; source ~/.bashrc;
```

### Check controller node

```shell{4}
kubectl get nodes

# Wait for node to be ready
kubectl wait --for=condition=Ready nodes --all --timeout=600s
```

### Obtain token
```shell{4}
sudo cat /var/lib/rancher/rke2/server/node-token
```

Output
```shell{4}
K100f5da8c469a178e8dc6c666ea0adf4c53beb16044ab38bad7f567dd807865be8::server:f11cfbbe06e12b28c57f3db2351046c2
```

### Leave controller machine
```shell{4}
exit
```

## Set up additional controller nodes

Repeat the following steps for `rke2-controller-2` and `rke2-controller-3`

```shell{4}
multipass shell rke2-controller-2
```

```shell{4}
sudo apt update
```

### Download Installation script
```shell{4}
curl -sfL https://get.rke2.io --output rke2-install.sh

chmod +x rke2-install.sh
```

### Configure network service
*Enable the recommended IPv4 and/or IPv6 forwarding settings in the sysctl configuration files. Create a file named 90-rke2.conf in the /etc/sysctl.d/ directory*
```shell{4}
sudo vi /etc/sysctl.d/90-rke2.conf
```

```shell{4}
net.ipv4.conf.all.forwarding=1
net.ipv6.conf.all.forwarding=1
```

### Install RKE2 server

```shell{4}
sudo INSTALL_RKE2_TYPE=server INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 ./rke2-install.sh
```

*All-in-one command*
```shell{4}
curl -sfL https://get.rke2.io | sudo INSTALL_RKE2_TYPE=server INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 sh -
```

### Configure the rke2-server service
```shell{4}
sudo mkdir -p /etc/rancher/rke2
sudo vim /etc/rancher/rke2/config.yaml
```

```shell{4}
server: https://192.168.205.2:9345
token: K100f5da8c469a178e8dc6c666ea0adf4c53beb16044ab38bad7f567dd807865be8::server:f11cfbbe06e12b28c57f3db2351046c2
write-kubeconfig-mode: "0644"
tls-san:
  - 192.168.205.3
disable: rke2-ingress-nginx
node-taint:
  - "CriticalAddonsOnly=true:NoExecute"
cni:
  - calico
disable-cloud-controller: true
```

### Start the service
```shell{4}
sudo systemctl start rke2-server
sudo systemctl enable rke2-server
```

### Confirm status of the service after starting it
```shell{4}
sudo systemctl status rke2-server
```

Output:
```shell{4}
● rke2-server.service - Rancher Kubernetes Engine v2 (server)
     Loaded: loaded (/usr/local/lib/systemd/system/rke2-server.service; enabled; preset: enabled)
     Active: active (running) since Sat 2023-12-23 15:37:33 CET; 11s ago
       Docs: https://github.com/rancher/rke2#readme
   Main PID: 5391 (rke2)
      Tasks: 90
     Memory: 1.3G
        CPU: 3min 10.283s
     CGroup: /system.slice/rke2-server.service
             ├─5391 "/usr/local/bin/rke2 server"
             ├─5401 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /var/lib/rancher/rke2/agent/containerd
             ├─5593 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 --anonymous-auth=false --authentication-token-webhook=true --authoriza>
             ├─5630 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 48d9abb84978b07850a245847ed48bc3a885bc7bd7adff325a13ac8ed8cae1d2 -address /run/k3s/contai>
             ├─5716 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 4c1aa4021549a851aef44ee57bee97d28dc2f6f3e6d9a96ed943838d462957fa -address /run/k3s/contai>
             ├─5810 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 1986793cd1840d812a807329e84fb4036cfb0c6802d1fc7ae6840e2c14280269 -address /run/k3s/contai>
             ├─5811 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 66effca73a55fc2f05f81d250f13cb9a176030ea059ab43723a214b4f8079b8f -address /run/k3s/contai>
             └─5983 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id a9ee3d3d0008f502ceb450f357fe5a678fc633935c73cb17258f727b13de87c3 -address /run/k3s/contai>

Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Running kube-proxy --cluster-cidr=10.42.0.0/16 --conntrack-max-per-core=0 --conntrack-tcp-timeout-close-wait=0s --connt>
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="certificate CN=rke2,O=rke2 signed by CN=rke2-server-ca@1703340760: notBefore=2023-12-23 14:12:40 +0000 UTC notAfter=202>
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Updating TLS secret for kube-system/rke2-serving (count: 15): map[listener.cattle.io/cn-10.43.0.1:10.43.0.1 listener.ca>
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Starting /v1, Kind=Secret controller"
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Starting /v1, Kind=Node controller"
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Cluster dns configmap already exists"
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Reconciliation of ETCDSnapshotFile resources complete"
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Updating TLS secret for kube-system/rke2-serving (count: 15): map[listener.cattle.io/cn-10.43.0.1:10.43.0.1 listener.ca>
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Labels and annotations have been set successfully on node: rke2-controller-2"
Dec 23 15:37:35 rke2-controller-2 rke2[5391]: time="2023-12-23T15:37:35+01:00" level=info msg="Active TLS secret kube-system/rke2-serving (ver=4556) (count 15): map[listener.cattle.io/cn-10.43.0.1:10.43.0.1 listene>
```

### Update path with rke2 binaries

```shell{4}
echo 'export KUBECONFIG=/etc/rancher/rke2/rke2.yaml' >> ~/.bashrc;
echo 'export PATH=${PATH}:/var/lib/rancher/rke2/bin' >> ~/.bashrc;
echo 'alias k=kubectl' >> ~/.bashrc ; source ~/.bashrc;
```

### Check controller node

```shell{4}
# Wait for node to be ready
kubectl wait --for=condition=Ready nodes --all --timeout=600s
```

```shell{4}
kubectl get nodes
```

Output:
```shell{4}
NAME                STATUS   ROLES                       AGE   VERSION
rke2-controller-1   Ready    control-plane,etcd,master   23m   v1.29.0+rke2r1
rke2-controller-2   Ready    control-plane,etcd,master   69s   v1.29.0+rke2r1
```

### Leave controller machine
```shell{4}
exit
```

## Join worker nodes

Repeat the following steps for `rke2-worker-1`, `rke2-worker-2`, and `rke2-worker-3`

```shell{4}
multipass shell rke2-worker-1
```

```shell{4}
sudo apt update
```

### Download Installation script
```shell{4}
curl -sfL https://get.rke2.io --output rke2-install.sh

chmod +x rke2-install.sh
```

### Configure network service
*Enable the recommended IPv4 and/or IPv6 forwarding settings in the sysctl configuration files. Create a file named 90-rke2.conf in the /etc/sysctl.d/ directory*
```shell{4}
sudo vi /etc/sysctl.d/90-rke2.conf
```

```shell{4}
net.ipv4.conf.all.forwarding=1
net.ipv6.conf.all.forwarding=1
```

### Install RKE2 agent

```shell{4}
sudo INSTALL_RKE2_TYPE=agent INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 ./rke2-install.sh
```

*All-in-one command*
```shell{4}
curl -sfL https://get.rke2.io | sudo INSTALL_RKE2_TYPE=agent INSTALL_RKE2_CHANNEL=latest INSTALL_RKE2_VERSION=v1.29.0+rke2r1 sh -
```

### Configure the rke2-agent service
```shell{4}
sudo mkdir -p /etc/rancher/rke2
sudo vim /etc/rancher/rke2/config.yaml
```

```shell{4}
server: https://192.168.205.2:9345
token: K100f5da8c469a178e8dc6c666ea0adf4c53beb16044ab38bad7f567dd807865be8::server:f11cfbbe06e12b28c57f3db2351046c2
```

### Start the service
```shell{4}
sudo systemctl start rke2-agent
sudo systemctl enable rke2-agent
```

### Confirm status of the service after starting it
```shell{4}
sudo systemctl status rke2-agent
```

Output:
```shell{4}
● rke2-agent.service - Rancher Kubernetes Engine v2 (agent)
     Loaded: loaded (/usr/local/lib/systemd/system/rke2-agent.service; enabled; preset: enabled)
     Active: active (running) since Sat 2023-12-23 17:25:50 CET; 1min 11s ago
       Docs: https://github.com/rancher/rke2#readme
   Main PID: 2519 (rke2)
      Tasks: 58
     Memory: 449.3M
        CPU: 1min 36.528s
     CGroup: /system.slice/rke2-agent.service
             ├─2519 "/usr/local/bin/rke2 agent"
             ├─2535 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /var/lib/rancher/rke2/agent/containerd
             ├─2544 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 --allowed-unsafe-sysctls=net.ipv4.ip_forward,net.ipv6.conf.all.forward>
             ├─2612 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id c48a67dad1378a7bbdb664d073dac9254924c4098d1968197abcca6d9a6ff736 -address /run/k3s/contai>
             └─2673 /var/lib/rancher/rke2/data/v1.29.0-rke2r1-491b1a599021/bin/containerd-shim-runc-v2 -namespace k8s.io -id 713f5dfff501e61459967eb969da466ea7a60b2049bf3478df65606334440f60 -address /run/k3s/contai>

Dec 23 17:25:48 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:48+01:00" level=info msg="Running kubelet --address=0.0.0.0 --allowed-unsafe-sysctls=net.ipv4.ip_forward,net.ipv6.conf.all.forwarding --alsologtostde>
Dec 23 17:25:48 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:48+01:00" level=info msg="Connecting to proxy" url="wss://192.168.205.3:9345/v1-rke2/connect"
Dec 23 17:25:48 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:48+01:00" level=info msg="Connecting to proxy" url="wss://192.168.205.2:9345/v1-rke2/connect"
Dec 23 17:25:49 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:49+01:00" level=info msg="Running kube-proxy --cluster-cidr=10.42.0.0/16 --conntrack-max-per-core=0 --conntrack-tcp-timeout-close-wait=0s --conntrack>
Dec 23 17:25:50 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:50+01:00" level=info msg="Failed to set annotations and labels on node rke2-worker-1: Operation cannot be fulfilled on nodes \"rke2-worker-1\": the o>
Dec 23 17:25:50 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:50+01:00" level=info msg="Failed to set annotations and labels on node rke2-worker-1: Operation cannot be fulfilled on nodes \"rke2-worker-1\": the o>
Dec 23 17:25:50 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:50+01:00" level=info msg="Failed to set annotations and labels on node rke2-worker-1: Operation cannot be fulfilled on nodes \"rke2-worker-1\": the o>
Dec 23 17:25:50 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:50+01:00" level=info msg="Annotations and labels have been set successfully on node: rke2-worker-1"
Dec 23 17:25:50 rke2-worker-1 rke2[2519]: time="2023-12-23T17:25:50+01:00" level=info msg="rke2 agent is up and running"
Dec 23 17:25:50 rke2-worker-1 systemd[1]: Started rke2-agent.service - Rancher Kubernetes Engine v2 (agent).
```

```shell
exit
```

### Check cluster nodes

```shell
multipass shell rke2-controller-1 
```

```shell{4}
kubectl get nodes

# Wait for node to be ready
kubectl wait --for=condition=Ready nodes --all --timeout=600s
```

Output
```shell
NAME                STATUS   ROLES                       AGE     VERSION
rke2-controller-1   Ready    control-plane,etcd,master   159m    v1.29.0+rke2r1
rke2-controller-2   Ready    control-plane,etcd,master   137m    v1.29.0+rke2r1
rke2-controller-3   Ready    control-plane,etcd,master   2m50s   v1.29.0+rke2r1
rke2-worker-1       Ready    <none>                      28m     v1.29.0+rke2r1
rke2-worker-2       Ready    <none>                      19m     v1.29.0+rke2r1
rke2-worker-3       Ready    <none>                      12m     v1.29.0+rke2r1
```

## Cleanup

Stop Multipass machines
```shell
multipass stop rke2-controller-1 rke2-controller-2 rke2-controller-3 rke2-worker-1 rke2-worker-2 rke2-worker-3
```

Delete Multipass machines
```shell
multipass delete rke2-controller-1 rke2-controller-2 rke2-controller-3 rke2-worker-1 rke2-worker-2 rke2-worker-3 --purge
```