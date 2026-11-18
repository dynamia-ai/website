---
title: Dynamia AI Platform auf AWS mit EKS bereitstellen
coverTitle: Dynamia AI Platform auf AWS mit EKS bereitstellen
date: '2025-09-26'
excerpt: >-
  Mit dieser erprobten Checkliste IAM vorbereiten, Cluster-Add-ons installieren und die
  Dynamia AI Platform auf Amazon EKS in etwa einer Stunde ausrollen.
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
aiRepostLinks:
  - label: ChatGPT Summary
    description: AI-generated highlights of this deployment guide
    url: 'https://chat.openai.com/'
    icon: chatgpt
  - label: Claude Recap
    description: Quick take from Claude on AWS setup steps
    url: 'https://claude.ai/'
    icon: claude
  - label: Gemini Notes
    description: Google Gemini walkthrough and reminders
    url: 'https://gemini.google.com/'
    icon: gemini
linktitle: Dynamia AI on AWS
---

Mit diesem Leitfaden deployen Sie die Dynamia AI Platform auf AWS — inklusive IAM-Rolle, unterstützender Komponenten und Helm Charts.

---

## Schritt 1. Voraussetzungen

Vor dem Start sollten Folgendes vorhanden sein:

- Ein Amazon-EKS-Cluster mit Kubernetes 1.31 oder neuer ([EKS-Cluster erstellen](https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html)) mit diesen Add-ons installiert und healthy:
  - `kube-proxy`
  - `cert-manager`
  - `metrics-server`
  - `Amazon EKS Pod Identity Agent`
  - `Amazon VPC CNI`
- `kubectl` für den Cluster konfiguriert ([kubectl installieren](https://kubernetes.io/docs/tasks/tools/))
- `eksctl` Version 0.32.0 oder neuer ([eksctl installieren](https://eksctl.io/installation/))
- AWS CLI mit IAM-Rechten für Policies und Service Accounts ([AWS CLI installieren](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- OIDC-Identity-Provider am Cluster assoziiert ([OIDC-Provider aktivieren](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html))
- Helm 3.6.0 oder neuer ([Helm installieren](https://helm.sh/docs/intro/install/))

CLI prüfen:

```bash
# Confirms kubectl is installed 
kubectl version 

# Confirms the AWS CLI is installed and your credentials work.
aws --version
aws sts get-caller-identity

# Expected: 0.32.0 or later
eksctl version
```

`eksctl get addons --cluster <your-cluster-name>` ausführen und prüfen, dass die Add-ons `ACTIVE` sind, z. B.:

```bash
~ $ eksctl get addons --cluster <your-cluster-name>
NAME                    VERSION                 STATUS  ISSUES  IAMROLE UPDATE AVAILABLE                                                                                                                        CONFIGURATION VALUES    NAMESPACE       POD IDENTITY ASSOCIATION ROLES
cert-manager            v1.18.2-eksbuild.2      ACTIVE  0                                                                                                                                                                               cert-manager
eks-pod-identity-agent  v1.3.8-eksbuild.2       ACTIVE  0                                                                                                                                                                               kube-system
kube-proxy              v1.33.0-eksbuild.2      ACTIVE  0               v1.33.3-eksbuild.6,v1.33.3-eksbuild.4                                                                                                                           kube-system
metrics-server          v0.8.0-eksbuild.2       ACTIVE  0                                                                                                                                                                               kube-system
vpc-cni                 v1.19.5-eksbuild.1      ACTIVE  0               v1.20.2-eksbuild.1,v1.20.1-eksbuild.3,v1.20.1-eksbuild.1,v1.20.0-eksbuild.1,v1.19.6-eksbuild.7,v1.19.6-eksbuild.1,v1.19.5-eksbuild.3                            kube-system     arn:aws:iam::265950574560:role/AmazonEKSPodIdentityAmazonVPCCNIRole

```

## Schritt 2. IAM-Zugriff konfigurieren

Namespace für Dynamia AI Platform wählen (Standard: `hami-system`). In allen folgenden Befehlen entsprechend ersetzen.

### 2.1 OIDC-Provider assoziieren (einmal pro Cluster)

```bash
eksctl utils associate-iam-oidc-provider --cluster <your-cluster-name> --approve
```

### 2.2 Custom IAM Policy erstellen

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

### 2.3 IAM Service Account erstellen

```bash
eksctl create iamserviceaccount \
  --cluster=<your-cluster-name> \
  --namespace=hami-system \
  --name=dynamia-sa \
  --attach-policy-arn=arn:aws:iam::<YOUR-ACCOUNT-ID>:policy/DynamiaPlatformPolicy \
  --approve
```

## Schritt 3. Cluster-Abhängigkeiten installieren

Die Dynamia AI Platform benötigt mehrere Open-Source-Komponenten. Diese vor den Platform-Charts installieren.

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

cert-manager über die EKS-Konsole unter **Cluster → Add-ons → Community add-ons** oder per [AWS-Dokumentation](https://docs.aws.amazon.com/eks/latest/userguide/lbc-manifest.html#lbc-cert).

### 3.4 (Optional) DCGM Exporter für NVIDIA-GPU-Knoten

```bash
helm repo add gpu-helm-charts https://nvidia.github.io/dcgm-exporter/helm-charts
helm repo update
helm install dcgm-exporter \
  gpu-helm-charts/dcgm-exporter \
  --namespace gpu-operator \
  --create-namespace

kubectl label node <YOUR-NVIDIA-NODE> gpu=on
```

### Abhängigkeiten prüfen

Namespaces und Workloads vor Schritt 4 verifizieren:

```bash
kubectl get ns monitoring envoy-gateway-system
helm list -n monitoring
helm list -n envoy-gateway-system
kubectl get pods -n monitoring
kubectl get pods -n envoy-gateway-system
```

Bei optionalem GPU-Exporter:

```bash
kubectl get pods -n gpu-operator
```

Erst fortfahren, wenn Pods `Running` oder `Completed` melden.

## Schritt 4. Dynamia AI Platform deployen

### 4.1 HAMi installieren

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

### Verify HAMi

Check that the base release is installed, the workloads are healthy, and GPU nodes are being prepared.

```bash
helm list -n hami-system
kubectl get pods -n hami-system
```

The pods should report `Running` or `Completed`. Then verify the node annotations and GPU resources:

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name} {.metadata.annotations.hami\.io/node-handshake:-missing} {.metadata.annotations.hami\.io/node-nvidia-register:-missing} {.status.allocatable.nvidia\.com/gpu:-0}{"\n"}{end}'
# Expect non-empty handshake and nvidia-register annotations on GPU nodes, and GPU capacity values.

# Inspect any node in detail if needed.
kubectl describe node <gpu-node-name> | grep -E 'hami.io/node-(handshake|nvidia-register)|nvidia.com/gpu'
```

Proceed once the annotations are present and GPU capacity is reported.

### 4.2 Install platform components

```bash
# If the registry login from the previous step has expired, run it again before continuing.

export DYNAMIA_VERSION=0.6.0
rm -rf dynamia-chart && mkdir dynamia-chart && cd dynamia-chart
helm pull oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/dynamia-intelligence/dynamia-ai --version "$DYNAMIA_VERSION"
tar xf "dynamia-ai-${DYNAMIA_VERSION}.tgz"
helm install dynamia ./dynamia-ai --namespace dynamia-system --create-namespace
```

### Verify platform component deployment

Confirm the platform release is installed and pods are healthy before moving on.

```bash
helm list -n dynamia-system
kubectl get pods -n dynamia-system
```

Proceed once the pods report `Running` or `Completed`.

## Schritt 5. Plattform-Zugriff

Services auflisten, Envoy-Load-Balancer-Namen ermitteln, Hostname abrufen:

```bash
kubectl get service -n envoy-gateway-system

kubectl get service \
  -n envoy-gateway-system \
  <envoy-service-name> \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Hostname im Browser öffnen für die Dynamia AI Platform UI.

---

Fragen zu diesem Leitfaden: <info@dynamia.ai>