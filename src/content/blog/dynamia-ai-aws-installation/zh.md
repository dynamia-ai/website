---
title: 在 AWS 上使用 EKS 部署 Dynamia AI 平台
coverTitle: 在 AWS 上使用 EKS 部署 Dynamia AI 平台
date: '2025-09-26'
excerpt: >-
  遵循这套经过实战检验的清单，准备 IAM、安装集群附加组件，
  并在大约一小时内通过 Amazon EKS 部署 Dynamia AI 平台。
author: Dynamia AI Team
tags:
  - Dynamia AI Platform
  - AWS
  - EKS
  - Helm
  - HAMi
  - NVIDIA
category: Integration & Ecosystem
coverImage: /images/blog/aws/aws-install-coverpage.png
language: zh
aiRepostLinks:
  - label: ChatGPT 摘要
    description: AI 生成的部署指南要点
    url: 'https://chat.openai.com/'
    icon: chatgpt
  - label: Claude 回顾
    description: Claude 对 AWS 设置步骤的快速总结
    url: 'https://claude.ai/'
    icon: claude
  - label: Gemini 笔记
    description: Google Gemini 的操作指南和提醒
    url: 'https://gemini.google.com/'
    icon: gemini
linktitle: Dynamia AI 在 AWS 上的安装指南
---

使用本指南在 AWS 上部署 Dynamia AI 平台，包括所需的 IAM 角色、支持组件和 Helm charts。

---

## 第 1 步：准备先决条件

在开始之前，请确认您已完成以下准备工作。如果还需要安装任何组件，请使用链接中的说明。

- 一个运行 Kubernetes 1.31 或更高版本的 Amazon EKS 集群（[创建 EKS 集群](https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html)）。确保已安装以下附加组件并运行正常：
  - `kube-proxy`
  - `cert-manager`
  - `metrics-server`
  - `Amazon EKS Pod Identity Agent`
  - `Amazon VPC CNI`
- 已为该集群配置 `kubectl`（[安装 kubectl](https://kubernetes.io/docs/tasks/tools/)）
- `eksctl` 版本 0.32.0 或更高版本（[安装 eksctl](https://eksctl.io/installation/)）
- 已配置 AWS CLI，并拥有创建策略和服务账户的 IAM 权限（[安装 AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)）
- 已将 OIDC 身份提供商关联到集群（[关联 OIDC 提供商](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)）
- Helm 版本 3.6.0 或更高版本（[安装 Helm](https://helm.sh/docs/intro/install/)）

验证您的 CLI 设置：

```bash
# 确认 kubectl 已安装
kubectl version

# 确认 AWS CLI 已安装且您的凭据有效
aws --version
aws sts get-caller-identity

# 预期：0.32.0 或更高版本
eksctl version
```

运行 `eksctl get addons --cluster <your-cluster-name>` 并确认上述列出的附加组件已存在且报告 `ACTIVE` 状态后再继续。例如：

```bash
~ $ eksctl get addons --cluster <your-cluster-name>
NAME                    VERSION                 STATUS  ISSUES  IAMROLE UPDATE AVAILABLE                                                                                                                        CONFIGURATION VALUES    NAMESPACE       POD IDENTITY ASSOCIATION ROLES
cert-manager            v1.18.2-eksbuild.2      ACTIVE  0                                                                                                                                                                               cert-manager
eks-pod-identity-agent  v1.3.8-eksbuild.2       ACTIVE  0                                                                                                                                                                               kube-system
kube-proxy              v1.33.0-eksbuild.2      ACTIVE  0               v1.33.3-eksbuild.6,v1.33.3-eksbuild.4                                                                                                                           kube-system
metrics-server          v0.8.0-eksbuild.2      ACTIVE  0                                                                                                                                                                               kube-system
vpc-cni                 v1.19.5-eksbuild.1      ACTIVE  0               v1.20.2-eksbuild.1,v1.20.1-eksbuild.3,v1.20.1-eksbuild.1,v1.20.0-eksbuild.1,v1.19.6-eksbuild.7,v1.19.6-eksbuild.1,v1.19.5-eksbuild.3                            kube-system     arn:aws:iam::265950574560:role/AmazonEKSPodIdentityAmazonVPCCNIRole

```

## 第 2 步：配置 IAM 访问

选择运行 Dynamia AI 平台的命名空间。默认为 `hami-system`。如果您选择不同的命名空间，请在以下所有命令中替换它。

### 2.1 关联 OIDC 身份提供商（每个集群运行一次）

```bash
eksctl utils associate-iam-oidc-provider --cluster <your-cluster-name> --approve
```

### 2.2 创建自定义 IAM 策略

```bash
cat > custom-policy.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "license-manager:ListReceivedLicenses",
        "license-manager:CheckoutLicense",
        "license-manager:GetLicenseUsage",
        "license-manager:CheckInLicense",
        "license-manager:ExtendLicenseConsumption"
      ],
      "Resource": "*"
    }
  ]
}
JSON

aws iam create-policy \
  --policy-name DynamiaPlatformPolicy \
  --policy-document file://custom-policy.json
```

### 2.3 创建 IAM 服务账户

```bash
eksctl create iamserviceaccount \
  --cluster=<your-cluster-name> \
  --namespace=hami-system \
  --name=dynamia-sa \
  --attach-policy-arn=arn:aws:iam::<YOUR-ACCOUNT-ID>:policy/DynamiaPlatformPolicy \
  --approve
```

## 第 3 步：安装集群依赖项

Dynamia AI 平台依赖于多个开源组件。在部署平台 charts 之前，请先安装这些组件。

### 3.1 Prometheus Stack

```bash
helm install prometheus \
  oci://ghcr.io/prometheus-community/charts/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### 3.2 Envoy Gateway

```bash
helm install eg \
  oci://docker.io/envoyproxy/gateway-helm \
  --version v1.5.0 \
  --namespace envoy-gateway-system \
  --create-namespace
```

### 3.3 cert-manager

从 EKS 控制台中的 **Cluster → Add-ons → Community add-ons** 安装 cert-manager，或遵循 [AWS 文档](https://docs.aws.amazon.com/eks/latest/userguide/lbc-manifest.html#lbc-cert)。

### 3.4（可选）用于 NVIDIA GPU 节点的 DCGM exporter

```bash
helm repo add gpu-helm-charts https://nvidia.github.io/dcgm-exporter/helm-charts
helm repo update
helm install dcgm-exporter \
  gpu-helm-charts/dcgm-exporter \
  --namespace gpu-operator \
  --create-namespace

kubectl label node <YOUR-NVIDIA-NODE> gpu=on
```

### 验证依赖项准备情况

在进入第 4 步之前，确保支持的命名空间和工作负载运行正常。

```bash
kubectl get ns monitoring envoy-gateway-system
helm list -n monitoring
helm list -n envoy-gateway-system
kubectl get pods -n monitoring
kubectl get pods -n envoy-gateway-system
```

如果您安装了可选的 GPU exporter，还需要验证 GPU 命名空间：

```bash
kubectl get pods -n gpu-operator
```

仅在 Pod 报告 `Running` 或 `Completed` 状态后才继续。

## 第 4 步：部署 Dynamia AI 平台

### 4.1 安装 HAMi

```bash
export HELM_EXPERIMENTAL_OCI=1

aws ecr get-login-password --region us-east-1 \
  | helm registry login \
    --username AWS \
    --password-stdin 709825985650.dkr.ecr.us-east-1.amazonaws.com

export HAMI_VERSION=1.2.0
rm -rf hami-chart && mkdir hami-chart && cd hami-chart

helm pull oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/dynamia-intelligence/dynamia-ai-hami --version "$HAMI_VERSION"
tar xf "dynamia-ai-hami-${HAMI_VERSION}.tgz"
helm install hami ./dynamia-ai-hami --namespace hami-system --create-namespace
```

### 验证 HAMi

检查基础版本是否已安装、工作负载是否健康以及 GPU 节点是否正在准备中。

```bash
helm list -n hami-system
kubectl get pods -n hami-system
```

Pod 应该报告 `Running` 或 `Completed` 状态。然后验证节点注解和 GPU 资源：

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name} {.metadata.annotations.hami\.io/node-handshake:-missing} {.metadata.annotations.hami\.io/node-nvidia-register:-missing} {.status.allocatable.nvidia\.com/gpu:-0}{"\n"}{end}'
# 预期 GPU 节点上有非空的 handshake 和 nvidia-register 注解，以及 GPU 容量值

# 如需要，详细检查任何节点
kubectl describe node <gpu-node-name> | grep -E 'hami.io/node-(handshake|nvidia-register)|nvidia.com/gpu'
```

一旦注解存在并报告 GPU 容量，即可继续。

### 4.2 安装平台组件

```bash
# 如果上一步的 registry 登录已过期，请在继续之前重新运行

export DYNAMIA_VERSION=0.6.0
rm -rf dynamia-chart && mkdir dynamia-chart && cd dynamia-chart
helm pull oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/dynamia-intelligence/dynamia-ai --version "$DYNAMIA_VERSION"
tar xf "dynamia-ai-${DYNAMIA_VERSION}.tgz"
helm install dynamia ./dynamia-ai --namespace dynamia-system --create-namespace
```

### 验证平台组件部署

在继续之前，确认平台版本已安装且 Pod 运行正常。

```bash
helm list -n dynamia-system
kubectl get pods -n dynamia-system
```

仅在 Pod 报告 `Running` 或 `Completed` 状态后才继续。

## 第 5 步：访问平台

列出服务以识别 Envoy 负载均衡器名称，然后检索其主机名。

```bash
kubectl get service -n envoy-gateway-system

kubectl get service \
  -n envoy-gateway-system \
  <envoy-service-name> \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

在浏览器中打开主机名以访问 Dynamia AI 平台 UI。

---

需要帮助？如有任何关于本指南的问题，请联系我们 <info@dynamia.ai>
