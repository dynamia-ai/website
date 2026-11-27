---
title: "HAMi v2.11 Remote GPU in Practice: Run CUDA Anywhere"
date: "2026-11-27"
excerpt: "Use HAMi v2.11 Remote GPU to run CUDA Samples and vLLM inference on a CPU node without a GPU or NVIDIA driver, validating remote device discovery, CUDA computation, and model serving."
author: "Dynamia"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["HAMi", "Remote GPU", "CUDA", "Kubernetes", "vLLM"]
---

HAMi v2.11.0 introduces **Remote GPU**, allowing CPU-only machines to access GPUs on other machines and deploy CUDA workloads separately from GPU resources across nodes.

Running CUDA or vLLM workloads in Kubernetes previously usually meant scheduling Pods on GPU nodes. Pods can now run on dedicated CPU nodes and use a GPU Server over the network, without a local GPU or NVIDIA driver on the client.

## Introducing Lupine Remote GPU

Lupine is a `GPU-over-IP` project that lets CPU-only machines run CUDA workloads using GPUs on other machines over the network.

Lupine distinguishes between Server and Client nodes.

- Server nodes have GPUs, require NVIDIA drivers, and run the Lupine server. They receive remote CUDA calls, execute GPU computations, and return results.
- Client nodes run CUDA applications. The Lupine client library forwards CUDA calls to the Server over the network, without a local GPU or NVIDIA driver.

![How local GPU and Remote GPU execution work](/images/blog/hami-remote-gpu-run-cuda-anywhere/image-01-en.png "unnumbered-caption")

The application process runs on the CPU Client. Its client library forwards CUDA calls to the GPU Server, whose driver accesses the GPU to execute computations and return results.

## How HAMi integrates Remote GPU

With HAMi Remote GPU, Client and Server run on different nodes in the same cluster. GPU nodes can act as Servers providing compute resources, while applications run on CPU-only nodes and access the Server's GPUs over the network.

Integrating this into Kubernetes raises several questions: which nodes can provide remote GPUs, which Server should a Pod use, and how should its client libraries and connection address be prepared at startup? HAMi incorporates these tasks into resource discovery, scheduling, and Pod injection.

![HAMi Remote GPU control plane and remote CUDA call architecture](/images/blog/hami-remote-gpu-run-cuda-anywhere/image-02-en.png "unnumbered-caption")

### Registering GPU nodes as Servers

Administrators set GPU nodes to `operatingmode: remote`. The Device Plugin registers GPU information as remote resources and automatically adds the `hami.io/lupine-server` discovery label so HAMi can select GPU Servers. The remote server runs on the GPU node and exposes a CUDA endpoint for subsequent workloads.

HAMi can then discover allocatable GPU Servers in the cluster. Node labels can also group Servers into resource pools for different workloads.

### Selecting a Client and GPU Server for a Pod

Workloads request remote GPUs through `nvidia.com/remote-gpu`. They can also set a per-GPU memory quota in MiB through `nvidia.com/remote-gpu-memory`.

The following Pod configuration places an application on a CPU node, requests one remote GPU, and sets a memory quota of 3000 MiB per GPU.

~~~yaml
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  containers:
    - name: cuda
      image: nvidia/cuda:13.0.2-devel-ubuntu24.04
      command: ["nvidia-smi", "-L"]
      resources:
        limits:
          nvidia.com/remote-gpu: 1 # 远程 GPU 数量
          nvidia.com/remote-gpu-memory: 3000 # 每张 GPU 的显存配额，单位 MiB
~~~

Scheduling determines two locations: the Client node where the Pod actually runs and the Server providing its GPUs. This article uses `nodeSelector` to place the Pod on a specific CPU node, then lets HAMi allocate a remote Server.

> To select a particular resource pool, a Pod can set the `hami.io/remote-server` annotation.

> **Current version limitation**
>
> A workload reserves the entire GPU server exclusively. Set the GPU count to the Server's physical GPU count, because the endpoint exposes all its GPUs. A smaller memory limit does not allow other workloads to share the remaining Server capacity. Run the test Pods below sequentially, or use a different GPU Server for each.

### Preparing the client environment

After receiving a remote GPU allocation, an application must be able to load the client libraries and know which Server to connect to.

HAMi uses init containers to deliver Lupine client libraries and a compatible `nvidia-smi`, mounts the libraries into the application container, and injects the selected Server's address through `LUPINE_SERVER`. When memory limits are enabled, it also delivers HAMi-core and adds it to the call chain through `LD_PRELOAD` to enforce the memory quota.

For a workload with a memory quota, the following excerpt shows the injected init containers and key settings:

> HAMi injects these fields; they do not need to be specified when creating the workload.

~~~yaml
spec:
  initContainers:
    - name: hami-remote-gpu-lib
      image: docker.m.daocloud.io/projecthami/hami:v2.11.0
      volumeMounts:
        - name: hami-remote-gpu-lib
          mountPath: /hami-remote-gpu
    - name: hami-lupine-client
      image: ghcr.io/lupinemachines/lupine-client:cuda-13.3.1-ubuntu24.04
      volumeMounts:
        - name: hami-lupine-client
          mountPath: /lupine-lib
  containers:
    - name: vllm
      env:
        - name: LUPINE_SERVER
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['hami.io/lupine-endpoint']
        - name: LD_PRELOAD
          value: /hami-remote-gpu/libvgpu.so
        - name: CUDA_DEVICE_MEMORY_LIMIT
          value: 15360m
      volumeMounts:
        - name: hami-remote-gpu-lib
          mountPath: /hami-remote-gpu
        - name: hami-lupine-client
          mountPath: /opt/lupine/lib
          readOnly: true
  volumes:
    - name: hami-remote-gpu-lib
      emptyDir: {}
    - name: hami-lupine-client
      emptyDir: {}
~~~

Both shared volumes use `emptyDir`. The init containers write the files first; the application container then mounts and uses them.

### Starting the application and making remote CUDA calls

Once the client environment is ready, the application starts on the CPU Client. Its CUDA calls are forwarded through the client library to the allocated GPU Server, which performs the GPU computation and returns the results.

## Environment preparation and deployment

### Preparing the Kubernetes cluster

Prepare a Kubernetes cluster with a GPU node and a CPU-only node.

The manifests and output use example node names throughout. Replace them with your actual node names when reproducing the setup.

| Item | Environment | Exit code |
| --- | --- | --- |
| GPU Server | gpu-server-01, 8 vCPU, 16 GiB RAM, Tesla T4 15360 MiB | 0 |
| CPU Client | cpu-client-01, 4 vCPU, approximately 8 GiB RAM, CPU-only node | 0 |
| Kubernetes / containerd | v1.37.0 / 2.2.4 |  |
| HAMi | v2.11.0 |  |

Pods on the CPU Client must be able to reach the GPU Server's InternalIP. The default server port is TCP 14833.

Inspect the cluster nodes. Replace node names in the subsequent commands and YAML with those from your cluster.

~~~bash
kubectl get nodes
~~~

Both nodes are Ready in this environment.

~~~plain text
NAME            STATUS   ROLES           VERSION
cpu-client-01   Ready    <none>          v1.37.0
gpu-server-01   Ready    control-plane   v1.37.0
~~~

The GPU Server in this example also serves as the master (control-plane) node. If it has a control-plane `NoSchedule` taint, remove it before deployment so that the HAMi Device Plugin and Lupine Server can be scheduled there.

### Deploying GPU Operator

Use GPU Operator to install the NVIDIA Driver, Container Toolkit, and monitoring components. Disable the native NVIDIA Device Plugin so HAMi can manage the GPUs afterward.

Use GPU Operator to install the NVIDIA Driver, Container Toolkit, and monitoring components. Disable the native NVIDIA Device Plugin so HAMi can manage the GPUs afterward.

~~~bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

helm upgrade --install gpu-operator nvidia/gpu-operator \
  -n gpu-operator --create-namespace \
  --version=v26.3.1 \
  --set driver.enabled=true \
  --set devicePlugin.enabled=false \
  --wait
~~~

> If the node already has an NVIDIA Driver installed, set `driver.enabled` to `false`.

### Installing HAMi and enabling Remote GPU

~~~bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update hami-charts
~~~

First install HAMi with Remote GPU enabled:

~~~bash
kubectl get runtimeclass

helm upgrade --install hami hami-charts/hami \
  --version 2.11.0 -n hami-system --create-namespace \
  --set devices.remotegpu.enabled=true \
  --set devices.nvidia.runtimeClassName=nvidia \
  --set devices.remotegpu.server.runtimeClassName=nvidia \
  --wait
~~~

After installation, update the Device Plugin's node configuration to switch the GPU Server to `remote` mode:

~~~bash
kubectl -n hami-system patch configmap hami-device-plugin \
  --type=merge --patch-file=/dev/stdin <<'EOF'
data:
  config.json: |
    {
      "nodeconfig": [
        {
          "name": "gpu-server-01",
          "operatingmode": "remote"
        }
      ]
    }
EOF

kubectl -n hami-system rollout restart daemonset/hami-device-plugin
kubectl -n hami-system rollout status daemonset/hami-device-plugin --timeout=180s
~~~

The Device Plugin adds the discovery label to the GPU Server, and the remote server is then scheduled to that node.

Finally, label the node `gpu=on`. HAMi does not take over unlabeled nodes.

~~~bash
# kubectl label nodes {nodeid} gpu=on
kubectl label nodes gpu-server-01 gpu=on --overwrite
~~~

### Checking the deployment

Check that the GPU Server has the `hami.io/lupine-server` label and that HAMi's components are ready.

~~~bash
kubectl get nodes -l hami.io/lupine-server -o wide
kubectl -n hami-system get pods -o wide
~~~

The component status in this environment is shown below.

~~~plain text
NAME                             READY   STATUS    NODE
hami-device-plugin-cphp2         2/2     Running   gpu-server-01
hami-lupine-server-4xjb8         1/1     Running   gpu-server-01
hami-scheduler-c9c5cf696-lgvgn   2/2     Running   cpu-client-01
~~~

Query the GPU inside the remote server container to confirm that the Server can access the device.

~~~bash
kubectl -n hami-system exec daemonset/hami-lupine-server -- \
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
~~~

The output from this environment is shown below.

~~~plain text
Tesla T4, 15360 MiB
~~~

The GPU Server is now ready. Next, run CUDA Samples and vLLM on the CPU Client to validate remote GPU allocation and actual computation.

## Hands-on validation

### Inspecting the remote GPU first

Create a Pod that stays running on the CPU node, then use `kubectl exec` to run `nvidia-smi` and confirm that the container can see the remote GPU. Create `remote-gpu-smi.yaml` and replace its `nodeSelector` with the actual CPU node name.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: remote-gpu-smi
  namespace: default
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  restartPolicy: Never
  containers:
    - name: smi
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/remote-gpu: 1
~~~

Create the Pod, wait for the container to become ready, and inspect its scheduled node.

~~~bash
kubectl apply -f remote-gpu-smi.yaml
~~~

The Pod runs on CPU node `cpu-client-01`.

~~~plain text
NAME             READY   STATUS    RESTARTS   AGE   IP              NODE         NOMINATED NODE   READINESS GATES
remote-gpu-smi   1/1     Running   0          13s   172.25.58.225   cpu-client-01   <none>           <none>
~~~

Run the query inside the container through `kubectl exec`.

~~~bash
kubectl exec remote-gpu-smi -c smi -- nvidia-smi
~~~

The full `nvidia-smi` output follows.

~~~plain text
Tue Nov 10 04:25:13 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 615.71.09              KMD Version: 580.178.04    CUDA UMD Version: 13.3     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla T4 (via lupine 172...    Off |   00000000:00:06.0 Off |                    0 |
| N/A   34C    P8             15W /   70W |       0MiB /  15360MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
~~~

The remote Tesla T4 and its 15360 MiB of memory are visible, with `via lupine` in the device name.

The Pod stays running through `sleep` and retains its remote GPU allocation. Delete the test Pod after inspection before running the CUDA examples.

~~~bash
kubectl delete pod remote-gpu-smi
~~~

### Running NVIDIA's official CUDA Samples

Validate CUDA independently before loading a model. We use two basic NVIDIA CUDA Samples to check device discovery and actual computation separately.

| Sample | Validation | Result |
| --- | --- | --- |
| deviceQuery | Query device count, name, compute capability, and memory through CUDA Runtime | 1 Tesla T4 found, compute capability 7.5, visible memory 3000 MiB, Result = PASS |
| vectorAdd | Allocate GPU memory, upload input, run a vector addition kernel, return results, and validate each element on the CPU | 50,000 elements computed correctly, Test PASSED |

The no-device branch of `deviceQuery` can also print PASS, so check both the device count and name. The manifest adds a device-count check; `vectorAdd` then validates data transfer and the kernel's computed results.

Prepare the source code on the CPU Client first. Pin it to `v13.0`, matching CUDA 13.0 in the image.

~~~bash
git clone --depth 1 --branch v13.0 --filter=blob:none --sparse \
  https://github.com/NVIDIA/cuda-samples.git /opt/cuda-samples-hami-v13.0
git -C /opt/cuda-samples-hami-v13.0 sparse-checkout set \
  Common Samples/1_Utilities/deviceQuery Samples/0_Introduction/vectorAdd
~~~

Create `cuda-samples-pod.yaml` and replace `nodeSelector` with the actual CPU node name.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: cuda-samples-remote
  namespace: default
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  restartPolicy: Never
  containers:
    - name: cuda-samples
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["bash", "-ec"]
      args:
        - |
          set -o pipefail
          NVCC=/usr/local/cuda-13.0/bin/nvcc
          cd /tmp

          "$NVCC" -std=c++17 -O2 -arch=sm_75 -I/samples/Common \
            /samples/Samples/1_Utilities/deviceQuery/deviceQuery.cpp -o deviceQuery
          "$NVCC" -std=c++17 -O2 -arch=sm_75 -I/samples/Common \
            /samples/Samples/0_Introduction/vectorAdd/vectorAdd.cu -o vectorAdd

          ./deviceQuery | tee /tmp/device-query.log
          grep -Eq 'Detected [1-9][0-9]* CUDA Capable device' /tmp/device-query.log
          ./vectorAdd
          echo "REMOTE CUDA SAMPLES PASS"
      resources:
        requests:
          cpu: "1"
          memory: 1Gi
        limits:
          cpu: "2"
          memory: 2Gi
          nvidia.com/remote-gpu: 1
          nvidia.com/remote-gpu-memory: 3000
      volumeMounts:
        - name: samples
          mountPath: /samples
          readOnly: true
  volumes:
    - name: samples
      hostPath:
        path: /opt/cuda-samples-hami-v13.0
        type: Directory
~~~

Create the Pod from a terminal with cluster access and wait for completion.

~~~bash
kubectl apply -f cuda-samples-pod.yaml
kubectl logs cuda-samples-remote -c cuda-samples
~~~

The Pod runs on a CPU-only node. Its output follows:

~~~plain text
Detected 1 CUDA Capable device(s)
Device 0: "Tesla T4"
Result = PASS
~~~

~~~plain text
[Vector addition of 50000 elements]
Test PASSED
Done
REMOTE CUDA SAMPLES PASS
~~~

Delete the Pod when finished to release the Server reservation before running vLLM.

~~~bash
kubectl delete pod cuda-samples-remote
~~~

### Deploying vLLM on the CPU node

> First prepare the `Qwen2.5-0.5B-Instruct` model on the CPU Client in `/opt/models/Qwen2.5-0.5B-Instruct`.

Create `vllm-remote.yaml`.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: vllm-remote
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  containers:
    - name: vllm
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["vllm", "serve", "/models/Qwen2.5-0.5B-Instruct"]
      args:
        - --served-model-name=qwen
        - --dtype=float16
        - --gpu-memory-utilization=0.7
        - --max-model-len=1024
        - --max-num-seqs=4
        - --enforce-eager
        - --attention-config.backend=TRITON_ATTN
      env:
        - name: TORCH_BLAS_PREFER_CUBLASLT
          value: "0"
        - name: CUDA_LAUNCH_BLOCKING
          value: "1"
      readinessProbe:
        httpGet:
          path: /health
          port: 8000
      resources:
        limits:
          nvidia.com/remote-gpu: 1
      volumeMounts:
        - name: models
          mountPath: /models
          readOnly: true
  volumes:
    - name: models
      hostPath:
        path: /opt/models
~~~

The Pod requests one remote GPU. `gpu-memory-utilization=0.7` controls the fraction of GPU memory used by vLLM.

`--enforce-eager` and `CUDA_LAUNCH_BLOCKING=1` follow the official example.

Create the Pod, wait for the service to become ready, then inspect its placement and startup logs.

~~~bash
kubectl apply -f vllm-remote.yaml

kubectl get pod vllm-remote \
  -o jsonpath='{.spec.nodeName}{"\n"}{.metadata.annotations.hami\.io/lupine-endpoint}{"\n"}'
~~~

The allocation result in this environment follows.

~~~plain text
cpu-client-01
172.16.131.132:14833
~~~

After the Pod enters Running, continue waiting for the model to load. A 200 response from `/health` indicates service readiness. Run `nvidia-smi` on the GPU Server host to inspect memory usage and process information.

~~~bash
nvidia-smi
~~~

The full output after the model loaded follows.

~~~plain text
Tue Nov 10 05:55:16 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.178.04             Driver Version: 580.178.04     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla T4                       Off |   00000000:00:06.0 Off |                    0 |
| N/A   41C    P0             28W /   70W |   10765MiB /  15360MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A         3442254      C   ...pine/bin/lupine_driver_server        122MiB |
|    0   N/A  N/A         3443585      C   ...pine/bin/lupine_driver_server      10640MiB |
+-----------------------------------------------------------------------------------------+
~~~

The T4's memory usage has risen to 10765 MiB. The `lupine_driver_server` entries are remote service processes on the GPU Server that execute GPU computation. The vLLM application process runs on the CPU Client.

From a machine with access to the cluster's Pod network, send a request through the OpenAI-compatible API. Here, the GPU node requests the vLLM service on the CPU node.

~~~bash
POD_IP=$(kubectl get pod vllm-remote \
  -o jsonpath='{.status.podIP}')
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' \
  "http://${POD_IP}:8000/health"

curl --fail-with-body "http://${POD_IP}:8000/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen","messages":[{"role":"user","content":"用一句话解释 Kubernetes。"}],"max_tokens":64,"temperature":0}'
~~~

The output follows:

> Kubernetes (K8s for short) is an open-source container orchestration platform that allows users to define and manage application deployment, execution, and scaling across multiple nodes. It lets developers easily create, manage, and maintain complex clusters of containerized applications, improving development efficiency and resource utilization.

We have now successfully completed an inference request using Remote GPU.

After the experiment, delete the test Pod to release the remote GPU resources.

~~~bash
kubectl delete pod vllm-remote
~~~

## Use cases and challenges

### Why deploy applications separately from GPUs?

Lupine describes itself as a GPU-over-IP bridge that lets CPU-only machines access GPUs on other machines over the network. HAMi makes the Kubernetes execution model explicit: workloads run on Client nodes while CUDA calls execute on another GPU Server. HAMi selects the Server and delivers the client libraries.

From a deployment perspective, this decouples CPU and GPU resources and manages GPUs as a distinct resource. The machine supplying an application's CPU and memory can be selected independently of the machine supplying its GPU.

Remote GPU provides another deployment option. Whether it delivers benefits must be validated against the actual workload.

### Scenarios worth exploring

This execution model suggests several possible use cases.

**1. Applications with substantial CPU or memory requirements**

Data preprocessing, postprocessing, and GPU computation can have different resource requirements. Running an application on a node with suitable CPU and memory resources while using a GPU Server for computation allows each side to be sized independently. Data transfer costs must also be assessed. A [GPU API Remoting research paper](https://arxiv.org/html/2401.13354v1#S2.SS2) likewise identifies the mismatch between fixed CPU/GPU ratios and application requirements as a motivation for resource disaggregation.

**2. Centralized GPUs with distributed applications**

Another deployment approach maintains GPUs and drivers centrally on Servers while applications on different CPU nodes access them as needed. In HAMi, begin by validating separate CPU Client and GPU Server nodes within a cluster. Sharing, isolation, and scheduling capabilities after centralization must be confirmed for the specific implementation.

**3. Development and functional testing**

Test nodes without GPUs can validate CUDA programs, frameworks, and models using remote GPUs. This article uses `nvidia-smi`, CUDA Samples, and vLLM in sequence to validate device visibility, actual CUDA computation, and inference responses. The same sequence is useful for environment checks, such as connecting a CPU-only Runner to a remote GPU to execute GPU workloads.

### What to consider before use

**1. Performance depends on both the network and the remote-call implementation**

CUDA calls and their associated data travel between Client and Server. Frequent synchronization amplifies round-trip latency, while large transfers consume bandwidth. Parameter serialization, deserialization, and call forwarding also add software overhead. [GPU API Remoting research](https://arxiv.org/html/2401.13354v1#S3) analyzes these costs and the effect of asynchronous execution. Bandwidth alone therefore cannot predict performance, nor can all throughput loss be attributed to the network. This article validates functionality; application latency and throughput still require measurement.

**2. Clients need no NVIDIA driver, but still need a compatible runtime environment**

HAMi's official documentation states that automatic library delivery currently targets the provided amd64, Ubuntu 24.04 CUDA and vLLM example images. Custom images may need library search path adjustments, and libraries loaded by absolute path require separate checks. Repeat basic computation and application tests whenever changing CUDA, framework, or image versions.

**3. Troubleshooting must cover both ends**

When application startup fails or inference is interrupted, inspect the Client, network, remote service, and GPU Server together. Recovery after connection loss or Server restarts, along with long-running stability, should be validated before production use.

## Summary

Using HAMi v2.11 Remote GPU, this article ran CUDA Samples and vLLM inference on a CPU node without a GPU or NVIDIA driver. The application process ran on the CPU Client while a T4 on another node performed GPU computation, validating the full path from remote device discovery through CUDA computation to model inference.

Remote GPU adds another deployment choice for GPU workloads. Applications can use a CPU node's compute and memory resources while accessing a GPU Server over the network. HAMi integrates remote GPU discovery, allocation, and client environment injection into its existing scheduling process, making cross-node GPU use manageable through familiar Pod resource declarations.

For platforms seeking to decouple CPU and GPU deployment and centralize GPU computation, HAMi offers a starting point worth exploring and more ways to combine AI infrastructure resources.

This article was contributed by 意琦行 to the HAMi official blog. Please retain the full text when republishing. For adaptations, please contact us first on WeChat at HAMi_community.
