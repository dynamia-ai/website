---
title: "GenAI for 200 million users: how SNOW orchestrates 1,000 GPUs to handle 700% traffic spikes"
company: "snow-corp"
companyName: "SNOW Corp."
logo: "/redesign/assets/83f5bec99abccb7f8843.jpg"
date: "2026-05-05"
dateLabel: "2026.05.05"
sourceKind: "CNCF case study · Localized edition"
sourceUrl: "https://www.cncf.io/case-studies/snow-corp/"
sourceLinkLabel: "Read the CNCF original ↗"
outcomeSourceUrl: ""
outcomeSourceLabel: "Key data source: Dynamia Network of Officials"
outcomes:
  - value: "1,000+"
    label: "A100 GPUs orchestrated"
    detail: ""
  - value: "200M+"
    label: "Users worldwide"
    detail: "Across SNOW, EPIK and B612"
  - value: "700%"
    label: "Viral traffic spikes handled"
    detail: "HAMi, KEDA and the wider platform working together"
---

SNOW Corp. is a subsidiary of the Korean NAVER group, which operates a 1000+Screen A100 GPU calculation cluster that provides AI functionality to the top three global-ranked GenAI applications: SNOW, EPIK, B612, covering 200 million + users worldwide. Infrastructure loads 1,200+AI workflow and 400+ models. **700 % peak of viral flow**— Flow patterns are unpredictable and highly volatile.

## Challenge

Core issue: Kubernetes Native GPU Scheduling sees GPU as an atomic resource. Pod either gets the whole GPU or nothing. This pattern is ineffective under two conditions:

1. **Heterogeneous Workload Demands** Training missions may consume 80% of the GPU utility, but only 20% of the GPU usage, whereas the use of the Inference service is quite different.
2. **Traffic Unpredictability** : Due to viral AI trends and extreme flow fluctuations associated with the workload of the Heterogeneousinference, the system needs flexibility to stretch. But lack of a GPU physical utilization ratio of observacity, expansion decisions rely only on manual (happy dreams) or rough CPU/RAM indicators, which do not reflect the true saturation of the GPU.

Before using Kubernetes, SNOW operated Docker-based infrastructure, manually distributed GPU:

- **Scheduling Blindness** : 2-3 containers in the same Pod compete for GPU resources without coordination
- **Manual Zoom** : Manual based on load projection configuration GPU, not on actual needs
- **No GPU share** : multiple containers cannot efficiently share single GPU
- **Cost Explosion** : To cope with peak loads, the ratio has to be exceeded **2 times** (One for training, one for inference, theoretically only)

![Overview of structures](/redesign/assets/9f3517927ac5d3ae69ef.png)
*Figure 2: Overview of the structure*

### Observability gap

Kubernetes HPA can be based on CPU and memory scalding, but these indicators do not accurately reflect GPU saturation.

## Solution

### Claud-native Compute Foundation (CNCF) Ecology

SNOW moves up to the localised Kubernetes platform, using a decorated External ETC CD pop-up secure high availability. The entire technology repository is supported by CNCF Ecology: CNI, Helm achieves Gitops deployment, Traefik as Ingress, Prometheus/Loki/Grafana provides access,**HAMi achieves GPU sharing**、**KEDA achieves automatic scaling**。

### GPU Sharing with HAMi

Kubernetes Default Scheduler enforces strict GPU integration, which prevents SNOW sequenced training - migration of inference flow lines - trainers and inference engines must share the same GPU. Hami solves this problem through virtualization GPU resources (vGPU), enabling multiple containers in the same Pod to share a single GPU. It is integrated with kube-schedulers without any need for modification of application codes and fully compatible with the wider automatic stretching ecology.

![Trained to Inference Process](/redesign/assets/241cbda9533d1e659947.png)
*Figure 3: Trained to access process*

### Proactive GPU Orchestration with KEDA

Standard indicators (CPU/RAM, DCGM utilization) are unreliable for the heterogeneous load of SNOW, and the built-in RabbitMQ Zoomer within KEDA serves as a lag indicator - taking into account about 60 seconds of model preheating time, it is always too late to trigger scaling after queue backlogs have been formed.

To this end, SNOW has developed a lightweight custom Metric Server (Python/FastAPI) to expose consumer saturation indicators to the Medics API Scaler of KEDA:

`active_ratio = unacked_messages / active_consumers`

When? `active_ratio` KEDA prepares new GPU Pod for active preheating windows before saturation of the work pool. In condensing, it is longer `stabilizationWindowSeconds` and `cooldownPeriod` Prevent early release of resources during low-flow periods.

![KEDA Autoscaling Structure](/redesign/assets/33a977524696d46d2c90.png)
*Figure 4: KEDA Auto-Scaling Structure*

## Impact and Results

### Respond to 700% traffic peaks by mixing cloud elasticity

On Saturday morning, the gypsy filter suddenly burst into fire three hours ago and the flow rose to a factor of three times more than local capacity. Auto-extrusion initially supported the flow, but the surge in GPU demand subsequently triggered a limit; teams had to catch up with saturation before the heat subdued. SNOW then extended its load elasticity to cloud service providers via a single Gitops stream, using the same Helm Charts, where all clusters pulled their tasks directly from the central RabbitMQ team — the entire process was cut off by zero. Finally, it managed to eliminate seven times the peak traffic, taking full advantage of the business opportunity.

![gypsy filter peak](/redesign/assets/59d80da9e1d28faf91b2.png)
*Figure 5: gypsies filter peak*

### Transport efficiency

- **MTTR Improvement** : MTTR shortened **91%** (from approximately 2 hours to about 10 minutes)
- **Surge Error Reduction** : GPU surged demand during peak flow due to proactive scaling down of associated user errors **85%**
- **Remove manual stretches** : shift from manual GPU configuration to automation, indicator-driven stretching, equivalent to savings **10.8 Man-month** Operating costs

### Cost optimization

- **Active auto-scaling** Reduced average GPU usage time **55%**
- The estimated cost savings are compared to the equivalent GPU configuration (A100 or approximately $45/hour per piece) **USD 17.4M**
- **GPU Sharing with HAMi** The need for a comprehensive re-engineering of infrastructure was eliminated, significantly reducing the complexity of migration and engineering costs
- **GPU Reduced Demand** : Training + reduction of GPU required for water flow lines **2 times**

![Cost savings chart](/redesign/assets/0630dc598a3750992b2b.png)
*Figure 6: Cost savings chart*

## Conclusions

The cloud-native transition of SNOW Corp. demonstrates how to combine Kubernetes with the wider CNCF ecology, overcoming the fundamental limitations of GPU production and observability at extreme scales. By introducing Hami GPU sharing, and using active self-defined indicators to enhance KEDA, SNOW, from passive manual operations to predictive automation. This architecture not only allows the platform to absorb 700% of the peak volume of traffic that has been uninterruptedly mixed environmental expansion, but also achieves significant improvements in cost efficiency, reliability and operating speed.

> Ultimately, this approach provides a reusable set of large-scale GenAI loads operating options: smart resource utilization, precise automatic emulation and depth to transform infrastructure challenges into competitive advantages.
>
> ## References and contacts {#case-section-11}
>
> - [a16z：The Top 100 [Gen AI] Consumer Apps](https://a16z.com/100-gen-ai-apps-5/)
> - [HAMi](https://project-hami.io/)
> - [KEDA](https://keda.sh/)
>
> Jeonghyun Kim, AI Engineer: jeonghyun@snowcorp.com Jae Do Chung, Senior Vice President of Engineering: Jaedo.chung@snowcorp.com
>

<div class="case-source-note">
<p>Original:<a href="https://www.cncf.io/case-studies/snow-corp/" target="_blank" rel="noopener">Scaling GenAI for 200M users: How SNOW Corp. orchestrates 1000+ GPUs to handle 700% viral traffic spikes ↗</a><br>Publisher: Cloud Native Computing Foundation (CNCF) · 2026-05-05</p><p>This localized edition preserves the source article’s technical information and measurement scope. It is not an official CNCF translation. Architecture diagrams retain their original text. Project status and product information reflect the original publication date.</p><p>The original is used under the  <a href="https://www.linuxfoundation.org/legal/terms" target="_blank" rel="noopener">Linux Foundation content terms</a> and  <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a>. This edition has been localized and reformatted. All brand marks belong to their respective owners.</p>
</div>
