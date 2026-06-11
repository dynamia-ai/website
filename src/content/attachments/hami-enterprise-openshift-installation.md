---
title: "HAMi Enterprise on OpenShift: Installation Guide"
slug: "hami-enterprise-openshift-installation"
description: "Deploy HAMi Enterprise on OpenShift with NVIDIA GPU Operator, SCC review, monitoring integration, and post-install verification guidance."
productId: "hami-enterprise"
lastUpdated: "2026-06-11"
language: "en"
---

> This is a dedicated OpenShift guide for **HAMi Enterprise**. It should be used together with the generic [HAMi Enterprise installation guide](/products/hami-enterprise/install), but it replaces the Kubernetes-specific assumptions that usually do not hold on OpenShift.

## When to Use This Guide

Use this document if your target platform is:

- Red Hat OpenShift Container Platform (OCP)
- A managed OpenShift offering
- An OpenShift-based internal platform with SCC enforcement and cluster-owned monitoring

If you are deploying to a standard upstream Kubernetes cluster, use the main [HAMi Enterprise installation guide](/products/hami-enterprise/install) instead.

## What Changes on OpenShift

Compared with a generic Kubernetes install, OpenShift usually changes four things that matter to HAMi:

1. **Security model**: OpenShift SCC defaults can block pods that need device-plugin or host-path style access.
2. **GPU Operator lifecycle**: clusters often manage NVIDIA GPU Operator through OperatorHub and `ClusterPolicy`, not only through raw Helm commands.
3. **Monitoring ownership**: many OpenShift clusters already have a platform monitoring stack, so installing an additional Prometheus stack is often the wrong default.
4. **Scheduler image compatibility**: `hami-scheduler` must use a `kube-scheduler` image compatible with the cluster's OpenShift minor version. Do not rely on the chart's automatic inference here.

## Prerequisites

Run the checks below before installing HAMi Enterprise on OpenShift:

| Type | Requirement | Verify |
| --- | --- | --- |
| OpenShift | A supported OpenShift cluster with GPU worker nodes | `oc version` |
| Access | Cluster-admin or equivalent permissions to review SCC, install operators, and create cluster-scoped resources | `oc auth can-i '*' '*' --all-namespaces` |
| Helm | Helm 3.14 or newer | `helm version --short` |
| GPU Driver | NVIDIA driver installed and healthy on GPU nodes | `nvidia-smi` on node or GPU Operator status |
| GPU Operator | Installed, with NVIDIA's built-in device plugin disabled | check `ClusterPolicy` or installed release config |
| Monitoring decision | You have decided whether to use OpenShift monitoring or a self-managed Prometheus stack | platform-specific |
| Registry access | Worker nodes can pull required images, or mirrored registries are prepared | image pull test / cluster mirror config |

> In the commands below, `oc` is used for clarity. Because OpenShift is Kubernetes-compatible, many `kubectl` commands still work, but operationally it is better to document the OpenShift path explicitly.

## OpenShift-Specific Design Decisions

Before installation, make these decisions explicitly:

### 1. How will GPU Operator be managed?

Preferred:

- Managed through OpenShift OperatorHub and `ClusterPolicy`

Acceptable:

- Managed through Helm if your platform team already standardizes on that path

Either way, the key requirement stays the same: **NVIDIA's built-in device plugin must be disabled**, because HAMi ships its own device plugin.

### 2. Which monitoring stack owns ServiceMonitor discovery?

Preferred:

- Existing OpenShift monitoring stack
- Existing OpenShift user-workload monitoring stack

Fallback:

- A self-managed Prometheus stack

Do not assume `kube-prometheus-stack` should be installed by default on OpenShift. On many clusters, that creates ownership overlap instead of solving a problem.

### 3. Which `kube-scheduler` image will `hami-scheduler` use?

On OpenShift, you should **explicitly set**:

- `scheduler.kubeScheduler.image.registry`
- `scheduler.kubeScheduler.image.repository`
- `scheduler.kubeScheduler.image.tag`

The image should come from a source that matches your cluster's OpenShift release compatibility expectations. Do not rely on the chart's default registry/repository inference.

## Prepare Values for OpenShift

Create a values file such as `values-openshift.yaml` and treat it as the OpenShift baseline.

Example:

```yaml
scheduler:
  kubeScheduler:
    image:
      registry: your-registry.example.com
      repository: your-openshift-compatible-kube-scheduler
      tag: your-cluster-matched-tag
  service:
    type: ClusterIP

devicePlugin:
  service:
    type: ClusterIP

prometheus:
  enabled: false
```

Recommended interpretation:

- Set both HAMi service types to `ClusterIP` unless you have a proven reason to expose them differently.
- Keep monitoring integration off at chart level until you know which monitoring stack will own discovery.
- Treat the scheduler image as an explicit compatibility input, not a convenience default.

You may also need cluster-local overrides for:

- mirrored registries
- `imagePullSecrets`
- tolerations
- node selectors
- namespace-scoped annotations required by your platform

## Review SCC and Pod Security Assumptions

This is the most important OpenShift difference.

HAMi components may need access patterns that are stricter than what OpenShift's default restricted SCC profiles allow. In practice, the components most likely to be affected are:

- the HAMi device plugin
- scheduler-related helper jobs or webhook patch jobs
- any pod that requires host-level GPU integration paths

Before blaming the chart, check whether the failure is really a security admission issue.

Use:

```bash
oc -n hami-system describe pod <pod-name>
oc -n hami-system get events --sort-by=.lastTimestamp
```

Typical symptoms include:

- pod rejected before scheduling
- `forbidden` admission messages
- SCC-related validation failures
- host path or security context denials

Recommended approach:

- grant only the minimum SCC or permissions required
- scope any elevated access to the specific service accounts HAMi uses
- avoid broad cluster-wide privilege grants "just to make it work"

## Install or Review NVIDIA GPU Operator

If your platform team installs GPU Operator through OpenShift-native workflows, keep that ownership model and confirm only the HAMi-specific requirement:

- **disable NVIDIA's built-in device plugin**

If you are using Helm, the generic requirement from the Kubernetes guide still applies conceptually:

```bash
helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --version=v25.3.2
```

On OpenShift, however, do not assume Helm is the canonical lifecycle mechanism. If GPU Operator is already managed by OperatorHub or by a platform-owned `ClusterPolicy`, update that managed configuration instead of layering a second install path on top.

## Install HAMi Enterprise

Once the security, scheduler image, and monitoring decisions are clear, install HAMi Enterprise.

```bash
oc create namespace hami-system --dry-run=client -o yaml | oc apply -f -

helm install hami \
  oci://ghcr.io/dynamia-ai/hami-commercial/hami \
  --version 2.9.0-rc1 \
  --namespace hami-system \
  -f values-openshift.yaml
```

After installation, immediately inspect:

```bash
oc -n hami-system get pods
oc -n hami-system get events --sort-by=.lastTimestamp
```

If pods do not start, check SCC and image compatibility before changing unrelated chart values.

## Enable GPU Nodes

HAMi's device plugin only starts on nodes labeled `gpu=on`:

```bash
oc label nodes <node-name> gpu=on
```

Verify:

```bash
oc -n hami-system get pods
```

You should see HAMi device plugin and scheduler pods transition to `Running`.

## Monitoring on OpenShift

### Preferred: use the cluster's existing monitoring ownership model

If your cluster already runs OpenShift monitoring or user-workload monitoring:

- keep that ownership model
- ensure HAMi `ServiceMonitor` resources are created in the correct namespace and with selectors the chosen monitoring stack can discover
- verify discovery rules before assuming HAMi metrics are missing

### Fallback: use a self-managed Prometheus stack

Only use this path if:

- the platform monitoring stack is intentionally not available for this workload
- your platform team expects application teams to run their own Prometheus stack

If you choose a self-managed stack, document that choice clearly. On OpenShift, "install another Prometheus because the upstream guide says so" is not a safe default.

### Metric verification

Once discovery is configured, verify the same key metrics as on Kubernetes:

| Exporter | Query | Expected |
| --- | --- | --- |
| `dcgm-exporter` | `DCGM_FI_DEV_GPU_UTIL` | non-empty value |
| `hami-exporter` | `HostCoreUtilization` | non-empty value |
| `hami-device-plugin-exporter` | `GPUDeviceCoreAllocated` | non-empty value |

## License Activation

The activation flow is unchanged conceptually.

After all core components are healthy, run:

```bash
curl -fsSL https://dynamia.ai/scripts/collect-hami-license-info.sh | bash
```

Or, for an air-gapped install, run the bundled script:

```bash
bash collect-hami-license-info.sh
```

Then send the generated JSON output to Dynamia.ai sales/support to obtain the license.

## Post-Install Verification

### 1. Check component health

```bash
oc -n hami-system get pods
```

### 2. Check GPU resources on the node

```bash
oc describe node <gpu-node>
```

Expect custom resources such as:

- `nvidia.com/gpu`
- `nvidia.com/gpumem`

### 3. Run a smoke test pod

Use a minimal test pod:

```yaml
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
```

Apply it:

```bash
oc apply -f hami-smoke.yaml
oc logs pod/hami-smoke
```

If the pod fails **before** the container starts, investigate SCC or namespace policy first. On OpenShift, a smoke-test failure is often a security-policy issue rather than a HAMi runtime issue.

## Common OpenShift-Specific Failure Modes

| Symptom | Likely cause | What to check first |
| --- | --- | --- |
| HAMi pods never start | SCC or admission denial | `oc describe pod`, namespace events |
| `hami-scheduler` crashes or stays pending | incompatible `kube-scheduler` image | explicit `scheduler.kubeScheduler.image.*` values |
| GPU node labeled but device plugin absent | NVIDIA device plugin still enabled in GPU Operator | GPU Operator managed config / `ClusterPolicy` |
| Metrics missing | `ServiceMonitor` not discovered by the chosen monitoring stack | monitor namespace, labels, selectors |
| NodePort defaults feel wrong on platform | chart defaults were carried over from generic Kubernetes assumptions | set services to `ClusterIP`; expose only when necessary |

## Recommended Operational Posture

For OpenShift, the safest baseline is:

- manage GPU Operator in the way your platform already manages operators
- explicitly set the scheduler image
- review SCC before debugging chart logic
- keep internal HAMi services as `ClusterIP`
- integrate with the existing monitoring model first

That keeps the OpenShift-specific behavior explicit instead of relying on upstream Kubernetes defaults.

## Support

- Email: [info@dynamia.ai](mailto:info@dynamia.ai)
- Sales / Technical Support: 400-026-7800
