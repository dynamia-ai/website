This document will help you install dynamia ai platform in aws.
# 1. Create an IAM role and bind it to the service account
First, you need to specify a namespace for the application. If you don’t have any special requirements, you can use the default namespace: hami-system.
If you need to specify your own namespace, please remember to replace the relevant values in the following steps.
## Setting Up AWS IAM Permissions for Dynamia AI Platform
This guide explains how to configure AWS IAM permissions for your Kubernetes workloads to access AWS services when using  Dynamia AI Platform.
### Prerequisites
Before you begin, ensure you have:
- An existing Amazon EKS cluster (version 1.13 or later)
- kubectl configured to access your cluster
- eksctl installed (version 0.32.0 or later)
- AWS CLI configured with appropriate permissions
- Your cluster must have an OIDC identity provider
- Helm (version 3.6.0 or later)
### Step 1: Verify Prerequisites
#### Check eksctl Version
```
eksctl version
# Should be 0.32.0 or later
```
#### Check if OIDC Provider Exists
```
aws eks describe-cluster --name <your-cluster-name> --query "cluster.identity.oidc.issuer" --output text
```
If this returns a URL, you already have an OIDC provider. If not, continue to Step 2.
### Step 2: Enable OIDC Identity Provider (One-time setup)
If your cluster doesn't have an OIDC provider, create one:
```
eksctl utils associate-iam-oidc-provider --cluster <your-cluster-name> --approve
```
### Step 3: Create an IAM Service Account
Using Custom IAM Policy
#### 1. Create Custom Policy
```
cat > custom-policy.json <<EOF
{
   "Version":"2012-10-17",
   "Statement":[
      {
         "Sid":"VisualEditorO",
         "Effect":"Allow",
         "Action":[
            "license-manager:CheckoutLicense",
            "license-manager:GetLicenseUsage",
            "license-manager:CheckInLicense",
            "license-manager:ExtendLicenseConsumption"
         ],
         "Resource":"*"
      }
   ]
}
EOF
# Create the policy
aws iam create-policy \ 
--policy-name DynamiaPlatformPolicy \ 
--policy-document file://custom-policy.json
```
#### 2. Create Service Account with Custom Policy
```
eksctl create iamserviceaccount \ 
--cluster=<your-cluster-name> \ 
--namespace=hami-system \ 
--name=dynamia-sa \ 
--attach-policy-arn=arn:aws:iam::<YOUR-ACCOUNT-ID>:policy/DynamiaPlatformPolicy \ 
--approve
```
# 2. Install required components 
Dynamia AI Platform leverages on some open-source components, you should install them first.
## 1. Install prometheus
```
helm install prometheus -n monitoring --create-namespace oci://ghcr.io/prometheus-community/charts/kube-prometheus-stack
```
## 2. Install envoy gataway
```
helm install eg oci://docker.io/envoyproxy/gateway-helm --version v1.5.0 -n envoy-gateway-system --create-namespace
```
## 3. Install certmanager
You can find it and install it at cluster->add on->community add on，you can also follow the [AWS Doc](https://docs.aws.amazon.com/eks/latest/userguide/lbc-manifest.html#lbc-cert) to install it.
# 3. Use helm chart to install Dynamia AI Platform
## 1. Install base components
```
export HELM_EXPERIMENTAL_OCI=1
# The `username` and `password-stdin` correspond to your AWS login credentials.
aws ecr get-login-password --region us-east-1 | helm registry login --username AWS --password-stdin 709825985650.dkr.ecr.us-east-1.amazonaws.com
mkdir awsmp-chart && cd awsmp-chart
helm pull oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/dynamia-intelligence/hami --version 2.6.2
tar xf $(pwd)/* && find $(pwd) -maxdepth 1 -type f -delete
helm install --generate-name --namespace hami-system ./*
```
## 2. Install platform components
```
export HELM_EXPERIMENTAL_OCI=1
# The `username` and `password-stdin` correspond to your AWS login credentials.
aws ecr get-login-password --region us-east-1 | helm registry login --username AWS --password-stdin 709825985650.dkr.ecr.us-east-1.amazonaws.com
mkdir awsmp-chart && cd awsmp-chart
helm pull oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/dynamia-intelligence/dynamiaai --version 0.4.1
tar xf $(pwd)/* && find $(pwd) -maxdepth 1 -type f -delete
helm install dynamia --namespace dynamia-system ./*
```
## 3. Install dcgm-exporter (for cluster using NVIDIA devices)
```
helm repo add gpu-helm-charts https://nvidia.github.io/dcgm-exporter/helm-charts
helm repo update
helm install dcgm-exporter -n gpu-operator gpu-helm-charts/dcgm-exporter --create-namespace
```
# 5. Start using Dynamia AI Platform
Use this command to get the service address, then you can access the platform UI.
```
kubectl get service -n envoy-gateway-system envoy-dynamia-system-kantaloupe-2d73d998 -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
