---
title: "HAMi Helm Values Reference"
slug: "hami-helm-values"
description: "helm-docs generated values reference for the HAMi chart."
productId: "hami-enterprise"
lastUpdated: "2026-05-28"
---

> Generated from the HAMi Helm chart with `helm-docs`. This page is distributed by the Dynamia website as a low-visibility attachment.

# hami

![Version: 2.9.0-rc1](https://img.shields.io/badge/Version-2.9.0--rc1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.9.0-rc1](https://img.shields.io/badge/AppVersion-2.9.0--rc1-informational?style=flat-square)

Heterogeneous AI Computing Virtualization Middleware

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| limengxuan | <archlitchi@gmail.com> |  |
| zhangxiao | <xiaozhang0210@hotmail.com> |  |

## Source Code

* <https://github.com/dynamia-ai/hami-commercial>

## Requirements

Kubernetes: `>= 1.18.0-0`

| Repository | Name | Version |
|------------|------|---------|
| https://project-hami.github.io/HAMi-DRA/ | hami-dra | 0.2.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| dcuResourceCores | string | `"hygon.com/dcucores"` |  |
| dcuResourceMem | string | `"hygon.com/dcumem"` |  |
| dcuResourceName | string | `"hygon.com/dcunum"` |  |
| devicePlugin.createRuntimeClass | bool | `false` |  |
| devicePlugin.deviceCoreScaling | int | `1` |  |
| devicePlugin.deviceListStrategy | string | `"envvar"` |  |
| devicePlugin.deviceMemoryScaling | int | `1` |  |
| devicePlugin.deviceSplitCount | int | `10` |  |
| devicePlugin.disablecorelimit | string | `"false"` |  |
| devicePlugin.enabled | bool | `true` |  |
| devicePlugin.extraArgs[0] | string | `"-v=4"` |  |
| devicePlugin.extraEnvs | object | `{}` |  |
| devicePlugin.gdrcopyEnabled | string | `nil` |  |
| devicePlugin.gdsEnabled | string | `nil` |  |
| devicePlugin.gpuOperatorToolkitReady.enabled | bool | `false` |  |
| devicePlugin.gpuOperatorToolkitReady.hostPath | string | `"/run/nvidia/validations"` |  |
| devicePlugin.image.pullPolicy | string | `"IfNotPresent"` |  |
| devicePlugin.image.pullSecrets | list | `[]` |  |
| devicePlugin.image.registry | string | `"ghcr.io"` |  |
| devicePlugin.image.repository | string | `"dynamia-ai/hami"` |  |
| devicePlugin.image.tag | string | `""` |  |
| devicePlugin.libPath | string | `"/usr/local/vgpu"` |  |
| devicePlugin.migStrategy | string | `"none"` |  |
| devicePlugin.mofedEnabled | string | `nil` |  |
| devicePlugin.monitor.ctrPath | string | `"/usr/local/vgpu/containers"` |  |
| devicePlugin.monitor.extraArgs[0] | string | `"-v=4"` |  |
| devicePlugin.monitor.extraEnvs | object | `{}` |  |
| devicePlugin.monitor.image.pullPolicy | string | `"IfNotPresent"` |  |
| devicePlugin.monitor.image.pullSecrets | list | `[]` |  |
| devicePlugin.monitor.image.registry | string | `"ghcr.io"` |  |
| devicePlugin.monitor.image.repository | string | `"dynamia-ai/hami"` |  |
| devicePlugin.monitor.image.tag | string | `""` |  |
| devicePlugin.monitor.resources | object | `{}` |  |
| devicePlugin.monitor.resyncInterval | string | `"5m"` |  |
| devicePlugin.nodeConfiguration.config | string | `"{\n  \"nodeconfig\": [\n    {\n      \"name\": \"your-node-name\",\n      \"operatingmode\": \"hami-core\",\n      \"devicememoryscaling\": 1,\n      \"devicesplitcount\": 10,\n      \"preconfigureddevicememory\": 0,\n      \"migstrategy\": \"none\",\n      \"filterdevices\": {\n        \"uuid\": [],\n        \"index\": []\n      },\n      \"enablegetpreferredallocation\": false\n    }\n  ]\n}\n"` |  |
| devicePlugin.nodeConfiguration.externalConfigName | string | `""` |  |
| devicePlugin.nvidiaDriverRoot | string | `nil` |  |
| devicePlugin.nvidiaHookPath | string | `nil` |  |
| devicePlugin.nvidiaNodeSelector.gpu | string | `"on"` |  |
| devicePlugin.passDeviceSpecsEnabled | bool | `false` |  |
| devicePlugin.pluginPath | string | `"/var/lib/kubelet/device-plugins"` |  |
| devicePlugin.podAnnotations | object | `{}` |  |
| devicePlugin.preConfiguredDeviceMemory | int | `0` |  |
| devicePlugin.resources | object | `{}` |  |
| devicePlugin.runtimeClassName | string | `""` |  |
| devicePlugin.service.annotations | object | `{}` |  |
| devicePlugin.service.httpPort | int | `31992` |  |
| devicePlugin.service.labels | object | `{}` |  |
| devicePlugin.service.type | string | `"NodePort"` |  |
| devicePlugin.tolerations | list | `[]` |  |
| devicePlugin.updateStrategy.rollingUpdate.maxUnavailable | int | `1` |  |
| devicePlugin.updateStrategy.type | string | `"RollingUpdate"` |  |
| devices.alibaba.customresources[0] | string | `"alibaba.com/ppu"` |  |
| devices.alibaba.customresources[1] | string | `"alibaba.com/ppu-memory"` |  |
| devices.alibaba.customresources[2] | string | `"alibaba.com/gpu-core"` |  |
| devices.alibaba.enabled | bool | `true` |  |
| devices.alibaba.ppuCorePolicy | string | `"default"` |  |
| devices.amd.customresources[0] | string | `"amd.com/gpu"` |  |
| devices.amd.customresources[1] | string | `"amd.com/gpumem"` |  |
| devices.ascend.customresources[0] | string | `"huawei.com/Ascend910A"` |  |
| devices.ascend.customresources[10] | string | `"huawei.com/Ascend910B4-memory"` |  |
| devices.ascend.customresources[11] | string | `"huawei.com/Ascend910B4-core"` |  |
| devices.ascend.customresources[12] | string | `"huawei.com/Ascend910B4-1"` |  |
| devices.ascend.customresources[13] | string | `"huawei.com/Ascend910B4-1-memory"` |  |
| devices.ascend.customresources[14] | string | `"huawei.com/Ascend910B4-1-core"` |  |
| devices.ascend.customresources[15] | string | `"huawei.com/Ascend310P"` |  |
| devices.ascend.customresources[16] | string | `"huawei.com/Ascend310P-memory"` |  |
| devices.ascend.customresources[17] | string | `"huawei.com/Ascend310P-core"` |  |
| devices.ascend.customresources[18] | string | `"huawei.com/Ascend910C"` |  |
| devices.ascend.customresources[19] | string | `"huawei.com/Ascend910C-memory"` |  |
| devices.ascend.customresources[1] | string | `"huawei.com/Ascend910A-memory"` |  |
| devices.ascend.customresources[20] | string | `"huawei.com/Ascend910C-core"` |  |
| devices.ascend.customresources[2] | string | `"huawei.com/Ascend910A-core"` |  |
| devices.ascend.customresources[3] | string | `"huawei.com/Ascend910B2"` |  |
| devices.ascend.customresources[4] | string | `"huawei.com/Ascend910B2-memory"` |  |
| devices.ascend.customresources[5] | string | `"huawei.com/Ascend910B2-core"` |  |
| devices.ascend.customresources[6] | string | `"huawei.com/Ascend910B3"` |  |
| devices.ascend.customresources[7] | string | `"huawei.com/Ascend910B3-memory"` |  |
| devices.ascend.customresources[8] | string | `"huawei.com/Ascend910B3-core"` |  |
| devices.ascend.customresources[9] | string | `"huawei.com/Ascend910B4"` |  |
| devices.ascend.enabled | bool | `false` |  |
| devices.ascend.extraArgs | list | `[]` |  |
| devices.ascend.hamiVnpuCore | bool | `false` |  |
| devices.ascend.image | string | `""` |  |
| devices.ascend.imagePullPolicy | string | `"IfNotPresent"` |  |
| devices.ascend.nodeSelector.ascend | string | `"on"` |  |
| devices.ascend.runtimeClassName | string | `""` |  |
| devices.ascend.tolerations | list | `[]` |  |
| devices.awsneuron.customresources[0] | string | `"aws.amazon.com/neuron"` |  |
| devices.awsneuron.customresources[1] | string | `"aws.amazon.com/neuroncore"` |  |
| devices.enflame.customresources[0] | string | `"enflame.com/vgcu"` |  |
| devices.enflame.customresources[1] | string | `"enflame.com/vgcu-percentage"` |  |
| devices.enflame.customresources[2] | string | `"enflame.com/gcu"` |  |
| devices.enflame.enabled | bool | `true` |  |
| devices.iluvatar.customresources[0] | string | `"iluvatar.ai/BI-V100-vgpu"` |  |
| devices.iluvatar.customresources[10] | string | `"iluvatar.ai/MR-V50.vCore"` |  |
| devices.iluvatar.customresources[11] | string | `"iluvatar.ai/MR-V50.vMem"` |  |
| devices.iluvatar.customresources[1] | string | `"iluvatar.ai/BI-V100.vCore"` |  |
| devices.iluvatar.customresources[2] | string | `"iluvatar.ai/BI-V100.vMem"` |  |
| devices.iluvatar.customresources[3] | string | `"iluvatar.ai/BI-V150-vgpu"` |  |
| devices.iluvatar.customresources[4] | string | `"iluvatar.ai/BI-V150.vCore"` |  |
| devices.iluvatar.customresources[5] | string | `"iluvatar.ai/BI-V150.vMem"` |  |
| devices.iluvatar.customresources[6] | string | `"iluvatar.ai/MR-V100-vgpu"` |  |
| devices.iluvatar.customresources[7] | string | `"iluvatar.ai/MR-V100.vCore"` |  |
| devices.iluvatar.customresources[8] | string | `"iluvatar.ai/MR-V100.vMem"` |  |
| devices.iluvatar.customresources[9] | string | `"iluvatar.ai/MR-V50-vgpu"` |  |
| devices.iluvatar.enabled | bool | `false` |  |
| devices.kunlun.customresources[0] | string | `"kunlunxin.com/xpu"` |  |
| devices.kunlun.customresources[1] | string | `"kunlunxin.com/vxpu"` |  |
| devices.kunlun.customresources[2] | string | `"kunlunxin.com/vxpu-memory"` |  |
| devices.kunlun.enabled | bool | `true` |  |
| devices.mthreads.customresources[0] | string | `"mthreads.com/vgpu"` |  |
| devices.mthreads.enabled | bool | `true` |  |
| devices.nvidia.gpuCorePolicy | string | `"default"` |  |
| devices.nvidia.libCudaLogLevel | int | `2` |  |
| devices.vastai.customresources[0] | string | `"vastaitech.com/va"` |  |
| devices.vastai.enabled | bool | `true` |  |
| dra.enabled | bool | `false` |  |
| enflameResourceNameVGCU | string | `"enflame.com/vgcu"` |  |
| enflameResourceNameVGCUPercentage | string | `"enflame.com/vgcu-percentage"` |  |
| fullnameOverride | string | `""` |  |
| global.annotations | object | `{}` |  |
| global.gpuHookPath | string | `"/usr/local"` |  |
| global.imagePullSecrets | list | `[]` |  |
| global.imageRegistry | string | `""` |  |
| global.imageTag | string | `"v2.9.0-rc1"` |  |
| global.labels | object | `{}` |  |
| global.managedNodeSelector.usage | string | `"gpu"` |  |
| global.managedNodeSelectorEnable | bool | `false` |  |
| hami-dra.drivers.nvidia.containerDriver | bool | `true` |  |
| hami-dra.drivers.nvidia.enabled | bool | `true` |  |
| hami-dra.drivers.nvidia.image.repository | string | `"ghcr.io/project-hami/k8s-dra-driver"` |  |
| hami-dra.drivers.nvidia.image.tag | string | `"main"` |  |
| hami-dra.monitor.enabled | bool | `true` |  |
| kunlunResourceName | string | `"kunlunxin.com/xpu"` |  |
| kunlunResourceVCountName | string | `"kunlunxin.com/vxpu"` |  |
| kunlunResourceVMemoryName | string | `"kunlunxin.com/vxpu-memory"` |  |
| legacyMetrics | bool | `false` |  |
| metaxResourceCore | string | `"metax-tech.com/vcore"` |  |
| metaxResourceMem | string | `"metax-tech.com/vmemory"` |  |
| metaxResourceName | string | `"metax-tech.com/sgpu"` |  |
| metaxsGPUTopologyAware | string | `"false"` |  |
| mluResourceCores | string | `"cambricon.com/mlu.smlu.vcore"` |  |
| mluResourceMem | string | `"cambricon.com/mlu.smlu.vmemory"` |  |
| mluResourceName | string | `"cambricon.com/vmlu"` |  |
| mockDevicePlugin.enabled | bool | `false` |  |
| mockDevicePlugin.image.pullPolicy | string | `"IfNotPresent"` |  |
| mockDevicePlugin.image.pullSecrets | list | `[]` |  |
| mockDevicePlugin.image.registry | string | `"docker.io"` |  |
| mockDevicePlugin.image.repository | string | `"projecthami/mock-device-plugin"` |  |
| mockDevicePlugin.image.tag | string | `"1.0.1"` |  |
| nameOverride | string | `""` |  |
| namespaceOverride | string | `""` |  |
| podSecurityPolicy.enabled | bool | `false` |  |
| prometheus.enabled | bool | `false` |  |
| resourceCores | string | `"nvidia.com/gpucores"` |  |
| resourceMem | string | `"nvidia.com/gpumem"` |  |
| resourceMemPercentage | string | `"nvidia.com/gpumem-percentage"` |  |
| resourceName | string | `"nvidia.com/gpu"` |  |
| resourcePriority | string | `"nvidia.com/priority"` |  |
| scheduler.admissionWebhook.customURL.enabled | bool | `false` |  |
| scheduler.admissionWebhook.customURL.host | string | `"127.0.0.1"` |  |
| scheduler.admissionWebhook.customURL.path | string | `"/webhook"` |  |
| scheduler.admissionWebhook.customURL.port | int | `31998` |  |
| scheduler.admissionWebhook.enabled | bool | `true` |  |
| scheduler.admissionWebhook.failurePolicy | string | `"Ignore"` |  |
| scheduler.admissionWebhook.namespaceSelector.matchExpressions | list | `[]` |  |
| scheduler.admissionWebhook.namespaceSelector.matchLabels | string | `nil` |  |
| scheduler.admissionWebhook.objectSelector.matchExpressions | list | `[]` |  |
| scheduler.admissionWebhook.reinvocationPolicy | string | `"Never"` |  |
| scheduler.admissionWebhook.whitelistNamespaces | string | `nil` |  |
| scheduler.certManager.enabled | bool | `false` |  |
| scheduler.defaultSchedulerPolicy.gpuSchedulerPolicy | string | `"spread"` |  |
| scheduler.defaultSchedulerPolicy.nodeSchedulerPolicy | string | `"binpack"` |  |
| scheduler.extender.extraArgs[0] | string | `"--debug"` |  |
| scheduler.extender.extraArgs[1] | string | `"-v=4"` |  |
| scheduler.extender.image.pullPolicy | string | `"IfNotPresent"` |  |
| scheduler.extender.image.pullSecrets | list | `[]` |  |
| scheduler.extender.image.registry | string | `"ghcr.io"` |  |
| scheduler.extender.image.repository | string | `"dynamia-ai/hami"` |  |
| scheduler.extender.image.tag | string | `""` |  |
| scheduler.extender.resources | object | `{}` |  |
| scheduler.forceOverwriteDefaultScheduler | bool | `true` |  |
| scheduler.kubeScheduler.enabled | bool | `true` |  |
| scheduler.kubeScheduler.extraArgs[0] | string | `"--policy-config-file=/config/config.json"` |  |
| scheduler.kubeScheduler.extraArgs[1] | string | `"-v=4"` |  |
| scheduler.kubeScheduler.extraNewArgs[0] | string | `"--config=/config/config.yaml"` |  |
| scheduler.kubeScheduler.extraNewArgs[1] | string | `"-v=4"` |  |
| scheduler.kubeScheduler.image.pullPolicy | string | `"IfNotPresent"` |  |
| scheduler.kubeScheduler.image.pullSecrets | list | `[]` |  |
| scheduler.kubeScheduler.image.registry | string | `"registry.cn-hangzhou.aliyuncs.com"` |  |
| scheduler.kubeScheduler.image.repository | string | `"google_containers/kube-scheduler"` |  |
| scheduler.kubeScheduler.image.tag | string | `""` |  |
| scheduler.kubeScheduler.resources | object | `{}` |  |
| scheduler.leaderElect | bool | `true` |  |
| scheduler.livenessProbe | bool | `false` |  |
| scheduler.metricsBindAddress | string | `":9395"` |  |
| scheduler.nodeLockExpire | string | `"5m"` |  |
| scheduler.nodeName | string | `""` |  |
| scheduler.overwriteEnv | string | `"false"` |  |
| scheduler.patch.enabled | bool | `true` |  |
| scheduler.patch.image.pullPolicy | string | `"IfNotPresent"` |  |
| scheduler.patch.image.pullSecrets | list | `[]` |  |
| scheduler.patch.image.registry | string | `"docker.io"` |  |
| scheduler.patch.image.repository | string | `"jettech/kube-webhook-certgen"` |  |
| scheduler.patch.image.tag | string | `"v1.5.2"` |  |
| scheduler.patch.imageNew.pullPolicy | string | `"IfNotPresent"` |  |
| scheduler.patch.imageNew.pullSecrets | list | `[]` |  |
| scheduler.patch.imageNew.registry | string | `"docker.io"` |  |
| scheduler.patch.imageNew.repository | string | `"liangjw/kube-webhook-certgen"` |  |
| scheduler.patch.imageNew.tag | string | `"v1.1.1"` |  |
| scheduler.patch.nodeSelector | object | `{}` |  |
| scheduler.patch.podAnnotations | object | `{}` |  |
| scheduler.patch.priorityClassName | string | `""` |  |
| scheduler.patch.runAsUser | int | `2000` |  |
| scheduler.patch.tolerations | list | `[]` |  |
| scheduler.podAnnotations | object | `{}` |  |
| scheduler.replicas | int | `1` |  |
| scheduler.service.annotations | object | `{}` |  |
| scheduler.service.httpPort | int | `443` |  |
| scheduler.service.httpTargetPort | int | `443` |  |
| scheduler.service.labels | object | `{}` |  |
| scheduler.service.monitorPort | int | `31993` |  |
| scheduler.service.monitorTargetPort | int | `9395` |  |
| scheduler.service.schedulerPort | int | `31998` |  |
| scheduler.service.type | string | `"NodePort"` |  |
| scheduler.tolerations | list | `[]` |  |
| schedulerName | string | `"hami-scheduler"` |  |
| vastaiResourceName | string | `"vastaitech.com/va"` |  |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
