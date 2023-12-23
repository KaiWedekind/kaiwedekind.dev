---
outline: deep
---

# Multi Node RKE2 Cluster with Multipass


## Install zx

https://google.github.io/zx/

```shell
brew install zx
```

## Script

```shell
vi multi-node-rke2-cluster-multipass.mjs
```

```js
#!/usr/bin/env zx

let TMP_FOLDER = 'tmp'

// Name for the cluster/configuration files
let NAME = 'rke2';

// Ubuntu image to use (focal/jammy/lunar)
let IMAGE = '23.04';

// RKE2 channel
let RKE2_CHANNEL = 'stable';

// RKE2 version - https://github.com/rancher/rke2/releases
let RKE2_VERSION = 'v1.29.0+rke2r1';

// How many controller machines to create
let CONTROLLER_COUNT_MACHINE = 3;

// How many worker machines to create
let WORKER_COUNT_MACHINE = 3;

// How many CPUs to allocate to each machine
let CONTROLLER_CPU_MACHINE = '2';
let WORKER_CPU_MACHINE = '1';

// How much disk space to allocate to each machine
let CONTROLLER_DISK_MACHINE = '10G';
let WORKER_DISK_MACHINE = '5G';

// How much memory to allocate to each machine
let CONTROLLER_MEMORY_MACHINE = '2.25G';
let WORKER_MEMORY_MACHINE = '2G';

// Nothing to change after this line

$.verbose = false;

let MULTIPASSCMD = await within(async () => {
  try {
    // Windows
    await $`multipass.exe version`;
    return 'multipass.exe';
  } catch (error) {}

  try {
    // Linux/MacOS
    await $`multipass version`;
    return 'multipass';
  } catch (error) {}

  console.log(`The multipass binary (multipass or multipass.exe) is not available or not in your \$PATH`);
});

await $`mkdir -p ${TMP_FOLDER}`

const CONTROLLER_TEMPLATE = `#cloud-config
runcmd:
  - |
    apt update

    cat >>/etc/sysctl.d/90-rke2.conf<<EOF
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    EOF
    sysctl --system
    
    # Install and start rke2
    curl -sfL https://get.rke2.io | sudo INSTALL_RKE2_TYPE=server INSTALL_RKE2_CHANNEL=${RKE2_CHANNEL} INSTALL_RKE2_VERSION=${RKE2_VERSION} sh -

    mkdir -p /etc/rancher/rke2
apt_update: true
apt_upgrade: true
package_update: true
package_upgrade: true
package_reboot_if_required: false
`

const WORKER_TEMPLATE = `#cloud-config
runcmd:
  - |
    apt update

    cat >>/etc/sysctl.d/90-rke2.conf<<EOF
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    EOF
    sysctl --system
    
    # Install and start rke2
    curl -sfL https://get.rke2.io | sudo INSTALL_RKE2_TYPE=agent INSTALL_RKE2_CHANNEL=${RKE2_CHANNEL} INSTALL_RKE2_VERSION=${RKE2_VERSION} sh -

    mkdir -p /etc/rancher/rke2
apt_update: true
apt_upgrade: true
package_update: true
package_upgrade: true
package_reboot_if_required: false
`

await $`echo ${CONTROLLER_TEMPLATE} > ${TMP_FOLDER}/${NAME}-controller-cloud-init.yaml`;
console.log(`Cloud-init is created at ${TMP_FOLDER}/${NAME}-controller-cloud-init.yaml`);

await $`echo ${WORKER_TEMPLATE} > ${TMP_FOLDER}/${NAME}-worker-cloud-init.yaml`;
console.log(`Cloud-init is created at ${TMP_FOLDER}/${NAME}-worker-cloud-init.yaml`);

for (let i = 1; i <= CONTROLLER_COUNT_MACHINE; i++) {
  console.log(`Launch ${NAME}-controller-${i}`);
  try {
    await $`${MULTIPASSCMD} launch --cpus ${CONTROLLER_CPU_MACHINE} --disk ${CONTROLLER_DISK_MACHINE} --memory ${CONTROLLER_MEMORY_MACHINE} ${IMAGE} --name ${NAME}-controller-${i} --cloud-init ${TMP_FOLDER}/${NAME}-controller-cloud-init.yaml --timeout 600`;
  } catch (error) {
    console.log('ERROR', error)
  }
  try {
    await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- sudo cloud-init status --wait`;
  } catch (error) {
    console.log('ERROR', error)
  }
}

for (let i = 1; i <= WORKER_COUNT_MACHINE; i++) {
  console.log(`Launch ${NAME}-worker-${i}`);
  try {
    await $`${MULTIPASSCMD} launch --cpus ${WORKER_CPU_MACHINE} --disk ${WORKER_DISK_MACHINE} --memory ${WORKER_MEMORY_MACHINE} ${IMAGE} --name ${NAME}-worker-${i} --cloud-init ${TMP_FOLDER}/${NAME}-worker-cloud-init.yaml --timeout 600`;
  } catch (error) {
    console.log('ERROR', error.stderr)
  }
  try {
    // Checking for node being ready
    await $`${MULTIPASSCMD} exec ${NAME}-worker-${i} -- sudo cloud-init status --wait`;
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Get IP address of first controller node
const FIRST_CONTROLLER_IP = await $`${MULTIPASSCMD} info ${NAME}-controller-1 | grep IPv4: | tr -s ' ' | cut -d " " -f 2`.then(({ stdout }) => stdout.trim());

// Set up first controller node
console.log(`Install rke2 server on ${NAME}-controller-1`);
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- sudo mkdir -p /etc/rancher/rke2`;
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- sudo sh -c "echo 'write-kubeconfig-mode: \\"0644\\"\ntls-san:\n  - ${FIRST_CONTROLLER_IP}\ndisable: rke2-ingress-nginx\nnode-taint:\n  - \\"CriticalAddonsOnly=true:NoExecute\\"\ncni:\n  - calico\ndisable-cloud-controller: true' > /etc/rancher/rke2/config.yaml"`;
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- sudo systemctl daemon-reload`;
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- sudo systemctl enable --now rke2-server`;
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- bash -c "/var/lib/rancher/rke2/bin/kubectl wait --for=condition=Ready nodes --all --timeout=600s --kubeconfig=/etc/rancher/rke2/rke2.yaml"`;

const TOKEN = await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- sudo cat /var/lib/rancher/rke2/server/node-token`.then(({ stdout }) => stdout.trim());

// Set up additional controller nodes
for (let i = 2; i <= CONTROLLER_COUNT_MACHINE; i++) {
  console.log(`Install rke2 server on ${NAME}-controller-${i}`);
  const CONTROLLER_IP = await $`${MULTIPASSCMD} info ${NAME}-controller-${i} | grep IPv4: | tr -s ' ' | cut -d " " -f 2`.then(({ stdout }) => stdout.trim());
  
  await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- sudo mkdir -p /etc/rancher/rke2`;
  await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- sudo sh -c "echo 'server: https://${FIRST_CONTROLLER_IP}:9345\ntoken: ${TOKEN}\nwrite-kubeconfig-mode: \\"0644\\"\ntls-san:\n  - ${CONTROLLER_IP}\ndisable: rke2-ingress-nginx\nnode-taint:\n  - \\"CriticalAddonsOnly=true:NoExecute\\"\ncni:\n  - calico\ndisable-cloud-controller: true' > /etc/rancher/rke2/config.yaml"`;
  await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- sudo systemctl daemon-reload`;
  await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- sudo systemctl enable --now rke2-server`;
  await $`${MULTIPASSCMD} exec ${NAME}-controller-${i} -- bash -c "/var/lib/rancher/rke2/bin/kubectl wait --for=condition=Ready nodes --all --timeout=600s --kubeconfig=/etc/rancher/rke2/rke2.yaml"`;
}

// Set up additional controller nodes
for (let i = 1; i <= WORKER_COUNT_MACHINE; i++) {
  console.log(`Install rke2 agent on ${NAME}-worker-${i}`);

  await $`${MULTIPASSCMD} exec ${NAME}-worker-${i} -- sudo mkdir -p /etc/rancher/rke2`;
  await $`${MULTIPASSCMD} exec ${NAME}-worker-${i} -- sudo sh -c "echo 'server: https://${FIRST_CONTROLLER_IP}:9345\ntoken: ${TOKEN}' > /etc/rancher/rke2/config.yaml"`;
  await $`${MULTIPASSCMD} exec ${NAME}-worker-${i} -- sudo systemctl daemon-reload`;
  await $`${MULTIPASSCMD} exec ${NAME}-worker-${i} -- sudo systemctl enable --now rke2-agent`;
  await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- bash -c "/var/lib/rancher/rke2/bin/kubectl wait --for=condition=Ready nodes --all --timeout=600s --kubeconfig=/etc/rancher/rke2/rke2.yaml"`;
}

// Export config
await $`${MULTIPASSCMD} exec ${NAME}-controller-1 -- /bin/bash -c 'sed "/^[[:space:]]*server:/ s_:.*_: \"https://$(echo ${FIRST_CONTROLLER_IP} | sed -e \'s/[[:space:]]//g\'):6443\"_" /etc/rancher/rke2/rke2.yaml > ~/${NAME}-public.yaml'`;
await $`${MULTIPASSCMD} transfer ${NAME}-controller-1:${NAME}-public.yaml ~/.kube/config-${NAME}`;

console.log(`
  export KUBECONFIG=~/.kube/config-${NAME}

  kubectl get nodes
`);

process.exit();
```

```shell
zx multi-node-rke2-cluster-multipass.mjs
```
