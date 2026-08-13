---
title: "HAMi 商业产品在线部署手册（中国大陆客户）"
productId: "hami-ai-platform"
version: "v2.9.0"
lastUpdated: "2026-08-13"
language: "zh"
description: "通过 Helm 在可访问 Chart 和镜像仓库的 Kubernetes 集群中部署 HAMi 商业产品。"
---

本文说明通过 Helm 在可访问 Chart 和镜像仓库的 Kubernetes 集群中部署 HAMi 商业产品。本文不包含离线安装流程。

> ❗ **安装不等于激活**
>
> 完成 Helm 安装后，组件可以运行；GPU 虚拟化和调度功能需要完成许可证激活后才能正常使用。

## 为什么选择在线安装

在线安装适用于具备 Kubernetes、Helm 和镜像仓库运维能力，并需要较高配置自由度的客户。组件版本、部署顺序和 values 配置可由客户按照自身基础设施与变更流程自行管理。

密瓜智能准备的 Zarf 离线包更适用于网络隔离或需要统一交付物的环境；当客户具备自主管理能力，并需要自行维护组件版本、镜像来源及配置时，选择在线 Helm 安装更合适。

## 部署范围与前置条件

### 组件选择

| 组件 | 何时安装 | 说明 |
|---|---|---|
| HAMi Enterprise | 所有集群 | 核心调度器与设备插件，必须安装。 |
| NVIDIA GPU Operator | 使用 NVIDIA GPU，且集群尚未具备驱动与运行时管理能力 | HAMi 与 GPU Operator 的默认 device-plugin 不能同时启用。 |
| 昇腾设备插件 | 使用昇腾节点 | 在 HAMi 安装完成后部署，复用 HAMi 的设备配置 ConfigMap。 |
| Prometheus 监控栈 | 需要采集 HAMi 或 GPU 指标，或部署 HAMi AI Platform | 集群已有兼容的监控栈时无需重复安装。 |
| HAMi AI Platform | 需要平台控制台、工作负载管理和监控视图 | 可选；依赖 Gateway API 实现和监控能力。 |

### 前置检查

- Kubernetes 版本不低于 1.24，并且运维终端已配置可用的 `kubectl` 和 Helm。
- NVIDIA 节点应已具备 NVIDIA 驱动和 NVIDIA Container Toolkit，或由 NVIDIA GPU Operator 负责安装。
- 昇腾节点应先完成厂商驱动与运行时配置，并能被 Kubernetes 识别；本文只安装 HAMi 的昇腾设备插件。
- 安装 NVIDIA GPU Operator 时，必须禁用其默认 device-plugin，避免与 HAMi 冲突。

```bash
kubectl cluster-info
kubectl get nodes -o wide
helm version
```

## 在线安装

执行以下命令前，先确认当前 `kubeconfig` context 指向目标集群。建议将每个 Chart 的 values 文件纳入版本管理；中国大陆镜像仓库、商业 Chart 访问方式和生产环境 values 请向密瓜智能技术支持获取。

### 安装 NVIDIA GPU Operator（仅 NVIDIA 节点）

集群已安装 GPU Operator 时，不要重复安装；应先确认其 `devicePlugin.enabled` 为 `false`。如需 NVIDIA CDI，请先向密瓜智能技术支持确认兼容性。

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia && helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --set cdi.enabled=false \
  --set cdi.default=false \
  --version=v25.10.1
```

### 安装监控栈（按需）

集群尚无 Prometheus 或兼容监控系统，且需要指标采集时，可以安装 `kube-prometheus-stack`。

```bash
helm install prometheus \
  oci://ghcr.io/prometheus-community/charts/kube-prometheus-stack \
  --version 72.3.0 \
  --namespace monitoring \
  --create-namespace \
  --set alertmanager.enabled=false \
  --set grafana.enabled=false
```

### 安装 HAMi Enterprise

```bash
helm install hami \
  oci://dynamia-ai-registry.cn-hangzhou.cr.aliyuncs.com/public/charts/hami-enterprise \
  --version 2.9.0-r3 \
  --namespace hami-system \
  --create-namespace
```

完整配置项见 [HAMi Helm Chart Values Reference](https://public.hami.run/hami-enterprise-chart.md)。

### 安装昇腾设备插件（仅昇腾节点）

本步骤必须在 HAMi 安装完成后执行。以下配置复用 `hami-scheduler-device`，避免设备配置由多个 Chart 同时管理。

```yaml
nameOverride: "ascend-device-plugin"
fullnameOverride: "ascend-device-plugin"

image:
  repository: dynamia-ai-registry.cn-hangzhou.cr.aliyuncs.com/public/dynamia-ai/ascend-device-plugin
  tag: "v1.3.0"
  pullPolicy: IfNotPresent

config:
  create: false
  existingDeviceConfigMapName: hami-scheduler-device
```

```bash
helm install ascend-device-plugin \
  oci://dynamia-ai-registry.cn-hangzhou.cr.aliyuncs.com/public/dynamia-ai/charts/ascend-device-plugin \
  --version 0.1.1 \
  --namespace hami-system \
  -f ascend-device-plugin.yaml
```

### 启用 GPU 节点

HAMi device-plugin 仅在带有 `gpu=on` 标签的节点上启动。对每个需要由 HAMi 管理的 GPU 或昇腾节点执行：

```bash
kubectl label nodes <node-name> gpu=on
```

### 安装 HAMi AI Platform（可选）

仅在需要平台控制台时执行。本节不适用于只部署 HAMi Enterprise 的集群。

#### 安装 Envoy Gateway

```bash
helm install eg \
  oci://docker.io/envoyproxy/gateway-helm \
  --version v1.6.2 \
  --namespace envoy-gateway-system \
  --create-namespace \
  --set global.images.envoyGateway.image=docker.io/envoyproxy/gateway:v1.6.2 \
  --set global.image.ratelimit.image=docker.io/envoyproxy/ratelimit:99d85510 \
  --set config.envoyGateway.gateway.controllerName=gateway.envoyproxy.io/gatewayclass-controller \
  --set config.envoyGateway.provider.type=Kubernetes
```

#### 安装 HAMi AI Platform

```bash
helm install kantaloupe \
  oci://dynamia-ai-registry.cn-hangzhou.cr.aliyuncs.com/public/charts/kantaloupe-chart \
  --version 0.20.1 \
  --namespace kantaloupe-system \
  --create-namespace \
  --set fullnameOverride=kantaloupe
```

平台的服务暴露、平台管理员、认证与监控配置见 [kantaloupe Helm Chart Values Reference](https://public.hami.run/kantaloupe-chart.md)。

## 安装后检查

### 核心组件

```bash
kubectl -n hami-system get pods
kubectl -n gpu-operator get pods
kubectl -n monitoring get pods
kubectl -n kantaloupe-system get pods
```

未部署的可选组件对应 Namespace 可能不存在，可忽略其查询结果。已部署组件的 Pod 应处于 `Running` 或 `Completed` 状态。

### 节点与监控

```bash
kubectl describe node <node-name>
kubectl api-resources --api-group=monitoring.coreos.com
```

如果使用 Prometheus，`ServiceMonitor` 的标签必须匹配 `Prometheus.spec.serviceMonitorSelector`；如果使用 VictoriaMetrics，标签必须匹配 `VMServiceScrape.spec.serviceScrapeSelector`。

可以在监控系统中查询以下 NVIDIA 相关指标，确认采集结果非空：

- `DCGM_FI_DEV_GPU_UTIL`
- `HostCoreUtilization`
- `GPUDeviceCoreAllocated`

### HAMi AI Platform（可选）

```bash
kubectl -n kantaloupe-system get pods
kubectl -n kantaloupe-system get svc
```

按部署时配置的服务入口访问平台，确认控制台可以正常打开。

## 许可证申请与激活

### 获取许可证信息

在所有已选组件启动后执行。运行环境需要 `kubectl` 和 `jq`。

```bash
curl -fsSLO https://public.hami.run/collect-hami-license-info.sh
bash collect-hami-license-info.sh
```

将脚本输出的 JSON 发送给密瓜智能售前或技术支持以申请许可证。

### 激活 HAMi Enterprise

收到 License 文件后，将其保存到可以访问目标集群的运维机器，并创建 License Secret：

```bash
kubectl create secret generic hami-license \
  --from-file=license=/path/to/license-file \
  -n hami-system

kubectl label secret hami-license \
  hami.io/license="true" \
  -n hami-system
```

```bash
kubectl get secret hami-license -n hami-system
kubectl get events --field-selector involvedObject.name=hami-license -n hami-system
```

事件中出现 `LicenseValid` 表示许可证校验通过。NVIDIA 节点还可以检查许可证注册信息：

```bash
kubectl get nodes -o custom-columns='NODE:.metadata.name,LICENSE:.metadata.annotations.hami\.io/nvidia-license'
```

### 激活 HAMi AI Platform（可选）

1. 使用平台管理员账号登录 HAMi AI Platform。
2. 进入「License 与系统信息」。
3. 按页面提示获取授权申请信息。
4. 将授权申请信息发送给密瓜智能销售或技术支持人员。
5. 按交付指引完成激活。

## 常见问题

| 现象 | 检查与处理 |
|---|---|
| `hami-device-plugin` 未运行 | 确认节点已添加 `gpu=on` 标签，并检查 `kubectl -n hami-system get pods`。 |
| `hami-device-plugin` 反复重启 | 检查 NVIDIA GPU Operator 是否仍启用了默认 device-plugin；应设置 `devicePlugin.enabled=false`。 |
| 镜像拉取失败 | 检查目标集群到镜像仓库的网络连通性、镜像地址和标签，以及所需的 `imagePullSecrets`。 |
| 查不到 HAMi 指标 | 检查 Prometheus 或 VictoriaMetrics 的监控对象选择器是否匹配 ServiceMonitor 标签。 |
| 工作负载持续 Pending | 检查许可证是否已激活、节点是否已添加 `gpu=on` 标签、可用加速器资源，以及 `kubectl describe pod` 输出的事件。 |

## 获取支持

- 邮箱：[info@dynamia.ai](mailto:info@dynamia.ai)
- 售前 / 技术支持：400-026-7800
- 已签订商业合同的客户可通过专属支持渠道提交问题。
