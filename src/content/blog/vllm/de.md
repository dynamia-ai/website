---
title: >-
  Globales Co-Building: vLLM-Community unterstützt HAMi nativ — Inferenz-Effizienzsprung
  durch einen Beitrag aus Spanien
linktitle: vLLM-Integration
coverTitle: 'Globales Co-Building: vLLM unterstützt HAMi nativ'
date: '2025-09-15'
excerpt: >-
  Ausgehend von PR #579, Community-Issues und Mail-Austausch rekonstruiert dieser Artikel den
  „HAMi × vLLM“-Weg von Deployment bis Verifikation — für Multi-Modell-Deployment und
  Ressourcen-Wiederverwendung in Kubernetes.
author: Dynamia
tags:
  - vLLM
  - HAMi
  - GPU Scheduling
  - Multi-Model Deployment
  - Kubernetes
  - AI Inference
  - Community Contribution
  - Cloud Native
category: Integration & Ecosystem
coverImage: /images/blog/Demystifying-the-Reservation-Pod/cover.jpg
---

Sobald Großmodell-Inferenz produktionsreif wird, stehen GPU-Auslastung, Multi-Modell-Koexistenz und Deployment-Flexibilität im Fokus. Die vLLM-Community hat PR #579 gemergt und unterstützt damit nativ das CNCF-Sandbox- und CNAI-Projekt HAMi. Das bedeutet Anerkennung durch ein Mainstream-Inferenz-Framework und Out-of-the-Box-Splitting von GPU-Speicher und -Compute für vLLM-Nutzer.

Der Artikel rekonstruiert den „HAMi × vLLM“-Pfad von Installation über Deployment bis Tests und Monitoring.

## I. 1+1>2: vLLM × HAMi

vLLM ist eine Open-Source-Hochleistungs-Inferenz-Engine (PagedAttention, Continuous Batching, OpenAI-kompatible API). vLLM Production Stack produktisiert vLLM auf Kubernetes: elastisches Scaling, Observability, Traffic-Routing/Gray Release, Ops — betriebsfähig in Produktion. HAMi liefert feingranulares GPU-Partitioning und Scheduling:

- GPU-Compute-Steuerung (SM Util)
- GPU-Speicherlimits (MB / %)
- Node/GPU-Policies (Binpack / Spread)
- Topologie-bewusstes Scheduling (NUMA / NVLink)

Produktions-LLM-Inferenz braucht **Rechenleistung** und **Scheduling**. vLLM optimiert die **Rechenebene**; HAMi die **Scheduling- und Virtualisierungsebene** auf Kubernetes. Zusammen decken sie den Weg von Ressourcen bis Performance ab.

## II. Community-getriebene Integration: PR #579

Die Integration war kein Top-down-Plan, sondern ein Bottom-up-Beitrag aus realem Bedarf.

**PR #579** von Andrés Doncel (Spanien, Empathy.co) — toB-E-Commerce-Suche und Product Discovery. Technisches Ziel: „generative AI und faktische Genauigkeit“ über RAG — evidenzbasierte Antworten, weniger Halluzinationen.

Das erfordert **mehrere Modelle kosteneffizient gemeinsam** — Embedding, Reranking, Fact-Checking. Andrés brachte vLLM-Support für HAMi ein; die Community merged — Lösung für alle vLLM-Nutzer.

Andrés:
> „Our use case is to serve LLM-powered applications while minimizing the dependency from third party providers. We use HAMi and vLLM on top of Kubernetes... using the memory constraints to allow multiple models to reside in the same GPU."

![vLLM- und HAMi-Integrationsarchitektur](/images/blog/vllm-hami-support/vllm-and-hami.png)

### Issue [#649](https://github.com/vllm-project/production-stack/issues/649): „Mehrere Modelle auf einer GPU?“

![vLLM HAMi GitHub-Issue](/images/blog/vllm-hami-support/issue-conversation-0.png)

@Nimbus318:
> „Production Stack has natively supported HAMi parameters, just install HAMi and configure the split parameters."

Nutzer:
> „Thanks for your help. I think HAMi fits my needs.“

## III. Praxis: Installation, Deployment, Tests, Monitoring

### 3.1 Vorbereitung: HAMi installieren

```bash
# 1. Bei NVIDIA GPU Operator devicePlugin per Helm deaktivieren
helm upgrade --install gpu-operator nvidia/gpu-operator \
  -n gpu-operator \
  --set devicePlugin.enabled=false \
  --set dcgmExporter.serviceMonitor.enabled=true \
  --version=v25.3.1

# 2. Nodes für GPU-Sharing labeln
kubectl label nodes <your-gpu-node-name> gpu=on

# 3. HAMi installieren
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm install hami hami-charts/hami -n kube-system
```

Danach übernimmt HAMi GPU-Scheduling und -Zuweisung im Cluster.

### 3.2 Mehrere Modelle über Production Stack

Native Unterstützung ist im Main-Branch, noch nicht in jedem Release — Installation aus dem neuesten Helm Chart im GitHub-Repo.

```bash
git clone https://github.com/vllm-project/production-stack.git
cd production-stack/helm
touch values-hami-demo.yaml
```

`values-hami-demo.yaml` — eine L4, Binpack, Embedding 14 GB + Reranker 8 GB:

```yaml
servingEngineSpec:
  modelSpec:
  # BAAI/bge-m3 Embedding Model
  - name: "bge-m3-embed"
    repository: "vllm/vllm-openai"
    tag: "latest"
    modelURL: "BAAI/bge-m3"
    replicaCount: 1
    requestCPU: 2
    requestMemory: "6Gi"
    requestGPU: 1
    limitGPU: 1
    requestGPUMem: "14000"
    limitGPUMem: "14000"
    podAnnotations:
      nvidia.com/use-gputype: "L4"
      hami.io/gpu-scheduler-policy: "binpack"
    pvcStorage: "10Gi"

    vllmConfig:
      dtype: "auto"
      maxModelLen: 8192
      maxNumSeqs: 32
      gpuMemoryUtilization: 0.85
      extraArgs: ["--task", "embed"]

  # BAAI/bge-reranker-v2-m3 Reranker Model
  - name: "bge-reranker-v2-m3"
    repository: "vllm/vllm-openai"
    tag: "latest"
    modelURL: "BAAI/bge-reranker-v2-m3"
    replicaCount: 1
    requestCPU: 2
    requestMemory: "4Gi"
    requestGPU: 1
    limitGPU: 1
    requestGPUMem: "8000"
    limitGPUMem: "8000"
    podAnnotations:
      nvidia.com/use-gputype: "L4"
      hami.io/gpu-scheduler-policy: "binpack"
    pvcStorage: "5Gi"

    vllmConfig:
      dtype: "auto"
      maxModelLen: 512
      maxNumSeqs: 8
      gpuMemoryUtilization: 0.85
      extraArgs: ["--task", "score"]
```

Deployment:

```bash
helm upgrade --install vllm -f values-hami-demo.yaml .
```

![vLLM Helm Upgrade](/images/blog/vllm-hami-support/helm-upgrade.png)

### 3.3 Ressourcen- und Funktionstests

#### 1. GPU-Sharing prüfen

In beiden Containern `nvidia-smi -L` — dieselbe GPU, Speicher gemäß Konfiguration.

- **Embedding** (`vllm-bge-m3-embed-deployment-vllm-54fb85bf7c-gwjrn`):

```bash
root@vllm-bge-m3-embed-vllm-stack:/vllm-workspace# nvidia-smi
Mon Sep 1 03:40:08 2025
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 570.148.08   Driver Version: 570.148.08   CUDA Version: 12.8     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA L4           On   | 00000000:00:04.0 Off |                    0 |
| N/A   63C    P0    37W /  72W |   1389MiB / 14000MiB |      0%      Default |
|                               |                      |               N/A    |
+-------------------------------+----------------------+----------------------+
                                                                              
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A       112      C   vllm::EngineCore                1490MiB |
+-----------------------------------------------------------------------------+

root@vllm-bge-m3-embed-vllm-stack:/vllm-workspace# nvidia-smi -L
GPU 0: NVIDIA L4 (UUID: GPU-ed8ae6fb-ac66-2346-e6a5-d440223e29a2)
```

- **Reranker** (`vllm-bge-reranker-v2-m3-deployment-vllm-7dcb7965d9-xwvr7`):

```bash
root@vllm-bge-reranker-v2-m3-vllm-stack:/vllm-workspace# nvidia-smi
Mon Sep 1 03:38:24 2025
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 570.148.08   Driver Version: 570.148.08   CUDA Version: 12.8     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA L4           On   | 00000000:00:04.0 Off |                    0 |
| N/A   63C    P0    37W /  72W |   1373MiB /  8000MiB |      0%      Default |
|                               |                      |               N/A    |
+-------------------------------+----------------------+----------------------+
                                                                              
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A       112      C   vllm::EngineCore                1450MiB |
+-----------------------------------------------------------------------------+

root@vllm-bge-reranker-v2-m3-vllm-stack:/vllm-workspace# nvidia-smi -L
GPU 0: NVIDIA L4 (UUID: GPU-ed8ae6fb-ac66-2346-e6a5-d440223e29a2)
```

![nvidia-smi Verifikation 1](/images/blog/vllm-hami-support/nvidia-smi-1.png)
![nvidia-smi Verifikation 2](/images/blog/vllm-hami-support/nvidia-smi-2.png)

#### 2. RAG-Kette testen

Skript `rag_bench.py` (Python unverändert; Kommentare im Original):

```python
import os, time, random, asyncio, aiohttp
import numpy as np

BASE_URL       = os.getenv("BASE_URL", "http://localhost:30080/v1")
EMBED_MODEL    = os.getenv("EMBED_MODEL", "BAAI/bge-m3")
RERANK_MODEL   = os.getenv("RERANK_MODEL", "BAAI/bge-reranker-v2-m3")
DOC_MULT       = int(os.getenv("DOC_MULT", "600"))
Q_CONCURRENCY  = int(os.getenv("Q_CONCURRENCY","16"))
Q_TOTAL        = int(os.getenv("Q_TOTAL","400"))
K_RECALL       = int(os.getenv("K_RECALL","40"))
K_RERANK       = int(os.getenv("K_RERANK","8"))

DOCS_SEED = [
    "边缘计算是在靠近数据源头侧进行分布式处理的计算范式。",
    "云计算通过集中式数据中心提供按需算力与存储资源。",
    "向量检索将文本映射为稠密向量并按相似度召回候选。",
    "RAG 通过外部检索到的证据提高生成答案的可靠性。",
    "BM25 是基于倒排索引的稀疏检索算法，适合关键词匹配。"
]

def pct(arr, p): return float(np.percentile(arr, p)) if arr else 0.0

async def detect_rerank_path(session):
    for path in ("/rerank", "/score"):
        try:
            payload = {"model": RERANK_MODEL, "query": "ping", "documents": ["a","b"], "top_n": 1}
            async with session.post(f"{BASE_URL}{path}", json=payload, timeout=5) as r:
                if r.status == 200:
                    return path
        except Exception:
            pass
    raise RuntimeError("Neither /v1/rerank nor /v1/score is available.")

async def embed_batch(session, texts, batch=64):
    vecs = []
    for i in range(0, len(texts), batch):
        payload = {"model": EMBED_MODEL, "input": texts[i:i+batch], "encoding_format": "float"}
        async with session.post(f"{BASE_URL}/embeddings", json=payload, timeout=60) as r:
            j = await r.json()
            vecs.extend([d["embedding"] for d in j["data"]])
    return np.array(vecs, dtype=np.float32)

async def query_once(session, rerank_path, q, doc_texts, doc_vecs):
    t0 = time.time()
    payload = {"model": EMBED_MODEL, "input": [q], "encoding_format": "float"}
    async with session.post(f"{BASE_URL}/embeddings", json=payload, timeout=15) as r:
        ej = await r.json()
    qv = np.array(ej["data"][0]["embedding"], dtype=np.float32)
    t1 = time.time()
    qn = qv / (np.linalg.norm(qv) + 1e-8)
    dn = doc_vecs / (np.linalg.norm(doc_vecs, axis=1, keepdims=True) + 1e-8)
    sims = dn @ qn
    top_idx = np.argpartition(sims, -K_RECALL)[-K_RECALL:]
    cand_idx = top_idx[np.argsort(-sims[top_idx])]
    docs = [doc_texts[i] for i in cand_idx[:K_RECALL]]
    payload = {"model": RERANK_MODEL, "query": q, "documents": docs, "top_n": K_RERANK}
    async with session.post(f"{BASE_URL}{rerank_path}", json=payload, timeout=15) as r:
        rj = await r.json()
    t2 = time.time()
    return (t1 - t0, t2 - t1, t2 - t0), rj.get("results", [])

async def main():
    queries = [f"什么是{w}？" for w in ["边缘计算","向量检索","RAG","BM25","混合检索"]] * (Q_TOTAL // 5)
    random.shuffle(queries)
    async with aiohttp.ClientSession() as session:
        rerank_path = await detect_rerank_path(session)
        print(f"[info] rerank endpoint = {BASE_URL}{rerank_path}")
        docs = DOCS_SEED * DOC_MULT
        print(f"[info] building doc embeddings: {len(docs)} docs ...")
        doc_vecs = await embed_batch(session, docs, batch=64)
        lat_e, lat_r, lat_t = [], [], []
        sem = asyncio.Semaphore(Q_CONCURRENCY)
        t_start = time.time()
        async def worker(q):
            async with sem:
                (e, r, t), _ = await query_once(session, rerank_path, q, docs, doc_vecs)
                lat_e.append(e); lat_r.append(r); lat_t.append(t)
        await asyncio.gather(*[worker(q) for q in queries])
        dur = time.time() - t_start
        n = len(queries)
        to_ms = lambda x: round(x*1000, 1)
        print(f"\nRequests={n}  Duration={dur:.1f}s  QPS={n/dur:.1f}")
        print(f"Embed  p50/p95: {to_ms(pct(lat_e,50))} / {to_ms(pct(lat_e,95))} ms")
        print(f"Rerank p50/p95: {to_ms(pct(lat_r,50))} / {to_ms(pct(lat_r,95))} ms")
        print(f"Total  p50/p95: {to_ms(pct(lat_t,50))} / {to_ms(pct(lat_t,95))} ms")

if __name__ == "__main__":
    asyncio.run(main())
```

Testausführung:

```bash
kubectl port-forward svc/vllm-router-service 30080:80 &
Q_TOTAL=2000 python3 rag_bench.py
```

Hinweis: Funktionstest mit Vereinfachungen (In-Memory-Retrieval, kein Retry, keine Relevanzbewertung) — beweist aber Funktionsfähigkeit des Shared-Deployments.

### 3.4 Ergebnisse und Monitoring

```bash
> Q_TOTAL=2000 python3 rag_bench.py
[info] rerank endpoint = http://localhost:30080/v1/rerank
[info] building doc embeddings: 3000 docs ...

Requests=2000  Duration=176.9s  QPS=11.3
Embed  p50/p95: 160.6 / 427.6 ms
Rerank p50/p95: 1225.6 / 1401.4 ms
Total  p50/p95: 1395.5 / 1647.9 ms
```

![vLLM Production Stack (Teil 1)](/images/blog/vllm-hami-support/production-stack-1.png)

- <https://github.com/vllm-project/production-stack/tree/main/observability>

![vLLM Production Stack (Teil 2)](/images/blog/vllm-hami-support/production-stack-2.png)

- <https://github.com/Project-HAMi/HAMi/blob/master/docs/dashboard_cn.md>

## Zusammenfassung und Ausblick

PR #579 markiert: **HAMi ist die offiziell integrierte und anerkannte GPU-Sharing-Lösung des vLLM Production Stack**. Wir erwarten weitere Inferenz-Engineering-Lösungen mit nativem HAMi-Dock — flexiblere, effizientere GPU-Nutzung in Produktion.

HAMi (Heterogeneous AI Computing Virtualization Middleware) ist eine „One-Stop“-Architektur für heterogene AI-Geräte in Kubernetes — Sharing und task-level Isolation. CNCF Sandbox, CNAI-Landschaft.

![HAMi heterogene Compute-Unterstützung](/images/blog/PREP-EDU-HAMi/p5.png)

Dynamia bietet auf Basis von CNCF HAMi flexible, zuverlässige GPU-Virtualisierung und heterogenes Scheduling — plug-in-fähig in Public, Private und Hybrid Cloud, mit NVIDIA, Ascend, Muxi, Cambricon, Hygon, Moore Threads, Biren u. a.

> Website: [https://dynamia.ai](https://dynamia.ai)
> E-Mail: [info@dynamia.ai](mailto:info@dynamia.ai)