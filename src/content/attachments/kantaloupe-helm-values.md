---
title: "Kantaloupe Helm Values Reference"
slug: "kantaloupe-helm-values"
description: "helm-docs generated values reference for the Kantaloupe chart used by HAMi AI Platform."
productId: "hami-ai-platform"
lastUpdated: "2026-05-28"
---

> Generated from the Kantaloupe Helm chart with `helm-docs`. This page is distributed by the Dynamia website as a low-visibility attachment.

# kantaloupe-chart

![Version: 0.12.0](https://img.shields.io/badge/Version-0.12.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.11.0](https://img.shields.io/badge/AppVersion-0.11.0-informational?style=flat-square)

A Helm chart for Kubernetes

**Homepage:** <https://github.com/dynamia-ai/kantaloupe>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Dynamia AI |  | <https://dynamia.ai> |

## Source Code

* <https://github.com/dynamia-ai/kantaloupe>

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://cloudtty.github.io/cloudtty/ | cloudtty | >=0.8.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| apiserver.affinity | object | `{}` |  |
| apiserver.clusterAPIBurst | int | `100` |  |
| apiserver.clusterAPIQPS | int | `50` |  |
| apiserver.image.pullPolicy | string | `"IfNotPresent"` |  |
| apiserver.image.pullSecrets | list | `[]` |  |
| apiserver.image.registry | string | `"ghcr.io"` |  |
| apiserver.image.repository | string | `"dynamia-ai/kantaloupe-apiserver"` |  |
| apiserver.image.tag | string | `"v0.11.0"` |  |
| apiserver.labels | object | `{}` |  |
| apiserver.livenessProbe.enabled | bool | `false` |  |
| apiserver.logLevel | int | `4` |  |
| apiserver.nodeSelector | object | `{}` |  |
| apiserver.podAnnotations | object | `{}` |  |
| apiserver.podLabels | object | `{}` |  |
| apiserver.prometheusAddr | string | `""` |  |
| apiserver.readinessProbe.enabled | bool | `false` |  |
| apiserver.replicaCount | int | `1` |  |
| apiserver.resources | object | `{}` |  |
| apiserver.service.nodePort | int | `0` |  |
| apiserver.service.port | int | `8000` |  |
| apiserver.service.type | string | `"NodePort"` |  |
| apiserver.tolerations | object | `{}` |  |
| auth.bootstrapAdminEmail | string | `""` |  |
| auth.bootstrapAdminFullName | string | `"Platform Administrator"` |  |
| auth.bootstrapAdminPassword | string | `""` |  |
| auth.bootstrapAdminUsername | string | `""` |  |
| auth.dbPath | string | `"/data/kantaloupe/auth.db"` |  |
| auth.dryRun | bool | `false` |  |
| auth.enabled | bool | `false` |  |
| auth.existingAuthSecret | string | `""` |  |
| auth.image.pullPolicy | string | `"IfNotPresent"` |  |
| auth.image.registry | string | `"ghcr.io"` |  |
| auth.image.repository | string | `"dynamia-ai/kantaloupe-db-migrate"` |  |
| auth.image.tag | string | `"latest"` |  |
| auth.jwtSecret | string | `""` |  |
| auth.persistence.enabled | bool | `true` |  |
| auth.persistence.size | string | `"1Gi"` |  |
| auth.persistence.storageClass | string | `""` |  |
| cloudshellImage.registry | string | `"ghcr.io"` |  |
| cloudshellImage.repository | string | `"cloudtty/cloudshell"` |  |
| cloudshellImage.tag | string | `"v0.8.2"` |  |
| cloudtty.enabled | bool | `true` |  |
| controlPlaneName | string | `"control-plane"` |  |
| controllerManager.affinity | object | `{}` |  |
| controllerManager.image.pullPolicy | string | `"IfNotPresent"` |  |
| controllerManager.image.pullSecrets | list | `[]` |  |
| controllerManager.image.registry | string | `"ghcr.io"` |  |
| controllerManager.image.repository | string | `"dynamia-ai/kantaloupe-controller-manager"` |  |
| controllerManager.image.tag | string | `"v0.11.0"` |  |
| controllerManager.labels | object | `{}` |  |
| controllerManager.livenessProbe.enabled | bool | `false` |  |
| controllerManager.metricsPort | int | `31001` |  |
| controllerManager.nodeSelector | object | `{}` |  |
| controllerManager.podAnnotations | object | `{}` |  |
| controllerManager.podLabels | object | `{}` |  |
| controllerManager.readinessProbe.enabled | bool | `false` |  |
| controllerManager.replicaCount | int | `1` |  |
| controllerManager.resources | object | `{}` |  |
| controllerManager.tolerations | object | `{}` |  |
| gateway.className | string | `"kantaloupe"` |  |
| gateway.enabled | bool | `true` |  |
| gateway.hostnames | list | `[]` |  |
| gateway.ipAddress | string | `""` |  |
| gateway.listenPort | int | `80` |  |
| gateway.service.httpsNodePort | int | `30443` |  |
| gateway.service.nodePort | int | `30080` |  |
| gateway.service.type | string | `"LoadBalancer"` |  |
| gateway.tls.enabled | bool | `false` |  |
| gateway.tls.httpRedirect | bool | `true` |  |
| gateway.tls.secretName | string | `"cloudflare-origin-tls"` |  |
| global.imagePullSecrets | list | `[]` |  |
| global.imageRegistry | string | `""` |  |
| hamiNamespace | string | `"hami-system"` |  |
| installCRDs | bool | `true` |  |
| monitoring.enabled | bool | `true` |  |
| monitoring.hamiServiceMonitor.enabled | bool | `true` |  |
| monitoring.vendorServiceMonitor.enableAlibabaPPUServicemonitor | bool | `false` |  |
| monitoring.vendorServiceMonitor.enableAscendServicemonitor | bool | `false` |  |
| monitoring.vendorServiceMonitor.enableEnflameServicemonitor | bool | `false` |  |
| monitoring.vendorServiceMonitor.enableMetaxServicemonitor | bool | `false` |  |
| monitoring.vendorServiceMonitor.enableNvidiaServicemonitor | bool | `true` |  |
| monitoring.vendorServiceMonitor.enabled | bool | `true` |  |
| mpu.enabled | bool | `false` |  |
| mpu.image.pullPolicy | string | `"IfNotPresent"` |  |
| mpu.image.registry | string | `"ghcr.io"` |  |
| mpu.image.repository | string | `"dynamia-ai/mpu"` |  |
| mpu.image.tag | string | `"dev-ubuntu24.04"` |  |
| ui.affinity | object | `{}` |  |
| ui.forceChinese | bool | `false` |  |
| ui.image.pullPolicy | string | `"IfNotPresent"` |  |
| ui.image.pullSecrets | list | `[]` |  |
| ui.image.registry | string | `"ghcr.io"` |  |
| ui.image.repository | string | `"dynamia-ai/kantaloupe-ui"` |  |
| ui.image.tag | string | `"v0.8.0"` |  |
| ui.labels | object | `{}` |  |
| ui.livenessProbe.enabled | bool | `false` |  |
| ui.nodeSelector | object | `{}` |  |
| ui.podAnnotations | object | `{}` |  |
| ui.podLabels | object | `{}` |  |
| ui.readinessProbe.enabled | bool | `false` |  |
| ui.replicaCount | int | `1` |  |
| ui.resources | object | `{}` |  |
| ui.service.nodePort | int | `31300` |  |
| ui.service.port | int | `80` |  |
| ui.service.type | string | `"NodePort"` |  |
| ui.tolerations | object | `{}` |  |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
