---
title: "Kamaji + HAMi实战：多租户 Kubernetes 如何实现 GPU 资源共享与调度？"
date: "2026-11-20"
excerpt: "使用 kind、Kamaji 和 HAMi 模拟设备插件，在无物理 GPU 的环境中验证多租户控制平面与 GPU 调度链路。实验涵盖跨控制平面通信、资源共享与不足处理，以及租户 API 资源可见性隔离。"
author: "密瓜智能"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["Kamaji", "HAMi", "Kubernetes", "GPU 共享", "多租户"]
---

在 Kubernetes 环境中，如何兼顾多租户隔离与 GPU 资源利用率，是 AI 基础设施建设中需要考虑的问题。

为不同团队分别部署 Kubernetes 集群，可以提供相对独立的控制平面，但也会增加基础设施和运维成本；如果多个团队共用同一个集群，又需要额外考虑资源隔离、权限管理及工作负载之间的相互影响。

GPU 资源分配同样面临类似挑战。对于只需要部分显存或计算资源的任务，传统整卡分配方式可能造成资源闲置。如何在保障资源边界的同时，让多个工作负载共享 GPU？

Kamaji 与 HAMi 分别从两个层面提供了解决思路：

- **Kamaji** 将多个租户集群的 Kubernetes 控制平面统一托管在管理集群中，降低多集群控制平面的管理复杂度。
- **HAMi** 提供 GPU 资源共享与细粒度调度能力，支持工作负载按需申请显存和计算资源。

那么，当两者组合使用时，GPU 调度链路能否正常运行？

本文通过 kind、Kamaji 和 HAMi 的模拟设备插件，在一台没有物理 GPU 的机器上搭建了包含两个租户集群的实验环境，验证了跨控制平面的 Webhook 通信、GPU 资源调度、资源不足处理以及租户间的资源可见性隔离。

实验共完成 8 项测试，均获得预期结果。下面将介绍**具体架构、部署过程、关键验证结果及遇到的问题，并说明模拟环境能够验证哪些能力、哪些结论仍需要真实 GPU 硬件支持。**

## 一、整体架构：管理平面共享，租户集群独立

整个方案由一个 kind 管理集群和两个租户集群组成。管理集群负责承载 Kamaji 及两个租户的控制平面；每个租户的工作节点则运行在独立容器中，通过 kind 网络接入对应集群，并部署 HAMi。

![实验环境架构：1 个管理集群、2 个租户集群](/images/blog/kamaji-hami-multitenant-gpu-sharing/architecture-zh.png)

两个租户不共享工作节点，也不共用 Kubernetes API Server，它们共用的是底层管理集群，以及 `kamaji-etcd` 数据存储服务；但各租户的数据在其中分别存放。

## 二、关键验证：跨控制平面的 GPU 调度链路

Kamaji 负责**管理租户集群的控制平面**，使多个租户能够拥有各自的 Kubernetes API Server，而不必为每个租户单独部署完整的控制平面基础设施；HAMi 则运行在租户集群内部，负责 GPU 资源的共享、分配与调度。二者工作在不同层级，能力互补，并不存在直接重叠。

**两者结合时，一个关键问题是：位于管理集群中的 API Server，能否正常访问部署在租户集群内部的 HAMi Webhook？**

在本实验架构中，租户 API Server 运行在管理集群，而 HAMi Webhook 运行在租户工作节点上。当创建 GPU Pod 时，相关准入请求需要通过 Kamaji 的 Konnectivity 隧道完成通信。

因此，本次实验不仅关注 GPU 资源能否成功分配，还重点验证了跨控制平面与工作节点的通信链路是否能够支持 HAMi 的调度流程。

## 三、实验环境：如何在没有 GPU 的情况下模拟设备

所有组件均运行在一台 Linux 主机上的 Docker 容器中。实验所需资源为 4 个 CPU 核心、8 GB 可用内存和 20 GB 磁盘空间。

**没有 GPU，如何测试 GPU 共享？**

HAMi 的真实设备插件需要与 NVIDIA 驱动交互，因此无法在没有 GPU 硬件的环境中正常启动。模拟设备插件则绕过了硬件发现流程：只需通过节点 Annotation 描述模拟 GPU，插件就能够注册 `gpumem` 和 `gpucores` 等资源容量。

这样，尽管底层不存在真实显卡，HAMi 的 Webhook、调度器与配额相关逻辑仍可以按照真实节点上的调度流程运行。

为了便于区分两个租户，实验配置了不同的模拟 GPU：

- **tenant-a**：1 张 NVIDIA A100 80 GB，显存为 81,920 MB，计算资源为 100 cores。
- **tenant-b**：2 张 NVIDIA L4 24 GB，总显存为 49,152 MB，总计算资源为 200 cores。

这里的 cores 是实验中使用的 GPU 计算资源计量方式，并非物理 CPU 核心数量。

## 四、部署实践：五步搭建多租户测试环境

部署主要分为五步。其中，第 3 步一次性创建两个租户，第 4、5 步则需要分别在每个租户中执行。

注意：直接运行 `kubectl` 时操作的是管理集群；通过 `--kubeconfig tenant-a.kubeconfig` 指定配置文件，才会访问对应租户集群。

### 第一步：部署管理集群、cert-manager 与 MetalLB

首先创建 kind 集群：

```Bash
kind create cluster --name kamaji
```

随后部署 cert-manager：

```Bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.21.2/cert-manager.yaml
kubectl -n cert-manager wait pod --all --for=condition=Ready --timeout=180s
```

部署 MetalLB：

```Bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.16.1/config/manifests/metallb-frr-k8s.yaml
kubectl -n metallb-system wait pod --all --for=condition=Ready --timeout=180s
```

在 kind 网络中查找 IPv4 子网，再从子网地址范围的高位段为 MetalLB 分配地址池：

```Bash
docker network inspect kind | grep Subnet
```

```Bash
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: kind-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 172.18.255.200-172.18.255.250
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: empty
  namespace: metallb-system
EOF
```

### 第二步：安装 Kamaji

添加 Helm 仓库并安装 Kamaji：

```Bash
helm repo add clastix https://clastix.github.io/charts
helm upgrade --install kamaji clastix/kamaji \
  --namespace kamaji-system --create-namespace \
  --set 'resources=null' --version 0.0.0+latest
```

检查 Kamaji 组件状态：

```Bash
kubectl -n kamaji-system get pods
```

### 第三步：创建两个租户控制平面

管理集群和 Kamaji 组件就绪后，接下来创建 `tenant-a` 与 `tenant-b` 两个独立的租户控制平面。

本步骤使用 Kamaji 提供的 `TenantControlPlane` 资源定义，分别指定 Kubernetes 版本、控制平面部署方式、网络配置以及 Konnectivity 组件。

下面的配置将一次性创建两个租户控制平面：

```Bash
export TENANT_VERSION=v1.36.4
kubectl create namespace tenants

for t in tenant-a tenant-b; docat <<EOF | kubectl apply -f -
apiVersion: kamaji.clastix.io/v1alpha1
kind: TenantControlPlane
metadata:
  name: ${t}
  namespace: tenants
  labels:
    tenant.clastix.io: ${t}
spec:
  controlPlane:
    deployment:
      replicas: 1
    service:
      serviceType: LoadBalancer
  kubernetes:
    version: "${TENANT_VERSION}"
    kubelet:
      configurationJSONPatches:
        - op: add
          path: /cgroupDriver
          value: systemd
  networkProfile:
    port: 6443
    podCidr: 10.244.0.0/16
  addons:
    coreDNS: {}
    kubeProxy: {}
    konnectivity:
      server:
        port: 8132
      agent:
        mode: DaemonSet
EOFdone
```

配置提交后，等待两个租户控制平面的 Pod 进入 `Running` 状态，再分别导出对应的 kubeconfig 文件：

```Bash
for t in tenant-a tenant-b; do  kubectl -n tenants get secret ${t}-admin-kubeconfig -o jsonpath='{.data.admin\.conf}' | base64 -d > ${t}.kubeconfig
  kubectl --kubeconfig ${t}.kubeconfig cluster-info
done
```

每个租户的控制平面都以单个 Pod 的形式，运行在管理集群 `tenants` 命名空间中，并部署在 `kamaji-control-plane` 节点上。

当控制平面 Pod 的 `READY` 状态显示为 `4/4` 时，表示四个容器均已就绪：

- `kube-apiserver`：为租户提供 Kubernetes API 服务，并通过 MetalLB 分配的 IP 对外暴露。
- `kube-scheduler`：租户集群的默认调度器。
- `kube-controller-manager`：运行租户 Kubernetes 内置控制器。
- `konnectivity-server`：负责隧道在管理集群侧的连接，使 API Server 可以访问租户工作节点。

![两个租户集群的控制平面以 Pod 形式运行在管理集群中](/images/blog/kamaji-hami-multitenant-gpu-sharing/control-planes.png)

至此，两个租户控制平面已经创建完成。下一步将分别为租户接入工作节点，使其具备运行工作负载的基础条件。

### 第四步：接入租户工作节点

Kamaji 没有为 kind 提供专门的工作节点接入工具。因此，本实验在 kind 网络中运行 `kindest/node` 容器，再通过标准 `kubeadm` 流程将其加入租户集群。工作节点版本需要与租户 Kubernetes 版本一致。

```Bash
docker run -d --name tenant-a-worker --hostname tenant-a-worker \
  --network kind --privileged \
  --security-opt seccomp=unconfined --security-opt apparmor=unconfined \
  --tmpfs /tmp --tmpfs /run -v /var -v /lib/modules:/lib/modules:ro \
  kindest/node:v1.36.4@sha256:099e049362a1526b2db71494e1947aae99bd16290d7c895f2b7ea312e3cbfaed
sleep 15
docker exec -i tenant-a-worker sh -c 'cat > /root/tenant-a.kubeconfig' < tenant-a.kubeconfig
JOIN_CMD=$(docker exec tenant-a-worker kubeadm token create --print-join-command \
  --kubeconfig /root/tenant-a.kubeconfig)
echo "$JOIN_CMD"
docker exec tenant-a-worker bash -c "${JOIN_CMD} --ignore-preflight-errors=all"
```

接下来在**租户集群，而非管理集群**中安装 Calico，并将其地址池设置为租户的 `podCidr`：

```Bash
curl -sLO https://raw.githubusercontent.com/projectcalico/calico/v3.31.2/manifests/calico.yaml
sed -i 's|# - name: CALICO_IPV4POOL_CIDR|- name: CALICO_IPV4POOL_CIDR|; s|#   value: "192.168.0.0/16"|  value: "10.244.0.0/16"|' calico.yaml
kubectl --kubeconfig tenant-a.kubeconfig apply -f calico.yaml
```

确认工作节点已经加入集群：

```Bash
kubectl --kubeconfig tenant-a.kubeconfig get nodes
```

### 第五步：在租户中部署 HAMi 与模拟 GPU

这里有一个关键注意事项：**不要给工作节点设置 `gpu=on` 标签**。否则会启动 HAMi 的真实 NVIDIA 设备插件，由于实验环境没有 GPU 驱动，该插件将无法正常工作。

```Bash
export KUBECONFIG=$PWD/tenant-a.kubeconfig

helm repo add hami-charts https://project-hami.github.io/HAMi/
helm install hami hami-charts/hami -n kube-system
# wait for hami-scheduler Running, and the hami-scheduler-device ConfigMap to exist
kubectl apply -f https://raw.githubusercontent.com/Project-HAMi/mock-device-plugin/master/k8s-mock-rbac.yaml
kubectl apply -f https://raw.githubusercontent.com/Project-HAMi/mock-device-plugin/master/k8s-mock-plugin.yaml
```

接着为节点配置模拟 GPU。本例模拟的是一张 A100 80 GB：

```Bash
# Simulate 1 x A100 80 GBNODE=tenant-a-worker
kubectl patch node $NODE --subresource=status --type=json \
  -p '[{"op":"add","path":"/status/capacity/nvidia.com~1gpu","value":"10"}]'
kubectl annotate node $NODE \
  'hami.io/node-nvidia-register=[{"id":"GPU-MOCK-0","count":10,"devmem":81920,"devcore":100,"type":"NVIDIA-A100-SXM4-80GB","health":true,"numa":0,"mode":"hami-core"}]'
```

约 30 秒后，节点将上报以下模拟 GPU 资源容量：

```JSON
{  "nvidia.com/gpu": "10",  "nvidia.com/gpucores": "100",  "nvidia.com/gpumem": "81920",  "nvidia.com/gpumem-percentage": "100"}
```

对 `tenant-b` 重复第四、第五步，将名称替换为 `tenant-b` 对应的名称。该租户的 Annotation 描述两张模拟 GPU，分别为 `GPU-MOCK-B0`、`GPU-MOCK-B1`；每张显卡配置 24,576 MB 显存和 100 cores，并将 `nvidia.com/gpu` 资源容量设置为 20。

## 五、调度流程：GPU Pod 是如何完成调度的？

当 GPU Pod 提交到租户集群时，调度流程需要在管理集群和租户工作节点之间完成一次跨集群通信。这也是 Kamaji 与 HAMi 协同工作的关键。

![GPU Pod 调度路径](/images/blog/kamaji-hami-multitenant-gpu-sharing/gpu-scheduling-flow-zh.png)

API Server 运行在管理集群中，HAMi Webhook 则运行在租户工作节点上，因此准入请求需要通过 Kamaji 的 Konnectivity 隧道传递。一旦这条调用链路无法正常工作，GPU Pod 就可能无法按照预期进入 HAMi 的调度流程。

因此，验证该链路是整个实验的重要环节。

## 六、验证结果：GPU 共享调度、资源约束与租户隔离

本次实验共进行了 8 项测试，**全部通过**。以下展示其中几组关键验证结果。

### TC-03、TC-05：三个 Pod 共享同一张 GPU

为每个 Pod 申请 20,000 MB 显存和 30% GPU 计算资源。下面的循环创建三个 Pod。

由于模拟插件不会像真实设备插件那样完成节点锁释放，因此需要在每个 Pod 完成调度后手动解除 HAMi 节点锁。具体原因将在后文的“问题与解决方法”部分说明。

```Bash
export KUBECONFIG=$PWD/tenant-a.kubeconfig

for i in 1 2 3; docat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-share-${i}
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 20000   # MB
          nvidia.com/gpucores: 30    # % of one card
EOF  kubectl wait pod/gpu-share-${i} --for=condition=PodScheduled --timeout=120s
  kubectl annotate pod gpu-share-${i} hami.io/bind-phase=success --overwrite
  kubectl annotate node tenant-a-worker hami.io/mutex.lock-
done
```

从结果可以看到，Webhook 将 Pod 引导至 HAMi 调度器，HAMi 则将其调度到模拟 GPU：

```Plain Text
$ kubectl get pod gpu-share-1 -o jsonpath='{.spec.schedulerName}'
hami-scheduler

Annotations:  hami.io/vgpu-devices-allocated: GPU-MOCK-0,NVIDIA,20000,30:;
              hami.io/vgpu-node: tenant-a-worker
Events:
  Normal  FilteringSucceed  hami-scheduler  find fit node(tenant-a-worker), 0 nodes not fit, 1 nodes fit
  Normal  BindingSucceed    hami-scheduler  Successfully binding node [tenant-a-worker] to default/gpu-share-1
```

三个 Pod 最终运行在同一张模拟 GPU 上，累计申请 60,000 MB 显存和 90% 计算资源。

```Plain Text
NAME          READY   STATUS    NODE
gpu-share-1   1/1     Running   tenant-a-worker
gpu-share-2   1/1     Running   tenant-a-worker
gpu-share-3   1/1     Running   tenant-a-worker
```

这验证了 HAMi 在模拟资源模型下的细粒度 GPU 共享调度能力。

### TC-06、TC-07：资源不足时拒绝继续调度

如果再提交第四个需要 30% 计算资源的 Pod，总需求将达到 120%，超出模拟显卡的 100 cores 容量。

```Bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-share-4
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 20000   # MB
          nvidia.com/gpucores: 30    # % of one card
EOF
```

这个 Pod 会保持 Pending 状态。HAMi 给出了明确的调度失败原因：

```Plain Text
$ kubectl describe pod gpu-share-4 | sed -n '/Events/,$p'
Events:
  Type     Reason            Age                From            Message
  ----     ------            ----               ----            -------
  Warning  FailedScheduling  15s                hami-scheduler  0/1 nodes are available: 1 1/1 CardInsufficientCore. no new claims to deallocate, preemption: 0/1 nodes are available: 1 No preemption victims found for incoming pod.
  Warning  FilteringFailed   15s (x2 over 15s)  hami-scheduler  1 nodes CardInsufficientCore(tenant-a-worker)
  Warning  FilteringFailed   15s (x2 over 15s)  hami-scheduler  no available node, 1 nodes do not meet
```

接着测试显存不足的情况：新建 Pod 申请 90,000 MB 显存，超过模拟 A100 的 81,920 MB 容量。

```Bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-mem-big
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 90000   # MB, more than the whole card
          nvidia.com/gpucores: 10    # % of one card, fits in the free 10%
EOF
```

此时 Pod 同样保持 Pending，并提示 `CardInsufficientMemory`。

这两组结果说明，在模拟 GPU 的资源信息下，HAMi 可以识别计算资源和显存需求是否超出可分配容量，并据此作出调度决策。

### TC-08：租户之间的数据与资源可见性隔离

分别向两个租户的 API Server 发起相同查询，对比节点、Pod 和 GPU 可分配资源：

```Bash
for t in a b; do  echo "===== tenant-$t ====="  kubectl --kubeconfig tenant-$t.kubeconfig get nodes
  kubectl --kubeconfig tenant-$t.kubeconfig get pods -A | grep -E 'gpu-|NAME'  kubectl --kubeconfig tenant-$t.kubeconfig get nodes -o json \
    | jq '.items[].status.allocatable | with_entries(select(.key|test("gpumem|gpucores")))'done
```

测试输出如下：

```Plain Text
===== tenant-a =====
NAME              STATUS   ROLES    AGE   VERSION
tenant-a-worker   Ready    <none>   29m   v1.36.4
NAMESPACE     NAME          READY   STATUS    RESTARTS   AGE
default       gpu-share-1   1/1     Running   0          14m
default       gpu-share-2   1/1     Running   0          12m
default       gpu-share-3   1/1     Running   0          12m
{
  "nvidia.com/gpucores": "100",
  "nvidia.com/gpumem": "81920",
  "nvidia.com/gpumem-percentage": "100"
}
===== tenant-b =====
NAME              STATUS   ROLES    AGE     VERSION
tenant-b-worker   Ready    <none>   5m28s   v1.36.4
NAMESPACE     NAME          READY   STATUS    RESTARTS   AGE
{
  "nvidia.com/gpucores": "200",
  "nvidia.com/gpumem": "49152",
  "nvidia.com/gpumem-percentage": "200"
}
```

可以看到，`tenant-a` 仅能看到自己的工作节点、三个运行中的 GPU Pod，以及 100 cores / 81,920 MB 的模拟 GPU 资源；`tenant-b` 只能看到自己的工作节点与 200 cores / 49,152 MB 的模拟资源。

尽管两个控制平面都运行在同一个管理集群中，各租户通过自身 API Server 查询时，都不会返回另一个租户的节点、Pod 或 GPU 资源信息。

这验证了本实验架构下的**租户 API 资源可见性隔离**。

## 七、问题排查：MetalLB 地址配置与 HAMi 节点锁

实验过程中遇到了两个值得注意的问题，处理方式相对直接。

### 问题一：kind 网络中的 IPv6 信息影响 MetalLB 地址池配置

按照 Kamaji 指南查询网关时，输出出现了 `fc00:f853:ccd:e793::1172.18.0.1` 这样将 IPv6 与 IPv4 网关信息拼接在一起的结果，导致地址池配置异常。

**解决方法：** 使用 `docker network inspect kind | grep Subnet` 明确读取 IPv4 子网，并直接配置地址范围 `172.18.255.200-172.18.255.250`。

### 问题二：GPU Pod 因节点锁冲突而一直处于 Pending

第一个 GPU Pod 调度完成后，后续 Pod 出现如下告警：

```Plain Text
Warning  BindingFailed  hami-scheduler  node tenant-a-worker has been locked within 5m0s: node lock contention
```

原因在于，HAMi 在绑定 Pod 时会暂时锁定节点，并设置 `hami.io/bind-phase: allocating` 标记。在真实节点上，HAMi 设备插件会完成资源分配并释放锁；但模拟插件不会执行这一动作，锁需要等待 5 分钟才会超时。

**实验中的解决方法：** 手动模拟设备插件的收尾操作，更新 Pod 的绑定状态，并解除节点锁：

```Bash
kubectl annotate pod gpu-share-1 hami.io/bind-phase=success --overwrite
kubectl annotate node tenant-a-worker hami.io/mutex.lock-
```

处理后，下一个 Pod 很快就完成了绑定。

需要强调的是，这属于**模拟设备插件带来的实验环境差异**，并不意味着 Kamaji 或 HAMi 本身存在缺陷。

## 八、实验边界：哪些能力仍需要真实 GPU 验证？

本次实验验证的是集群组件之间的通信链路和 GPU 调度决策，**并不等于已经验证了真实 GPU 的运行时隔离能力**。

- **未验证真实的显存与算力限制。** HAMi-core 依赖 NVIDIA 驱动等真实运行环境实施 GPU 资源限制。模拟 GPU 不具备实际执行这些限制的硬件能力。
- **未提供性能测试数据。** 实验没有运行 CUDA 负载，因此无法得出吞吐量、性能损耗或“吵闹邻居”（noisy neighbour）干扰方面的结论。
- **设备数据由人工模拟。** 真实环境中，节点 Annotation 的注册及资源分配的完成通常由 HAMi 设备插件负责；本实验中相关步骤需要人工处理。
- **工作节点接入方式并非官方推荐路径。** 使用 `kindest/node` 容器可以完成实验，但 Kamaji 支持的常规工作节点部署方式是通过 kubeadm 接入真实机器，或使用 Cluster API。

## 结语

本次实验在没有物理 GPU 的环境下，使用 Kamaji 与 HAMi 搭建了多租户 Kubernetes 测试环境，并完成了 GPU 调度相关功能验证。

实验结果表明，在该架构下，Kamaji 托管的租户 API Server 可以通过 Konnectivity 隧道访问租户内部的 HAMi Webhook，支持 GPU Pod 完成准入与调度流程。模拟资源测试也验证了 HAMi 对 GPU 共享请求、资源不足情况的调度处理，以及不同租户之间的 API 资源可见性隔离。

**这套实验环境的价值，在于将多租户控制平面与 GPU 调度链路的集成验证，提前到无需真实 GPU 的阶段。**

需要注意的是，模拟设备无法验证真实 GPU 的显存隔离、计算资源限制效果及运行性能。对于计划将相关架构应用于生产环境的团队，仍需在真实 GPU 硬件和业务负载下进一步测试。

对于希望探索 Kubernetes 多租户架构、GPU 资源共享或 HAMi 调度机制的开发者，这套实验提供了一个可参考的起点。

---

**原文链接：**https://anishbista.org/blog/multi-tenant-gpu-kubernetes-on-a-laptop-kamaji-hami/#why-kamaji--hami

**作者：**Kubernetes 软件工程师 *Anish Bista*
