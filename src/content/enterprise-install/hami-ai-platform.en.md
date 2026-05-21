---
title: "HAMi AI Platform: Installation Guide"
productId: "hami-ai-platform"
version: "v2.9.0"
lastUpdated: "2026-05-20"
language: "en"
description: "Deploy HAMi AI Platform on Kubernetes — component dependencies and verification steps."
---

> This guide is for SREs and platform engineers. It walks through deploying **HAMi AI Platform** to a Kubernetes cluster and integrating with HAMi, Prometheus, NVIDIA GPU Operator, Gateway API and other foundational components.

## Architecture & positioning

HAMi AI Platform is a Kubernetes-native application platform that provides unified scheduling, tenant quota, monitoring and developer workspaces for heterogeneous compute clusters. Key characteristics:

- **Federated control plane**: connects to the Dynamia cloud control plane; one tenant manages many clusters
- **Unified UI**: built-in admin, monitoring and user consoles
- **Open & composable**: relies on standard K8s ecosystem (Prometheus, Helm, Gateway API, HAMi device plugin)

> Before you start, complete the **Prerequisites** section to make sure your cluster meets the minimum requirements.

## Prerequisites

Run the checks below on **each Kubernetes cluster you plan to onboard**:

| Type | Requirement | Verify |
|---|---|---|
| Kubernetes | version >= 1.24 and <= 1.31 | `kubectl version --short` |
| Container runtime | containerd or Docker | `kubectl get nodes -o wide` (CONTAINER-RUNTIME column) |
| Helm | >= 3.14 | `helm version --short` |
| GPU driver | NVIDIA driver >= 440 (550+ recommended) | `nvidia-smi` |
| Egress / registry | reachable image registry or pre-loaded offline bundle | `curl -I <registry>` |
| Cluster storage | default StorageClass configured | `kubectl get sc` |

### Install Helm (if missing)

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

Reference: [Helm install docs](https://helm.sh/docs/intro/install/)

### Container runtime

containerd is the default runtime for Kubernetes 1.24+. See [Kubernetes container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/).

> For air-gapped environments, pre-download all Helm charts and images and serve them from a local registry.

## Component dependencies

HAMi AI Platform depends on the components below. **Install in the documented order** — out-of-order installs will fail later verification.

### Prometheus

HAMi AI Platform relies on Prometheus for cluster monitoring. Bring your own or install fresh.

**Install fresh (recommended for evaluation):**

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  --set grafana.enabled=false \
  --version=75.15.1
```

> If reusing an existing Prometheus: version must be >= 2.37.0. Capture the labels in `prometheus.spec.serviceMonitorSelector` — you'll use them in the ServiceMonitor section below.

### NVIDIA GPU Operator

Because HAMi ships an enhanced device-plugin, you must **disable GPU Operator's built-in device-plugin**.

**Install:**

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.0
```

**Verify GPU driver:**

```bash
# Exec into nvidia-driver-daemonset pod
kubectl -n gpu-operator exec -it \
  $(kubectl get pods -n gpu-operator -l app=nvidia-driver-daemonset -o name | head -1) \
  -- nvidia-smi
```

Sample output:

```text
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.144.03             Driver Version: 550.144.03     CUDA Version: 12.4     |
+-----------------------------------------------------------------------------------------+
|   0  Tesla P4                       On  |   00000000:03:00.0 Off |                  Off |
| N/A   31C    P8              6W /   75W |       0MiB /   8192MiB |      0%      Default |
+-----------------------------------------------------------------------------------------+
```

> Troubleshooting: [NVIDIA GPU Operator troubleshooting guide](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/troubleshooting.html)

### HAMi Enterprise

Contact dynamia.ai sales/support for the **HAMi Enterprise offline bundle** (`hami.tgz` Helm chart + image tarball).

**Step 1 · Import images to a registry the cluster can reach**

```bash
# Load images
docker load < hami-images.tar
docker tag <image>:<tag> <your-registry>/<image>:<tag>
docker push <your-registry>/<image>:<tag>
```

**Step 2 · Helm install HAMi**

```bash
helm install hami hami.tgz \
  -n hami-system --create-namespace \
  --set scheduler.serviceMonitor.enabled=true \
  --set devicePlugin.serviceMonitor.enabled=true
```

**Step 3 · Label GPU nodes**

The HAMi device plugin only starts on nodes labeled `gpu=on`:

```bash
kubectl label nodes <node-name> gpu=on
```

> Verify: `kubectl -n hami-system get pods` should show `hami-device-plugin-*` and `hami-scheduler-*` in `Running` state.

### ServiceMonitor integration

Make sure Prometheus can scrape HAMi and DCGM-Exporter metrics.

> Important: ServiceMonitor `metadata.labels` must match Prometheus's `spec.serviceMonitorSelector`, otherwise Prometheus will not discover them.

**Verify metrics scraping** (via Prometheus UI / API):

| Exporter | Query | Expected |
|---|---|---|
| dcgm-exporter | `DCGM_FI_DEV_GPU_UTIL` | non-empty |
| hami-exporter | `HostCoreUtilization` | non-empty |
| hami-device-plugin-exporter | `GPUDeviceCoreAllocated` | non-empty |

> Troubleshooting: if metrics are missing, first confirm `kubectl get servicemonitor -A` shows the ServiceMonitor, then check label selector alignment.

### Gateway API

Gateway API routes workspace traffic for VSCode / SSH / Jupyter etc.

**Choose one:**

| Option | When to use | Action |
|---|---|---|
| A · Use existing Gateway | You already run Istio / Envoy / Cilium / etc. with Gateway API | Provide listener / endpoint to install command |
| B · Install Envoy Gateway | Evaluation env or no existing gateway | Follow [Envoy Gateway install guide](https://gateway.envoyproxy.io/docs/install/install-helm/) |

## Install HAMi AI Platform

> Three install paths — pick by environment:
>
> - **All-in-One Air-gap Bundle** (recommended for air-gap; one tarball, all artifacts)
> - Image bundle + Helm chart, downloaded separately (your own pipelines)
> - Online OCI install (eval / PoC)

### Path A · All-in-One Air-gap Bundle (recommended)

```bash
# 1. Extract
tar -xzf hami-ai-platform-v2.9.0-airgap-amd64.tar.gz
cd hami-ai-platform-v2.9.0-airgap

# 2. Push images to your private registry
./load-images.sh --registry harbor.intra/hami

# 3. Helm install (chart bundled in)
helm install hami-ai-platform ./charts/hami-ai-platform-2.9.0.tgz \
  -n hami-ai-platform-system --create-namespace \
  --set image.registry=harbor.intra/hami
```

### Path B · Separate downloads

**Helm install:**

```bash
helm install hami-ai-platform hami-ai-platform.tgz \
  -n hami-ai-platform-system --create-namespace
```

**Or install online via OCI:**

```bash
helm install hami-ai-platform \
  oci://ghcr.io/dynamia-ai/charts/hami-ai-platform \
  --version 2.9.0 \
  -n hami-ai-platform-system --create-namespace
```

> Pass `--set` or `-f values.yaml` for custom configuration (external Prometheus endpoint, Gateway endpoint, image registry etc.). See the chart's bundled `values.yaml` for the full field reference.

## Post-install verification

```bash
# 1. Pod status
kubectl -n hami-ai-platform-system get pods

# 2. Service reachability
kubectl -n hami-ai-platform-system get svc

# 3. CRD registration
kubectl get crds | grep hami-ai-platform

# 4. Cluster onboarding state (if connected to cloud control plane)
kubectl -n hami-ai-platform-system get clusters
```

Expected: all pods `Running`, no `CrashLoopBackOff`; CRDs include `clusters.hami-ai-platform.dynamia.ai` and other core resources.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| HAMi device-plugin pod stuck `Pending` | Node missing `gpu=on` label | `kubectl label nodes <node> gpu=on` |
| Prometheus missing HAMi metrics | ServiceMonitor labels don't match | Align `spec.serviceMonitorSelector` |
| `nvidia-smi` errors | GPU driver not ready | Inspect driver pod in `gpu-operator` namespace |
| Helm install image pull fails | Offline images not loaded | Run `docker load` + `docker push` to local registry |
| dynamia.ai pod `ImagePullBackOff` | Wrong image registry in values.yaml | Check `image.registry` / `image.repository` |

## Get support

- Email: [info@dynamia.ai](mailto:info@dynamia.ai)
- Customers under commercial contract: please use your dedicated support channel for issues

> **Enterprise SLA**: Both HAMi Enterprise and HAMi AI Platform come with 24/7 support, hotfix response and long-term release maintenance.
