---
title: "HAMi AI Platform on OpenShift: Installation Guide"
slug: "hami-ai-platform-openshift-installation"
description: "Deploy HAMi AI Platform on OpenShift with HAMi Enterprise, Gateway and Route planning, monitoring ownership, authentication setup, and post-install verification guidance."
productId: "hami-ai-platform"
lastUpdated: "2026-06-11"
language: "en"
---

> This is a dedicated OpenShift guide for **HAMi AI Platform**. It should be used together with the generic [HAMi AI Platform installation guide](/products/hami-ai-platform/install), but it replaces the Kubernetes-specific assumptions that usually do not hold on OpenShift.

## When to Use This Guide

Use this document if your target platform is:

- Red Hat OpenShift Container Platform (OCP)
- A managed OpenShift offering
- An OpenShift-based internal platform with SCC enforcement, Route-based exposure, or cluster-owned monitoring

If you are deploying to a standard upstream Kubernetes cluster, use the main [HAMi AI Platform installation guide](/products/hami-ai-platform/install) instead.

## What Changes on OpenShift

Compared with a generic Kubernetes install, OpenShift usually changes six things that matter to HAMi AI Platform:

1. **Security model**: OpenShift SCC defaults can block pods, init jobs, or host-integrated HAMi components.
2. **GPU Operator lifecycle**: NVIDIA GPU Operator is often managed through OperatorHub and `ClusterPolicy`, not only through raw Helm commands.
3. **Ingress model**: OpenShift clusters often standardize on `Route`, while the platform chart natively assumes Gateway API or direct service exposure.
4. **Monitoring ownership**: many OpenShift clusters already have platform monitoring or user-workload monitoring, so self-installing Prometheus is often the wrong default.
5. **Scheduler image compatibility**: the underlying HAMi Enterprise scheduler must use a `kube-scheduler` image compatible with the cluster's OpenShift minor version.
6. **Authentication and persistence policy**: OpenShift deployments are more likely to require explicit secrets, storage classes, and namespace-scoped policy review rather than chart defaults.

## Installation Order

On OpenShift, treat HAMi AI Platform as a layered deployment:

1. Prepare GPU worker nodes and NVIDIA GPU Operator
2. Install and validate HAMi Enterprise
3. Decide service exposure for HAMi AI Platform
4. Install `kantaloupe` with OpenShift-specific values
5. Verify console reachability, auth, workload creation, and monitoring

Do not start with the platform chart before the underlying HAMi layer is healthy.

## Prerequisites

Run the checks below on **each OpenShift cluster you plan to onboard**:

| Type | Requirement | Verify |
| --- | --- | --- |
| OpenShift | A supported OpenShift cluster with GPU worker nodes | `oc version` |
| Access | Cluster-admin or equivalent permissions to review SCC, install operators, and create cluster-scoped resources | `oc auth can-i '*' '*' --all-namespaces` |
| Helm | Helm 3.14 or newer | `helm version --short` |
| GPU Driver | NVIDIA driver installed and healthy on GPU nodes | `nvidia-smi` on node or GPU Operator status |
| GPU Operator | Installed, with NVIDIA's built-in device plugin disabled | check `ClusterPolicy` or installed release config |
| Storage | A storage class suitable for auth persistence and any platform state you enable | `oc get sc` |
| Exposure plan | A clear decision on Gateway API vs OpenShift Route vs internal-only access | platform-specific |
| Monitoring decision | You have decided whether to use OpenShift monitoring or a self-managed Prometheus stack | platform-specific |
| Registry access | Worker nodes can pull required images, or mirrored registries are prepared | image pull test / cluster mirror config |

> In the commands below, `oc` is used for clarity. Because OpenShift is Kubernetes-compatible, many `kubectl` commands still work, but operationally it is better to document the OpenShift path explicitly.

## Dependency: HAMi Enterprise Must Be OpenShift-Ready First

HAMi AI Platform depends on a healthy HAMi Enterprise installation.

Before installing `kantaloupe`, confirm that the following is already true:

- HAMi Enterprise is installed in `hami-system`
- NVIDIA's built-in device plugin is disabled
- GPU nodes are labeled with `gpu=on`
- HAMi device plugin and scheduler pods are healthy
- the scheduler image has been explicitly reviewed for OpenShift compatibility

Use the dedicated [HAMi Enterprise on OpenShift guide](/attachments/hami-enterprise-openshift-installation) for that layer first.

## OpenShift-Specific Design Decisions

Before installation, make these decisions explicitly.

### 1. How will GPU Operator be managed?

Preferred:

- Managed through OpenShift OperatorHub and `ClusterPolicy`

Acceptable:

- Managed through Helm if your platform team already standardizes on that path

The HAMi-specific requirement stays the same: **NVIDIA's built-in device plugin must be disabled**.

### 2. How will users reach the platform?

Common options on OpenShift:

- **Internal-only access**: keep services cluster-internal during initial validation
- **Gateway API + external service**: preserve the chart's native exposure model
- **OpenShift Route in front of platform services**: preferred on clusters where Route is the standard external exposure primitive

Do not default to `NodePort` on OpenShift unless your environment explicitly requires it.

### 3. Which monitoring stack owns discovery?

Preferred:

- Existing OpenShift monitoring stack
- Existing OpenShift user-workload monitoring stack

Fallback:

- A self-managed Prometheus stack

Do not assume `kube-prometheus-stack` should be installed by default on OpenShift. On many clusters, that creates ownership overlap instead of solving a problem.

### 4. How will authentication secrets be managed?

Preferred for production:

- Create a real secret outside the chart and pass `auth.existingAuthSecret`

Avoid:

- hardcoding bootstrap credentials in ad hoc values files

### 5. What storage class will auth persistence use?

If `auth.enabled=true`, review:

- `auth.persistence.enabled`
- `auth.persistence.storageClass`
- `auth.persistence.size`

Do not leave storage behavior implicit unless your platform team is comfortable with the cluster default.

## Prepare Values for OpenShift

Create a values file such as `values-openshift.yaml` and treat it as the OpenShift baseline.

Example:

```yaml
global:
  imagePullSecrets: []

gateway:
  enabled: false

apiserver:
  service:
    type: ClusterIP

ui:
  service:
    type: ClusterIP

auth:
  enabled: true
  existingAuthSecret: kantaloupe-auth
  persistence:
    enabled: true
    storageClass: your-storage-class
    size: 1Gi

monitoring:
  enabled: false

hamiNamespace: hami-system
```

Recommended interpretation:

- start with `ClusterIP` services
- disable chart-managed gateway exposure unless you have already decided how OpenShift should expose the platform
- use a real existing auth secret
- explicitly choose a storage class
- keep monitoring integration off until the ownership model is clear

You may also need cluster-local overrides for:

- mirrored registries
- `imagePullSecrets`
- tolerations
- node selectors
- namespace-scoped annotations required by your platform

## Review SCC and Pod Security Assumptions

This is one of the biggest OpenShift differences.

Platform install failures are often caused by OpenShift admission or SCC restrictions rather than broken chart values. In practice, review the following first:

- HAMi Enterprise pods in `hami-system`
- platform pods in `kantaloupe-system`
- auth migration jobs or helper jobs
- any pods that interact with host-integrated GPU components indirectly through the stack

Use:

```bash
oc -n hami-system describe pod <pod-name>
oc -n kantaloupe-system describe pod <pod-name>
oc -n kantaloupe-system get events --sort-by=.lastTimestamp
```

Typical symptoms include:

- pod rejected before scheduling
- `forbidden` admission messages
- SCC-related validation failures
- init or migration jobs never starting

Recommended approach:

- grant only the minimum SCC or permissions required
- scope any elevated access to the specific service accounts used by the relevant component
- avoid broad cluster-wide privilege grants "just to make it work"

## Service Exposure on OpenShift

### Recommended starting point: internal-only validation

For first install validation:

- set platform services to `ClusterIP`
- confirm backend, frontend, auth, and workload lifecycle work inside the cluster
- expose the platform only after internal health is proven

### Option A: Gateway API

Use this when:

- your cluster already runs `envoy-gateway` or another Gateway API implementation
- your platform team prefers the chart's native Gateway shape

Keep in mind:

- OpenShift users may still expect Route as the operationally visible entrypoint
- certificate ownership must be explicit

### Option B: OpenShift Route

Use this when:

- Route is the standard external exposure primitive on your cluster
- you want platform teams to manage TLS and hostname exposure the OpenShift-native way

In this model, keep the chart services internal and expose them through a Route that your platform team owns.

### What to avoid by default

Avoid starting with:

- `NodePort`
- ad hoc public load balancers without hostname ownership
- mixed Gateway + Route exposure unless the ownership boundary is clearly intentional

## Install or Review NVIDIA GPU Operator

If your platform team installs GPU Operator through OpenShift-native workflows, keep that ownership model and confirm only the HAMi-specific requirement:

- **disable NVIDIA's built-in device plugin**

If you are using Helm, the same conceptual rule from the generic guide still applies:

```bash
helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --version=v25.3.2
```

On OpenShift, however, do not assume Helm is the canonical lifecycle mechanism. If GPU Operator is already managed by OperatorHub or by a platform-owned `ClusterPolicy`, update that managed configuration instead of layering a second install path on top.

## Install HAMi Enterprise

Install and validate HAMi Enterprise first:

```bash
oc create namespace hami-system --dry-run=client -o yaml | oc apply -f -
```

Then follow the dedicated [HAMi Enterprise on OpenShift guide](/attachments/hami-enterprise-openshift-installation).

Do not continue until:

- `oc -n hami-system get pods` is healthy
- GPU resources are visible on nodes
- a smoke workload can request `nvidia.com/gpu` successfully

## Install HAMi AI Platform

Once the underlying HAMi layer, security assumptions, and exposure decisions are clear, install the platform:

```bash
oc create namespace kantaloupe-system --dry-run=client -o yaml | oc apply -f -

helm install kantaloupe \
  oci://ghcr.io/dynamia-ai/kantaloupe/kantaloupe-chart \
  --version 0.15.1 \
  --namespace kantaloupe-system \
  --set fullnameOverride=kantaloupe \
  -f values-openshift.yaml
```

After installation, immediately inspect:

```bash
oc -n kantaloupe-system get pods
oc -n kantaloupe-system get events --sort-by=.lastTimestamp
```

If pods do not start, check SCC, auth secret wiring, persistence, and image pull configuration before changing unrelated chart values.

## Authentication on OpenShift

For production-style installs, prefer an existing secret:

```yaml
auth:
  enabled: true
  existingAuthSecret: kantaloupe-auth
```

That secret should contain the fields your platform runtime expects for auth bootstrap and JWT handling.

Operational guidance:

- create the secret before Helm install
- avoid inline credentials in shared values files
- verify persistence behavior when enabling auth

If auth is disabled during first install, document that decision explicitly so the exposure pattern does not accidentally assume public login availability.

## Monitoring on OpenShift

### Preferred: use the cluster's existing monitoring ownership model

If your cluster already runs OpenShift monitoring or user-workload monitoring:

- keep that ownership model
- ensure `ServiceMonitor` resources are created in the correct namespace and with selectors the chosen monitoring stack can discover
- verify discovery rules before assuming platform metrics are missing

### Fallback: use a self-managed Prometheus stack

Only use this path if:

- the platform monitoring stack is intentionally not available for this workload
- your platform team expects application teams to run their own Prometheus stack

### Metric verification

Verify both the HAMi layer and platform layer:

| Component | Query or signal | Expected |
| --- | --- | --- |
| `dcgm-exporter` | `DCGM_FI_DEV_GPU_UTIL` | non-empty value |
| `hami-exporter` | `HostCoreUtilization` | non-empty value |
| `hami-device-plugin-exporter` | `GPUDeviceCoreAllocated` | non-empty value |
| platform services | service endpoints present and scrapeable | healthy |

## License Activation

The activation flow for the HAMi layer is unchanged conceptually.

After all core HAMi components are healthy, run:

```bash
curl -fsSL https://dynamia.ai/scripts/collect-hami-license-info.sh | bash
```

Or, for an air-gapped install, run the bundled script:

```bash
bash collect-hami-license-info.sh
```

Then send the generated JSON output to Dynamia.ai sales/support to obtain the license.

Do not treat the platform chart itself as a substitute for HAMi Enterprise activation.

## Post-Install Verification

### 1. Check HAMi Enterprise health

```bash
oc -n hami-system get pods
oc describe node <gpu-node>
```

Confirm GPU resources such as:

- `nvidia.com/gpu`
- `nvidia.com/gpumem`

### 2. Check platform health

```bash
oc -n kantaloupe-system get pods
oc -n kantaloupe-system get svc
```

### 3. Verify service reachability

Verify whichever exposure model you chose:

- internal service access
- Gateway-based external access
- Route-based access

Do not proceed to UI testing until the backend and frontend are both reachable through the intended path.

### 4. Verify the console

After the HAMi AI Platform service is exposed, open the site and confirm that both frontend and backend are working properly.

### 5. Create a workload

On the **Workloads** page in the console, create an application such as `gpu-burn` via the creation wizard or an **Example** template.

![Create workload](/images/enterprise-install/hami-ai-platform/create-workload-en.png)

Confirm all of the following:

1. **Created successfully** with no console errors
2. **Workload list**: status, search, list metrics, and monitoring panels (GPU SM / GPU MEM / CPU / Memory) are correct; time-range switching and charts match expectations

   ![Workload list](/images/enterprise-install/hami-ai-platform/workload-list-en.png)

3. **Application details**: basic info, resource overview, GPU allocation, and monitoring data are correct; GPU and node drill-down pages show correct resource overview and monitoring data

   ![Application details](/images/enterprise-install/hami-ai-platform/workload-detail-en.png)![Application details](/images/enterprise-install/hami-ai-platform/workload-detail-en-2.png)

4. **Node and GPU drill-down views** show correct resource overview and monitoring data

### 6. Verify auth and platform flows

If auth is enabled, also verify:

- login succeeds
- the bootstrap admin account behaves as expected
- auth persistence survives pod restart

## Common OpenShift-Specific Failure Modes

| Symptom | Likely cause | What to check first |
| --- | --- | --- |
| HAMi pods never start | SCC or admission denial | `oc describe pod`, namespace events |
| `hami-scheduler` crashes or stays pending | incompatible `kube-scheduler` image | explicit scheduler image values in the HAMi layer |
| `kantaloupe` pods fail on startup | auth secret or persistence mismatch | `auth.existingAuthSecret`, PVC events, init/migration jobs |
| Console reachable but broken | service exposure path mismatched with platform config | Route/Gateway ownership and backend/frontend reachability |
| Metrics missing | `ServiceMonitor` not discovered by the chosen monitoring stack | monitor namespace, labels, selectors |
| Platform images fail to pull | wrong image registry or missing pull secret | registry overrides and `imagePullSecrets` |
| `NodePort` defaults feel wrong on platform | chart defaults were carried over from generic Kubernetes assumptions | set services to `ClusterIP`; expose only through the chosen OpenShift pattern |

## Recommended Operational Posture

For OpenShift, the safest baseline is:

- make HAMi Enterprise healthy first
- manage GPU Operator in the way your platform already manages operators
- explicitly review scheduler image compatibility
- keep platform services as `ClusterIP` at first
- choose one external exposure model intentionally
- integrate with the existing monitoring model first
- use an existing auth secret in production-style installs

That keeps the OpenShift-specific behavior explicit instead of relying on upstream Kubernetes defaults.

## Support

- Email: [info@dynamia.ai](mailto:info@dynamia.ai)
- Sales / Technical Support: 400-026-7800
- Customers under commercial contract: please use your dedicated support channel for issues
