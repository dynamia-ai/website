---
title: "HAMi 企业版 安装指南"
productId: "hami-enterprise"
version: "v2.9.0"
lastUpdated: "2026-05-20"
language: "zh"
description: "HAMi Enterprise 在 Kubernetes 集群上的部署、GPU 节点对接与监控配置。"
---

> 本文档面向 SRE / 平台工程师，介绍如何在 Kubernetes 集群上部署 **HAMi Enterprise**（HAMi 企业版），并完成 GPU
> 节点开启、监控对接与功能验证。

## 架构与定位

HAMi Enterprise 是开源 HAMi 项目的企业版，包含：

- **增强版 Device Plugin**：替代 NVIDIA 默认 device-plugin，支持 vGPU 切分、显存超卖
- **Scheduler 扩展**：基于 GPU 拓扑的调度策略
- **Exporter**：HAMi 指标暴露给 Prometheus
- **企业级加固**：镜像签名、CVE 修复流水线、长期版本支持

> 适用场景：多租户 GPU 共享、显存超卖、异构加速卡（NVIDIA / Ascend / Hygon DCU 等）统一调度。

## 前置条件清单

| 类型           | 要求                                                  | 验证命令                        |
|--------------|-----------------------------------------------------|-----------------------------|
| Kubernetes   | ≥ 1.24                                              | `kubectl version --short`   |
| 容器运行时        | containerd 或 Docker                                 | `kubectl get nodes -o wide` |
| Helm         | ≥ 3.14                                              | `helm version --short`      |
| GPU 驱动       | NVIDIA driver ≥ 470（推荐 ≥ 550）                       | `nvidia-smi`                |
| Prometheus   | ≥ 2.37（如需对接监控）                                      | `kubectl get pods -A        | grep prom`  |
| GPU Operator | 已安装且 **devicePlugin.enabled = false，推荐版本：v25.3.2**） | `helm list -A               | grep gpu-operator` |

> 关键约束：HAMi 自带 device-plugin，与 NVIDIA GPU Operator 内置 device-plugin **冲突**。若已安装 GPU Operator，务必通过
`--set devicePlugin.enabled=false` 禁用其内置 plugin。

## 安装 HAMi Enterprise

> 两种安装路径，按场景选：
>
> - 在线 OCI 安装（评估、PoC、可通外部网络的集群）
> - All-in-One 离线一体包（金融/政府/运营商等隔离网络场景）
>
> 无论如何安装，最后都需要申请证书并激活。

### 路径 A：在线 OCI chart 安装

**如果希望使用国内镜像仓库，请联系 Dynamia.ai 的售前/技术支持获取相关信息。**

选择好 kubeconfig context 后，开始操作：

如果没有安装过 `nvidia/gpu-operator`，先安装。

```sh
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.2
```

如果集群里没有 Prometheus 等监控栈，还需要安装，这里展示 `prometheus-community/kube-prometheus-stack` 的安装方法。

```sh
helm install prometheus oci://ghcr.io/prometheus-community/charts/kube-prometheus-stack:72.3.0 \
  -n monitoring --create-namespace \
  --set alertmanager.enabled=false \
  --set grafana.enabled=false
```

然后开始安装 `dynamia-ai/hami-enterprise`。

```sh
helm install hami \
	--namespace hami-system \
  --create-namespace oci://ghcr.io/dynamia-ai/hami-commercial/hami:2.9.0-rc1
```

推荐使用版本追踪系统维护集群中所有 helm release 的 values 文件。通过使用 `-f example-values.yaml` 覆盖 chart 中默认 values 中与之相对应的 key。hami-enterprise 的完整 values 配置请见：[HAMi Helm Values Reference](/zh/attachments/hami-helm-values)。

### 路径 B：All-in-One 离线一体包

**请联系 Dynamia.ai 的售前/技术支持获取下载地址。**

下载 `hami-enterprise-v<VERSION>-airgap-<ARCH>.tar.gz` 和 `hami-enterprise-v<VERSION>-airgap-<ARCH>.tar.gz.sha256`。

`hami-enterprise` 离线包包括 `dynamia-ai/hami-enterprise`、`nvidia/gpu-operator` 和 `prometheus-community/kube-prometheus-stack`，可以按需安装。

```bash
# 下载
curl -L -O <URL>
# 或：wget <URL>

# 解压外层 tar.gz
# macOS
tar -xzf hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
# Linux（GNU tar）
tar -xaf hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
```

校验一致性

```sh
# Linux / macOS
shasum -a 256 -c hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz.sha256

# 或手动比对
shasum -a 256 hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz
cat hami-enterprise-vX.Y.Z-airgap-amd64.tar.gz.sha256
```

后续安装过程请见解压出来的 `DEPLOY.md` 文件。

## 启用 GPU 节点

HAMi device plugin 仅在带 `gpu=on` 标签的节点上启动：

```bash
kubectl label nodes <node-name> gpu=on
```

> 验证：`kubectl -n hami-system get pods` 应能看到 `hami-device-plugin-*`、`hami-scheduler-*` 处于 Running 状态。

## 监控对接

确保 Prometheus 能采集 HAMi 与 DCGM-Exporter 指标。

> ServiceMonitor 资源的 `metadata.labels` 必须与 Prometheus 的 `spec.serviceMonitorSelector` 字段匹配，否则 Prometheus
> 不会发现这些 Monitor。

### 验证指标采集

| Exporter                    | 查询指标                     | 预期    |
|-----------------------------|--------------------------|-------|
| dcgm-exporter               | `DCGM_FI_DEV_GPU_UTIL`   | 返回非空值 |
| hami-exporter               | `HostCoreUtilization`    | 返回非空值 |
| hami-device-plugin-exporter | `GPUDeviceCoreAllocated` | 返回非空值 |

## 证书激活

**请完成上述安装任务，确保所有组件的 Pod 都正常启动后再开始激活流程。**

执行以下脚本收集许可证信息（需要 kubectl、jq）：

```bash
# 在线安装
curl -fsSL https://dynamia.ai/scripts/collect-hami-license-info.sh | bash

# 离线安装（包内已包含）
bash collect-hami-license-info.sh
```

执行后可以看到以下 JSON 内容：

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

把上述信息发送给 Dynamia.ai 的售前/技术支持获取证书。

## 激活后验证

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

期望：`nvidia-smi` 输出可见 GPU 信息，且显存被限制为 2000 MiB。

## 常见问题

| 现象                                   | 可能原因                                                       | 处理                                                                                                                                |
|--------------------------------------|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| 镜像拉不下来                               | Node 没有外部网络或者与 ghcr.io 连接不畅。                               | 联系 Dynamia.ai 的售前/技术支持获取国内镜像仓库地址或 All-in-One 离线一体包。                                                                               |
| device-plugin Pod `Pending` 或者不存在    | 节点未打 `gpu=on` 标签                                           | `kubectl label nodes <node> gpu=on`                                                                                               |
| device-plugin Pod `CrashLoopBackOff` | 与 NVIDIA 默认 device-plugin 冲突                               | 禁用 GPU Operator 的 devicePlugin（`--set devicePlugin.enabled=false`）。                                                               |
| Prometheus 查不到 HAMi 指标               | serviceMonitorNamespaceSelector 与 ServiceMonitor label 不匹配 | 对齐 `prometheus/prometheus-kube-prometheus-prometheus` 的 `.spec.serviceMonitorSelector` 和 hami-enterprise 的 serviceMonitor labels。 |
| `nvidia-smi` 报错                      | GPU 驱动未就绪                                                  | 检查 `gpu-operator` namespace 下 driver Pod 状态。                                                                                      |

## 获取支持

- 邮箱：[info@dynamia.ai](mailto:info@dynamia.ai)
- 售前 / 技术支持：400-026-7800
