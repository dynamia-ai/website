---
title: "Multiple Chips and Models: How Bank of Ningbo Builds AI Infrastructure"
date: "2026-11-25"
excerpt: "Bank of Ningbo uses Kubernetes, HAMi and Higress to progressively unify heterogeneous resource management and inference-service governance, supporting models of different sizes and cross-cluster service sharing on existing infrastructure."
author: "Dynamia"
category: "Case Study"
coverDisplay: "text"
tags: ["Kubernetes", "HAMi", "Higress", "Bank of Ningbo", "AI Infrastructure"]
---

> As financial AI applications move into production, banks face practical challenges in managing heterogeneous compute resources and deploying models of different sizes.
>
> In Bank of Ningbo’s cloud-native AI implementation, HAMi manages and schedules underlying heterogeneous resources, bringing supported GPUs and domestic accelerators into Kubernetes. It works with Higress at the inference-service governance layer, creating a layered architecture from resource allocation to inference traffic governance.
>
> This article examines the bank’s architecture, open-source component choices, initial results and future direction as a reference for heterogeneous AI infrastructure in financial services.

## Background

Bank of Ningbo is a regional city commercial bank focused on local inclusive finance, retail banking, corporate banking and intelligent risk management.

In recent years, it has continued its digital and AI transformation, progressively deploying financial large language models (LLMs) in its private environment, fine-tuning models for business scenarios and introducing intelligent inference services.

Its portfolio now includes general-purpose large models, long-context business models, lightweight question-answering models and finance-specific models. As AI enters everyday production use, heterogeneous resources, including general-purpose GPUs and domestic accelerators, have also come into use.

Compared with large banks, city commercial banks generally emphasize lightweight implementation, incremental iteration and practical business results. Rather than building very large compute clusters, they focus on using existing resources effectively, standardizing model services and connecting model capabilities to business scenarios.

Against this background, Bank of Ningbo began a phased effort to standardize its AI infrastructure and consolidate resources.

## Architecture and objectives

### Challenges

As AI moves from pilots into everyday banking, the bank needs to run multiple types of models on general-purpose GPUs and domestic NPUs.

However, hardware-specific deployment stacks, whole-card allocation and independently exposed model services gradually created resource islands.

Some clusters were overloaded while compute in others was underused. Teams also had to match models, accelerators and service endpoints manually for each workload, increasing deployment and operational complexity.

The bank therefore chose open-source cloud-native technologies to make better use of existing compute and model assets, rather than relying solely on large-scale hardware expansion, and to deliver financial AI applications through lightweight, standardized and efficient implementation.

### Core objectives

- **Unified heterogeneous resource management:** establish a common resource model on Kubernetes and reduce the cost of maintaining separate deployment stacks for different chips.
- **A unified inference-service entry point:** abstract differences in hardware and cluster distribution to simplify model-service calls from business applications.
- **Tiered routing across models:** match models of different sizes to task requirements, avoiding unnecessary use of high-end compute for lightweight tasks such as routine question answering.
- **Cross-cluster inference-service sharing:** share service capacity between GPU and domestic-accelerator clusters, with basic traffic diversion and failover.
- **Controlled implementation costs:** use an incremental approach that can serve as a reference for AI infrastructure at other small and medium-sized banks.

### Overall architecture

**On Kubernetes, Bank of Ningbo built a layered architecture centered on resource management and inference-service governance.**

From bottom to top, its four layers are heterogeneous infrastructure and resource pools, the financial Kubernetes foundation, the LLM service platform and intelligent business applications.

The design follows three principles:

- Separate concerns so the compute, platform and service layers can evolve independently.
- Reduce repeated configuration by managing different resource pools through multiple Kubernetes clusters.
- Expand incrementally, introducing components such as Kueue and Spiderpool according to scenario requirements.

![Bank of Ningbo’s layered AI infrastructure architecture](/images/blog/bank-of-ningbo-ai-infrastructure/image-01-en.png)

### Heterogeneous infrastructure and resource pools

General-purpose GPUs, domestic NPUs and other accelerators, together with high-speed networks and distributed storage, are deployed in the bank’s financial private cloud to form the heterogeneous infrastructure.

Resources are divided by chip type into GPU and domestic-accelerator pools. Separate Kubernetes clusters manage these pools to avoid interference between vendors’ drivers, runtimes and operational procedures.

The architecture keeps each chip platform’s existing drivers and runtime environment, addressing resource management to reduce the complexity of managing and configuring different kinds of compute.

### Kubernetes foundation and resource management

A multi-cluster Kubernetes foundation manages the GPU and domestic-accelerator pools, providing a consistent container runtime environment for model services and platform components.

On this foundation, the bank introduced or planned the following open-source components for scheduling, queue and quota management, and container networking.

#### **HAMi: heterogeneous resource management and scheduling**

HAMi registers accelerators supported by adapted device plugins and runtimes as resources Kubernetes can recognize and request. It provides a relatively consistent resource view, request mechanism and scheduling workflow, choosing whole-device allocation or fine-grained partitioning according to hardware capabilities. This reduces the complexity of managing and configuring different hardware types.

#### **Kueue: queue and quota management**

Kueue is planned for a later phase. It will provide queue priorities and quota management when cross-department resource sharing and batch-training workloads expand further.

#### **Spiderpool: network management**

As a supporting component, Spiderpool provides IP address allocation and network orchestration for containers in the clusters.

These components work with Kubernetes’ native scheduling mechanisms to support standardized resource-request templates, scheduling constraints and deployment workflows, reducing repeated configuration when the same model is deployed across clusters.

### LLM service platform and inference-service governance

The LLM service platform comprises a model-management foundation and an inference-service governance layer.

The model-management foundation handles model lifecycle management, tagging, categorization and grouping, access control and a model marketplace. It gives business departments a unified view of model assets and an entry point for using them.

Higress supports inference-service governance, including a unified service entry point, request-attribute-based model routing, traffic weights, health checks and removal of unhealthy backends, runtime observability and security controls.

Higress has clear responsibility boundaries with the bank’s existing API gateway and security platform.

#### **Tiered model routing based on request attributes**

To support mixed deployments of general-purpose large models, long-context business models, lightweight question-answering models and finance-specific models, Higress routes requests to suitable model services according to preconfigured policies.

Routing may use business origin, API type and path, caller identity, business labels, context length, request priority, SLA tier, requested model and backend service status.

More complex tasks can be routed to larger models, while routine question answering and lightweight scenarios use smaller models to avoid unnecessary consumption of high-end compute.

#### Logical pooling of inference services across chip types

In this architecture, HAMi allocates compute resources during deployment, while Higress governs inference traffic at runtime.

When models with the same specifications are deployed in GPU and domestic-accelerator clusters, Higress offers a relatively unified service entry point. It distributes new requests among model services in different clusters based on preset weights, business rules and backend health.

This provides a degree of cross-chip inference-service sharing and basic failover.

Specifically, preconfigured traffic weights, business-tier policies, health checks and threshold-triggered mechanisms allocate requests between inference clusters.

If the primary cluster becomes unhealthy or reaches a preset load threshold, eligible new requests can be forwarded to a standby cluster for basic traffic diversion and failover.

### Intelligent business applications

Internal AI applications for risk management, customer service, operations auditing, text parsing and marketing call model services through the unified entry point.

Business systems do not need to know the underlying chip types or cluster distribution. Model tags and access controls let departments use capabilities on demand and gradually reuse models, compute and service capabilities.

## Why these projects were chosen

### **Kubernetes**

Kubernetes fits the bank’s existing financial private-cloud architecture. It provides container orchestration, resource scheduling and cluster self-healing, supports AI services across chip types and models, and establishes a standardized foundation for unified resource management and inference-service governance.

### **HAMi**

HAMi integrates natively with Kubernetes without requiring a large-scale rebuild of the existing stack.

Its core value is bringing supported heterogeneous accelerators into Kubernetes resource management, with a relatively consistent resource view, request mechanism and scheduling workflow. This reduces the complexity of separately managing and configuring different hardware types.

Drivers, runtimes, model images and operator adaptation for each chip remain the responsibility of the corresponding hardware platform. Whole-device or fine-grained resource allocation is selected according to each device’s actual capabilities.

### **Higress**

Compared with a general-purpose API gateway, Higress offers governance for AI inference services, including a unified entry point, request-attribute-based routing, backend selection based on traffic weights and health, removal of unhealthy backends and basic observability.

As a traffic-governance component at the inference-service layer, Higress neither replaces underlying resource scheduling nor optimizes the inference engine itself.

### **Spiderpool**

Spiderpool provides IP address allocation and network orchestration for containers as a supporting infrastructure component.

### **Kueue**

The bank currently manages training and inference in separate resource pools. Competition between tenants is relatively limited, and there is not yet a need for large-scale batch-job queues.

Kueue is currently a technical reserve for future expansion of cross-department compute sharing and batch training. It is not included among the implemented results of this architecture.

## Initial results and practical lessons

### Initial results

The bank has made phased progress in unified resource management and inference-service governance.

#### Resource management

- The scope of unified heterogeneous resource management is expanding, and supported accelerators can be connected through a consistent process.
- Repeated resource configuration and service onboarding have been reduced.
- Whole-device and fine-grained allocation have been validated in selected scenarios.

#### Inference-service governance

- Initial tiered model routing is based on input attributes and preconfigured policies.
- Cross-cluster traffic switching has been validated in selected scenarios, including health-check-based backend removal and threshold-triggered diversion.
- A technical foundation has been established for future optimization of model-call costs and service reliability.

### Reusable lessons

#### Clear layers and component responsibilities

The two-layer division, with HAMi managing underlying resources and Higress governing inference services above them, fits the current implementation scope. Clear boundaries avoid confusion about component capabilities.

#### Designed for heterogeneous environments at small and medium-sized banks

The approach addresses the coexistence of multiple chip types and model sizes common at city commercial banks, rather than assuming one compute type and standardized models. Resource management and a unified service entry point provide a lightweight implementation path with controllable investment.

#### Pragmatic reuse of open-source components

HAMi focuses on resource management and scheduling, while Higress focuses on inference-service traffic governance. Both are managed within the bank’s existing security framework. The components are configured and integrated to meet banking deployment and operational requirements, without overstating their capabilities.

#### A lightweight path to using existing resources effectively

The bank improves the use of existing compute and model assets through resource management and service governance instead of relying solely on hardware expansion. This offers small and medium-sized banks a practical path that can be advanced incrementally.

## Future development

### **Expand HAMi coverage**

Bring additional accelerator cards under management after their device plugins and runtimes are adapted, while continuing to refine whole-device and partitioned-resource allocation policies.

### **Improve inference-service governance**

Refine input-attribute-based routing and establish mechanisms to adjust traffic weights periodically and according to runtime conditions. Lightweight classification or intent-recognition components may later provide routing labels to the AI gateway, gradually enabling semantic model selection in AI-agent scenarios.

### **Explore real-time dynamic traffic allocation**

Once inference-engine metrics, service discovery, monitoring and weight-control mechanisms are ready, investigate dynamic allocation based on real-time latency, concurrency and node health.

### **Introduce Kueue**

Add queue priorities and quota management when cross-department resource sharing and batch-training workloads reach sufficient scale.

### **Share experience with open-source communities**

Continue documenting city commercial banks’ experience building and operating heterogeneous AI clusters. Feed real business requirements back to the HAMi and Higress communities so the projects and industry practice evolve together.

> Adapted from the [Bank of Ningbo CNCF case study](https://endusers.cncf.io/architectures/bank-of-ningbo/), published by the Cloud Native Computing Foundation (CNCF).

> The original case study was submitted to CNCF by Bank of Ningbo and DaoCloud under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This article is adapted and translated from the Chinese submission.
