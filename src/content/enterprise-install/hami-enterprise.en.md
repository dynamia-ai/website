---
title: "HAMi Enterprise: Installation Guide"
productId: "hami-enterprise"
version: "v2.9.0"
lastUpdated: "2026-05-20"
language: "en"
description: "Deploy HAMi Enterprise on Kubernetes with GPU node onboarding, monitoring integration, and license activation."
---

> This guide is for SREs and platform engineers. It walks through deploying **HAMi Enterprise** to a Kubernetes cluster, enabling GPU nodes, integrating monitoring, and verifying functionality.
>
> ⚠️ **Installation ≠ Activation**
>
> After completing the Helm installation in this section, HAMi Enterprise core components will be running. However, **GPU virtualization and scheduling features require a license activation to work properly**.
> The installation itself does not depend on a license, so you can complete the deployment first, then apply for and import the license in the subsequent steps.
>
> In short: **Install the software first, then obtain the license; vGPU partitioning and scheduling will not work without activation, and verification will fail.**

## Architecture & Positioning

HAMi Enterprise is the enterprise edition of the open-source HAMi project. It contains:

- **Enhanced Device Plugin**: replaces NVIDIA's default device-plugin with vGPU partitioning + memory oversubscription
- **Scheduler Extensions**: GPU topology-aware scheduling
- **Exporter**: HAMi metrics for Prometheus
- **Enterprise Hardening**: signed images, CVE patching pipeline, long-term support

> Best fit for: multi-tenant GPU sharing, memory oversubscription, heterogeneous accelerator (NVIDIA / Ascend / Hygon DCU / etc.) unified scheduling.

## Prerequisites

| Type              | Requirement                                                                   | Verify                              |
|-------------------|-------------------------------------------------------------------------------|-------------------------------------|
| Kubernetes        | >= 1.24                                                                       | `kubectl version --short`           |
| Container Runtime | containerd or Docker                                                          | `kubectl get nodes -o wide`         |
| Helm              | >= 3.14                                                                       | `helm version --short`              |
| GPU Driver        | NVIDIA driver >= 470 (>= 550 recommended)                                     | `nvidia-smi`                        |
| Prometheus        | >= 2.37 (if integrating monitoring)                                           | `kubectl get pods -A \| grep prom`  |
| GPU Operator      | Installed AND **devicePlugin.enabled = false** (recommended version: v25.3.2) | `helm list -A \| grep gpu-operator` |

> Critical constraint: HAMi ships its own device-plugin and **conflicts with the NVIDIA GPU Operator's built-in device-plugin**. If GPU Operator is installed, you must disable its device-plugin via `--set devicePlugin.enabled=false`.

## Install HAMi Enterprise

> Two installation paths — choose based on your scenario:
>
> - Online OCI install (evaluation, PoC, clusters with external network access)
> - All-in-One Air-gap Bundle (finance / government / telecom isolated networks)
>
> Regardless of path, you must apply for and activate a license at the end.

### Path A: Online OCI Chart Install

**If you wish to use a Chinese domestic mirror registry, please contact Dynamia.ai sales/support for details.**

**We recommend using a version tracking system to maintain values files for all Helm releases in the cluster.** Use `-f example-values.yaml` to override corresponding keys in the chart's default values.

After selecting the correct kubeconfig context, proceed:

If you haven't installed `nvidia/gpu-operator` yet, install it first.

```sh
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.2
```

If the cluster doesn't have a Prometheus monitoring stack, you'll also need to install one. Here's how to install `prometheus-community/kube-prometheus-stack`:

```sh
helm install prometheus \
  oci://ghcr.io/prometheus-community/charts/kube-prometheus-stack \
  --version 72.3.0 \
  --namespace monitoring \
  --create-namespace \
  --set alertmanager.enabled=false \
  --set grafana.enabled=false
```

Install `dynamia-ai/hami-enterprise(hami-commercial)`:

```sh
helm install hami \
  oci://ghcr.io/dynamia-ai/hami-commercial/hami \
  --version 2.9.0-rc1 \
  --namespace hami-system \
  --create-namespace
```

`hami-enterprise(hami-commercial)` common chart customization options are listed below. For the complete values reference, see: [HAMi Helm Values Reference](/attachments/hami-helm-values).

| Parameter | Description | Default |
|---|---|---|
| `dra.enabled` | Enable [DRA](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/) | `false` |
| `scheduler.leaderElect` | Enable leader election for `hami-scheduler` | `true` |
| `scheduler.replicas` | Number of `hami-scheduler` replicas | 1 |
| `scheduler.kubeScheduler.image.registry` | Registry for `kube-scheduler` image used by `hami-scheduler` | `"registry.cn-hangzhou.aliyuncs.com"` |
| `scheduler.kubeScheduler.image.repository` | Repository for `kube-scheduler` image used by `hami-scheduler` | `"google-containers/kube-scheduler"` |
| `scheduler.kubeScheduler.image.tag` | Tag for `kube-scheduler` image used by `hami-scheduler`. If empty, the chart will infer an appropriate version. | `""` |

### Path B: All-in-One Air-gap Bundle

**Please contact Dynamia.ai sales/support to obtain the download URL.**

Download `hami-enterprise-v<VERSION>-airgap-<ARCH>.tar.gz` and `hami-enterprise-v<VERSION>-airgap-<ARCH>.tar.gz.sha256`.

The `hami-enterprise` air-gap bundle includes `dynamia-ai/hami-enterprise`, `nvidia/gpu-operator`, and `prometheus-community/kube-prometheus-stack`. Install as needed.

```bash
# Download
curl -L -O <URL>
# Or: wget <URL>

# Extract outer tar.gz
# macOS
tar -xzf hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
# Linux (GNU tar)
tar -xaf hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
```

Verify integrity:

```sh
# Linux / macOS
shasum -a 256 -c hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz.sha256

# Or manually compare
shasum -a 256 hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
cat hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz.sha256
```

For the subsequent installation steps, refer to the extracted `DEPLOY.md` file.

## Enable GPU Nodes

The HAMi device plugin only starts on nodes labeled `gpu=on`:

```bash
kubectl label nodes <node-name> gpu=on
```

> Verify: `kubectl -n hami-system get pods` should show `hami-device-plugin-*` and `hami-scheduler-*` in `Running` state.

## Monitoring Integration

Ensure Prometheus can scrape HAMi and DCGM-Exporter metrics.

> The ServiceMonitor resource's `metadata.labels` must match Prometheus's `spec.serviceMonitorSelector` — otherwise Prometheus won't discover these monitors.

### Verify Metrics Collection

| Exporter                      | Query                    | Expected        |
| ----------------------------- | ------------------------ | --------------- |
| `dcgm-exporter`               | `DCGM_FI_DEV_GPU_UTIL`   | non-empty value |
| `hami-exporter`               | `HostCoreUtilization`    | non-empty value |
| `hami-device-plugin-exporter` | `GPUDeviceCoreAllocated` | non-empty value |

## License Activation

**Please complete the above installation steps and ensure all component pods are running before proceeding with activation.**

Run the following script to collect license information (requires kubectl, jq):

```bash
# Online install
curl -fsSL https://dynamia.ai/scripts/collect-hami-license-info.sh | bash

# Air-gap install (bundled in the package)
bash collect-hami-license-info.sh
```

After execution, you will see JSON output like:

```json
{
  "kube_system_uid": "bd8bce4f-f440-48e0-bf74-4ea2b6419c8b",
  "collection_time": "2026-05-28T03:00:39Z",
  "hami_install_location_namespace": "hami-system",
  "total_licenses": 1,
  "licenses": [
    {
      "uuid": "GPU-6762ec8e-2ce2-9ae4-df13-3e2e5cf17e53",
      "reminder": 10,
      "expire": "2026-06-21T10:04:41.468Z",
      "node_name": "172.28.135.11"
    }
  ]
}
```

**Send this information to Dynamia.ai sales/support to obtain your license.**

## Post-Activation Verification

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
  restartPolicy: Never
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

Expected: `nvidia-smi` shows GPU information with memory capped at 2000 MiB.

## Troubleshooting

| Symptom                                | Likely Cause                                                       | Fix                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Images fail to pull                    | Node has no external network or poor connectivity to ghcr.io       | Contact Dynamia.ai sales/support for domestic mirror registry or the All-in-One air-gap bundle                                     |
| device-plugin pod `Pending` or missing | Node not labeled `gpu=on`                                          | `kubectl label nodes <node> gpu=on`                                                                                                |
| device-plugin pod `CrashLoopBackOff`   | Conflict with NVIDIA's default device-plugin                       | Disable GPU Operator's devicePlugin (`--set devicePlugin.enabled=false`)                                                           |
| Prometheus missing HAMi metrics        | serviceMonitorNamespaceSelector doesn't match ServiceMonitor label | Align `prometheus/prometheus-kube-prometheus-prometheus` `.spec.serviceMonitorSelector` with hami-enterprise serviceMonitor labels |
| `nvidia-smi` errors                    | GPU driver not ready                                               | Check driver pod status in `gpu-operator` namespace                                                                                |

## Get Support

- Email: [info@dynamia.ai](mailto:info@dynamia.ai)
- Sales / Support: 400-026-7800
