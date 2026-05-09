---
title: "HAMi 平台版 安装与接入指南"
productId: "hami-ai-platform"
version: "v1.4.0"
lastUpdated: "2026-04-25"
language: "zh"
description: "HAMi 平台版在 Kubernetes 集群上的部署、组件依赖与验证步骤。"
---

# HAMi 平台版 · 安装与接入指南

> 本文档面向 SRE / 平台工程师，介绍如何将 **HAMi 平台版** 部署到 Kubernetes 集群，并完成与 HAMi、Prometheus、NVIDIA GPU Operator、Gateway API 等基础组件的对接。

## 目录

1. [架构与定位](#架构与定位)
2. [前置条件清单](#前置条件清单)
3. [组件依赖安装](#组件依赖安装)
   - 3.1 [Prometheus 监控栈](#31-prometheus-监控栈)
   - 3.2 [NVIDIA GPU Operator](#32-nvidia-gpu-operator)
   - 3.3 [HAMi 企业版](#33-hami-企业版)
   - 3.4 [ServiceMonitor 监控对接](#34-servicemonitor-监控对接)
   - 3.5 [Gateway API 网关](#35-gateway-api-网关)
4. [安装 HAMi 平台版](#安装-hami-平台版)
5. [安装后验证](#安装后验证)
6. [常见问题与故障排查](#常见问题与故障排查)
7. [获取支持](#获取支持)

---

## 架构与定位

HAMi 平台版（密瓜智能异构算力调度、虚拟化系统）是部署在 Kubernetes 集群之上的应用平台，提供异构算力的统一调度、租户配额、监控可视化与开发者工作空间。其核心特征：

- **控制平面联邦**：连接到云端 HAMi 企业平台 控制平面，单租户管理多个集群
- **统一管理界面**：内置管理、监控、用户控制台
- **开放可对接**：依赖标准 K8s 生态（Prometheus、Helm、Gateway API、HAMi device plugin）

> 在开始之前，请先完成下方"前置条件清单"，确保集群满足最低系统要求。

---

## 前置条件清单

请在 **每个待接入的 Kubernetes 集群** 上完成以下检查：

| 类型 | 要求 | 验证命令 |
|---|---|---|
| Kubernetes | 版本 ≥ 1.24 且 ≤ 1.31 | `kubectl version --short` |
| 容器运行时 | containerd 或 Docker | `kubectl get nodes -o wide` 查看 `CONTAINER-RUNTIME` 列 |
| Helm | ≥ 3.14 | `helm version --short` |
| GPU 驱动 | NVIDIA driver ≥ 440（推荐 ≥ 550） | `nvidia-smi` |
| 节点出口网络 | 可访问镜像仓库或离线包已就位 | `curl -I <registry>` |
| 集群存储 | 默认 StorageClass 已配置 | `kubectl get sc` |

### 安装 Helm（如未安装）

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

参考：[Helm 官方安装文档](https://helm.sh/docs/intro/install/)

### 容器运行时

containerd 是 Kubernetes 1.24+ 的默认运行时，详见 [Kubernetes 容器运行时](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)。

> 离线环境请提前下载所有 Helm Chart 与镜像，并通过本地 Registry 提供给集群。

---

## 组件依赖安装

HAMi 企业平台 依赖以下组件，**安装顺序请严格遵循**，否则后续验证会失败。

### 3.1 Prometheus 监控栈

HAMi 企业平台 依赖 Prometheus 进行集群监控。可使用现有 Prometheus 或新装。

**新建（推荐评估环境）：**

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  --set grafana.enabled=false \
  --version=75.15.1
```

> **使用现有 Prometheus**：版本必须 ≥ 2.37.0；同时记下 `prometheus.spec.serviceMonitorSelector` 的 label，下面 ServiceMonitor 配置会用到。

---

### 3.2 NVIDIA GPU Operator

由于 HAMi 使用增强版 device-plugin，需要在安装 GPU Operator 时**禁用其内置 device-plugin**。

**安装：**

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.0
```

**验证 GPU 驱动：**

```bash
# 进入 nvidia-driver-daemonset Pod
kubectl -n gpu-operator exec -it \
  $(kubectl get pods -n gpu-operator -l app=nvidia-driver-daemonset -o name | head -1) \
  -- nvidia-smi
```

预期输出（示例）：

```text
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.144.03             Driver Version: 550.144.03     CUDA Version: 12.4     |
+-----------------------------------------------------------------------------------------+
|   0  Tesla P4                       On  |   00000000:03:00.0 Off |                  Off |
| N/A   31C    P8              6W /   75W |       0MiB /   8192MiB |      0%      Default |
+-----------------------------------------------------------------------------------------+
```

> 故障排查：[NVIDIA GPU Operator 故障排查](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/troubleshooting.html)

---

### 3.3 HAMi 商业版

向密瓜智能销售或支持团队申请 **HAMi 商业版离线安装包**（包含 `hami.tgz` Helm Chart 与镜像 tar 包）。

**步骤 1：导入镜像到集群可访问的 Registry**

```bash
# 加载离线镜像
docker load < hami-images.tar
docker tag <image>:<tag> <your-registry>/<image>:<tag>
docker push <your-registry>/<image>:<tag>
```

**步骤 2：使用 Helm 安装 HAMi**

```bash
helm install hami hami.tgz \
  -n hami-system --create-namespace \
  --set scheduler.serviceMonitor.enabled=true \
  --set devicePlugin.serviceMonitor.enabled=true
```

**步骤 3：为 GPU 节点打标签**

HAMi device plugin 仅在带 `gpu=on` 标签的节点上启动：

```bash
kubectl label nodes <node-name> gpu=on
```

> 验证：`kubectl -n hami-system get pods` 应能看到 `hami-device-plugin-*` 与 `hami-scheduler-*` 处于 Running 状态。

---

### 3.4 ServiceMonitor 监控对接

确保 Prometheus 能够采集 HAMi 与 DCGM-Exporter 指标。

> **重要**：ServiceMonitor 资源的 `metadata.labels` 必须与 Prometheus 资源的 `spec.serviceMonitorSelector` 字段匹配，否则 Prometheus 不会发现这些 Monitor。

**验证指标采集**（在 Prometheus UI / API 查询）：

| Exporter | 查询指标 | 预期 |
|---|---|---|
| dcgm-exporter | `DCGM_FI_DEV_GPU_UTIL` | 返回非空值 |
| hami-exporter | `HostCoreUtilization` | 返回非空值 |
| hami-device-plugin-exporter | `GPUDeviceCoreAllocated` | 返回非空值 |

> 故障排查：若指标查不到，先确认 `kubectl get servicemonitor -A` 中相关 SM 存在，再检查其 label 与 Prometheus 选择器匹配。

---

### 3.5 Gateway API 网关

Gateway API 用于路由 HAMi 企业平台 的工作空间流量（VSCode、SSH、Jupyter 等）。

**两种选项任选其一：**

| 选项 | 适用场景 | 操作 |
|---|---|---|
| A · 使用现有 Gateway | 已有 Istio / Envoy / Cilium 等支持 Gateway API 的入口 | 提供 Gateway 的 listener / endpoint 给安装命令 |
| B · 新装 Envoy Gateway | 评估环境或无现有网关 | 参考 [Envoy Gateway 安装指南](https://gateway.envoyproxy.io/docs/install/install-helm/) |

---

## 安装 HAMi 企业平台

**通过 Helm 安装：**

```bash
helm install hami-ai-platform hami-ai-platform.tgz \
  -n hami-ai-platform-system --create-namespace
```

**或在线 OCI 安装：**

```bash
helm install hami-ai-platform \
  oci://ghcr.io/dynamia-ai/charts/hami-ai-platform \
  --version 1.4.0 \
  -n hami-ai-platform-system --create-namespace
```

> 安装时可通过 `--set` 或 `-f values.yaml` 注入自定义配置（外部 Prometheus 端点、Gateway endpoint、镜像仓库地址等）。详细 values 字段请参考 chart 内置 `values.yaml`。

---

## 安装后验证

执行以下命令确认平台已就绪：

```bash
# 1. Pod 状态
kubectl -n hami-ai-platform-system get pods

# 2. 服务可达
kubectl -n hami-ai-platform-system get svc

# 3. CRD 注册
kubectl get crds | grep hami-ai-platform

# 4. 接入控制平面状态（如已对接云端控制面）
kubectl -n hami-ai-platform-system get clusters
```

预期：所有 Pod `Running`，无 `CrashLoopBackOff`；CRD 至少包含 `clusters.hami-ai-platform.dynamia.ai` 等核心资源。

---

## 常见问题与故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| HAMi device-plugin Pod 一直 `Pending` | 节点未打 `gpu=on` 标签 | `kubectl label nodes <node> gpu=on` |
| Prometheus 查不到 HAMi 指标 | ServiceMonitor label 不匹配 | 对齐 `spec.serviceMonitorSelector` |
| nvidia-smi 报错 | GPU 驱动未就绪 | 检查 `gpu-operator` namespace 下 driver Pod |
| Helm install 镜像拉取失败 | 离线环境镜像未导入 | 先 `docker load` + `docker push` 到本地 Registry |
| HAMi 企业平台 Pod `ImagePullBackOff` | values.yaml 镜像地址错误 | 检查 `image.registry` / `image.repository` 配置 |

---

## 获取支持

- 邮箱：[info@dynamia.ai](mailto:info@dynamia.ai)
- 售前/技术支持：400-026-7800
- 文档中心：[docs.dynamia.ai/hami-ai-platform](https://docs.dynamia.ai/hami-ai-platform)
- 已签订商业合同的客户请通过专属支持渠道提交 Issue

> **企业级 SLA**：HAMi 企业版 与 HAMi 平台版 均提供 7×24 小时技术支持、热修复与长期版本维护。
