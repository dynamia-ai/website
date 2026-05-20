---
title: "HAMi Enterprise: Installation Guide"
productId: "hami-enterprise"
version: "v2.9.0"
lastUpdated: "2026-05-20"
language: "en"
description: "Deploy HAMi Enterprise on Kubernetes with GPU node onboarding and monitoring integration."
---

> This guide is for SREs and platform engineers. It walks through deploying **HAMi Enterprise** to a Kubernetes cluster, enabling GPU nodes, integrating monitoring, and verifying functionality.

## Architecture & positioning

HAMi Enterprise is the enterprise edition of the open-source HAMi project. It contains:

- **Enhanced Device Plugin**: replaces NVIDIA's default device-plugin with vGPU partitioning + memory oversubscription
- **Scheduler extensions**: GPU topology-aware scheduling
- **Exporter**: HAMi metrics for Prometheus
- **Enterprise hardening**: signed images, CVE patching pipeline, long-term support

> Best fit for: multi-tenant GPU sharing, memory oversubscription, heterogeneous accelerator (NVIDIA / Ascend / Hygon DCU / etc.) unified scheduling.

## Prerequisites

| Type | Requirement | Verify |
|---|---|---|
| Kubernetes | >= 1.24 and <= 1.31 | `kubectl version --short` |
| Container runtime | containerd or Docker | `kubectl get nodes -o wide` |
| Helm | >= 3.14 | `helm version --short` |
| GPU driver | NVIDIA driver >= 470 (550+ recommended) | `nvidia-smi` |
| Prometheus | >= 2.37 (if integrating monitoring) | `kubectl get pods -A \| grep prom` |
| GPU Operator | Installed AND **devicePlugin.enabled=false** | `helm list -A \| grep gpu-operator` |

> Critical constraint: HAMi ships its own device-plugin and **conflicts with the NVIDIA GPU Operator's built-in device-plugin**. If GPU Operator is installed, you must disable its device-plugin via `--set devicePlugin.enabled=false`.

### Install NVIDIA GPU Operator (if missing)

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.0
```

## Install HAMi Enterprise

> Three install paths — pick by environment:
>
> - **All-in-One Air-gap Bundle** (recommended for isolated networks: finance, gov, telco)
> - Image bundle + Helm chart, downloaded separately (your own CI/CD)
> - Online OCI install (eval / PoC)

### Path A · All-in-One Air-gap Bundle (recommended for air-gap)

Download `hami-enterprise-vX.Y.Z-airgap-<arch>.tar.gz` — a single tarball containing everything:

```bash
# 1. Extract
tar -xzf hami-enterprise-v2.6.0-airgap-amd64.tar.gz
cd hami-enterprise-v2.6.0-airgap

# 2. Push images to your private registry (script handles retag + push)
./load-images.sh --registry harbor.intra/hami

# 3. Helm install (chart bundled in)
helm install hami ./charts/hami-enterprise-2.6.0.tgz \
  -n hami-system --create-namespace \
  --set image.registry=harbor.intra/hami

# 4. Verify
kubectl -n hami-system get pods
```

> Bundle SHA256 is shown on the download page — verify after transferring into the isolated environment.

### Path B · Separate downloads (your own pipelines)

Contact dynamia.ai sales or support to request the **HAMi Enterprise offline bundle**, which includes:

- `hami-enterprise.tgz` (Helm Chart)
- `hami-enterprise-images.tar` (image tarball)

Or install online via OCI (evaluation environments):

```bash
helm install hami oci://ghcr.io/dynamia-ai/charts/hami-enterprise --version 2.6.0 \
  -n hami-system --create-namespace
```

### Step 2 · Import offline images

```bash
# Load images
docker load < hami-enterprise-images.tar

# Push to your local registry
docker tag <image>:<tag> <your-registry>/<image>:<tag>
docker push <your-registry>/<image>:<tag>
```

### Step 3 · Helm install

```bash
helm install hami hami-enterprise.tgz \
  -n hami-system --create-namespace \
  --set scheduler.serviceMonitor.enabled=true \
  --set devicePlugin.serviceMonitor.enabled=true
```

> For air-gapped environments, also pass `--set image.registry=<your-registry>` to point at your local registry.

## Enable GPU nodes

The HAMi device plugin only starts on nodes labeled `gpu=on`:

```bash
kubectl label nodes <node-name> gpu=on
```

> Verify: `kubectl -n hami-system get pods` should show `hami-device-plugin-*` and `hami-scheduler-*` in `Running` state.

## Monitoring integration

Make sure Prometheus can scrape HAMi and DCGM-Exporter metrics.

> The ServiceMonitor's `metadata.labels` must match Prometheus's `spec.serviceMonitorSelector` — otherwise Prometheus won't discover them.

### Verify metrics

| Exporter | Query | Expected |
|---|---|---|
| dcgm-exporter | `DCGM_FI_DEV_GPU_UTIL` | non-empty value |
| hami-exporter | `HostCoreUtilization` | non-empty value |
| hami-device-plugin-exporter | `GPUDeviceCoreAllocated` | non-empty value |

## Post-install verification

```bash
# 1. Pod status
kubectl -n hami-system get pods

# 2. Device Plugin GPU resources
kubectl describe node <gpu-node> | grep -A 5 'Capacity:'
# Expect: nvidia.com/gpu: <N> and nvidia.com/gpumem: <MB>

# 3. Submit a test pod to verify scheduling
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: hami-smoke
spec:
  containers:
  - name: cuda
    image: nvidia/cuda:12.4.0-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
        nvidia.com/gpumem: 2000
EOF

kubectl logs hami-smoke
```

Expected: `nvidia-smi` shows the GPU and memory is capped at 2000 MiB.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| device-plugin pod stuck `Pending` | Node missing `gpu=on` label | `kubectl label nodes <node> gpu=on` |
| device-plugin pod `CrashLoopBackOff` | Conflict with NVIDIA's default device-plugin | Disable via `--set devicePlugin.enabled=false` on GPU Operator |
| Prometheus missing HAMi metrics | ServiceMonitor labels don't match selector | Align `spec.serviceMonitorSelector` |
| `nvidia-smi` errors | GPU driver not ready | Inspect driver pod in `gpu-operator` namespace |
| Helm install image pull fails | Offline images not loaded | Run `docker load` + `docker push` to local registry |

## Get support

- Email: [info@dynamia.ai](mailto:info@dynamia.ai)
- Documentation: [docs.dynamia.ai/hami-enterprise](https://docs.dynamia.ai/hami-enterprise)
- Customers under commercial contract: please use your dedicated support channel for issues

> **Enterprise SLA**: HAMi Enterprise ships 24/7 support, hotfix response, and long-term release maintenance.
