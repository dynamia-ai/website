---
title: "HAMi 企业版 安装指南"
productId: "hami-enterprise"
version: "v2.9.0"
lastUpdated: "2026-05-20"
language: "zh"
description: "HAMi Enterprise 在 Kubernetes 集群上的部署、GPU 节点对接与监控配置。"
---

> 本文档面向 SRE / 平台工程师，介绍如何在 Kubernetes 集群上部署 **HAMi Enterprise**（HAMi 企业版），并完成 GPU 节点开启、监控对接与功能验证。

## 架构与定位

HAMi Enterprise 是开源 HAMi 项目的企业版，包含：

- **增强版 Device Plugin**：替代 NVIDIA 默认 device-plugin，支持 vGPU 切分、显存超卖
- **Scheduler 扩展**：基于 GPU 拓扑的调度策略
- **Exporter**：HAMi 指标暴露给 Prometheus
- **企业级加固**：镜像签名、CVE 修复流水线、长期版本支持

> 适用场景：多租户 GPU 共享、显存超卖、异构加速卡（NVIDIA / Ascend / Hygon DCU 等）统一调度。

## 前置条件清单

| 类型 | 要求 | 验证命令 |
|---|---|---|
| Kubernetes | ≥ 1.24 且 ≤ 1.31 | `kubectl version --short` |
| 容器运行时 | containerd 或 Docker | `kubectl get nodes -o wide` |
| Helm | ≥ 3.14 | `helm version --short` |
| GPU 驱动 | NVIDIA driver ≥ 470（推荐 ≥ 550） | `nvidia-smi` |
| Prometheus | ≥ 2.37（如需对接监控） | `kubectl get pods -A \| grep prom` |
| GPU Operator | 已安装且 **devicePlugin.enabled=false** | `helm list -A \| grep gpu-operator` |

> 关键约束：HAMi 自带 device-plugin，与 NVIDIA GPU Operator 内置 device-plugin **冲突**。若已安装 GPU Operator，务必通过 `--set devicePlugin.enabled=false` 禁用其内置 plugin。

### NVIDIA GPU Operator 安装（如未安装）

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.0
```

## 安装 HAMi Enterprise

> 三种安装路径，按场景选：
>
> - **All-in-One 离线一体包**（推荐，金融/政府/运营商等隔离网络场景）
> - 镜像离线包 + Helm Chart 分离下载（自有交付流水线）
> - 在线 OCI 安装（评估、PoC）

### 路径 A：All-in-One 离线一体包（推荐 air-gap 场景）

下载 `hami-enterprise-vX.Y.Z-airgap-<arch>.tar.gz`，一个 tarball 内含全部物料：

```bash
# 1. 解压
tar -xzf hami-enterprise-v2.9.0-airgap-amd64.tar.gz
cd hami-enterprise-v2.9.0-airgap

# 2. 推镜像到内网私有仓库（脚本自动处理 retag + push）
./load-images.sh --registry harbor.intra/hami

# 3. Helm 安装（chart 已就近）
helm install hami ./charts/hami-enterprise-2.9.0.tgz \
  -n hami-system --create-namespace \
  --set image.registry=harbor.intra/hami

# 4. 校验
kubectl -n hami-system get pods
```

> 一体包 SHA256 在 download 页显示，离线机房传输完务必比对。

### 路径 B：分件下载（自有 CI/CD 流水线）

向密瓜智能销售或支持团队申请 **HAMi Enterprise 离线包**，包含：

- `hami-enterprise.tgz`（Helm Chart）
- `hami-enterprise-images.tar`（镜像 tar 包）

或在线 OCI 安装（评估环境）：

```bash
helm install hami oci://ghcr.io/dynamia-ai/charts/hami-enterprise --version 2.9.0 \
  -n hami-system --create-namespace
```

### 导入离线镜像

```bash
# 加载镜像
docker load < hami-enterprise-images.tar

# 推送到本地 Registry
docker tag <image>:<tag> <your-registry>/<image>:<tag>
docker push <your-registry>/<image>:<tag>
```

### Helm 安装

```bash
helm install hami hami-enterprise.tgz \
  -n hami-system --create-namespace \
  --set scheduler.serviceMonitor.enabled=true \
  --set devicePlugin.serviceMonitor.enabled=true
```

> 离线环境额外加 `--set image.registry=<your-registry>` 指向本地 Registry。

## 启用 GPU 节点

HAMi device plugin 仅在带 `gpu=on` 标签的节点上启动：

```bash
kubectl label nodes <node-name> gpu=on
```

> 验证：`kubectl -n hami-system get pods` 应能看到 `hami-device-plugin-*`、`hami-scheduler-*` 处于 Running 状态。

## 监控对接

确保 Prometheus 能采集 HAMi 与 DCGM-Exporter 指标。

> ServiceMonitor 资源的 `metadata.labels` 必须与 Prometheus 的 `spec.serviceMonitorSelector` 字段匹配，否则 Prometheus 不会发现这些 Monitor。

### 验证指标采集

| Exporter | 查询指标 | 预期 |
|---|---|---|
| dcgm-exporter | `DCGM_FI_DEV_GPU_UTIL` | 返回非空值 |
| hami-exporter | `HostCoreUtilization` | 返回非空值 |
| hami-device-plugin-exporter | `GPUDeviceCoreAllocated` | 返回非空值 |

## 安装后验证

```bash
# 1. Pod 状态
kubectl -n hami-system get pods

# 2. Device Plugin 注册的 GPU 资源
kubectl describe node <gpu-node> | grep -A 5 'Capacity:'
# 期望看到：nvidia.com/gpu: <N>  以及 nvidia.com/gpumem: <MB>

# 3. 提交一个测试 Pod 验证调度
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

期望：`nvidia-smi` 输出可见 GPU 信息，且显存被限制为 2000 MiB。

## 常见问题

| 现象 | 可能原因 | 处理 |
|---|---|---|
| device-plugin Pod `Pending` | 节点未打 `gpu=on` 标签 | `kubectl label nodes <node> gpu=on` |
| device-plugin Pod `CrashLoopBackOff` | 与 NVIDIA 默认 device-plugin 冲突 | 禁用 GPU Operator 的 devicePlugin（`--set devicePlugin.enabled=false`） |
| Prometheus 查不到 HAMi 指标 | ServiceMonitor label 不匹配 | 对齐 `spec.serviceMonitorSelector` |
| `nvidia-smi` 报错 | GPU 驱动未就绪 | 检查 `gpu-operator` namespace 下 driver Pod |
| Helm install 镜像拉取失败 | 离线镜像未导入 | `docker load` + `docker push` 到本地 Registry |

## 获取支持

- 邮箱：[info@dynamia.ai](mailto:info@dynamia.ai)
- 售前 / 技术支持：400-026-7800
