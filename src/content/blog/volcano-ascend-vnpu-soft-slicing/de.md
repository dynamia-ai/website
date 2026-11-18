---
title: >-
  HAMi 2.10 Deep Dive (Teil 2): Eine Ascend-Karte, zwei Pods — Volcano + HAMi-core vNPU
  Soft Slicing im Test
linktitle: Volcano + HAMi vNPU Soft Slicing getestet
date: '2026-08-26'
excerpt: >-
  Für GPUs liefert HAMi harte Speicherisolation — wie steht es um Ascend NPUs? Im zweiten Artikel
  der HAMi-2.10-Serie validieren wir Volcano-Scheduling plus HAMi-core Soft Slicing auf einem
  echten Ascend 310P3: Der Container sieht nur sein 8192-MiB-Slice, zwei Pods binpacken auf dieselbe
  physische Karte, Monitoring metriken stimmen.
author: Jimmy Song
tags:
  - HAMi
  - Volcano
  - Ascend
  - NPU
  - vNPU
  - GPU Sharing
  - Kubernetes
category: Technical Deep Dive
coverTitle: HAMi 2.10 Deep Dive (Teil 2)
---

> Für GPUs liefert HAMi harte Speicherisolation — wie steht es um Ascend NPUs? Im zweiten Artikel der HAMi-2.10-Serie validieren wir Volcano-Scheduling plus HAMi-core Soft Slicing auf einem echten Ascend 310P3: Der Container sieht nur sein 8192-MiB-Slice, zwei Pods binpacken auf dieselbe physische Karte, Monitoring metriken stimmen.

In [Teil 1](/blog/kai-scheduler-hami-gpu-memory-hard-isolation) testeten wir KAI Scheduler + HAMi-core harte Speicherisolation auf NVIDIA GPUs: zwei Pods teilen eine T4, keiner konnte ein einziges MiB extra beanspruchen. Die Frage kam sofort: **wie sieht es bei Ascend NPUs aus?**

Ascend ist das Rückgrat domestic AI-Inferenz in China. Eine 310P3 hat 21,5 GiB Speicher; eine ganze Karte pro Inferenzdienst zu verschwenden schmerzt genauso. NPU-Sharing ist noch fehleranfälliger als GPU-Sharing — vNPU, Hard Slicing, Soft Slicing, Volcano-Modi: wer die Karte teilt und was herauskommt, kostet leicht einen halben Tag Klarstellung.

Dieser Artikel (HAMi 2.10 Deep Dive, Teil 2) fokussiert ein großes Ascend-Upgrade in HAMi v2.10: **hami-vnpu-core Soft-Sliced-vNPUs mit Volcano**, sodass Batch-Semantik (Queues, Gangs, Binpack) mit Container-Isolation (Speicher- und Compute-Limits auf Ascend-API-Ebene) zusammenspielt.

Kurzantwort: Auf einem Single-Node-Kubernetes-Cluster (Ascend 310P3, aarch64) lief die Kette Ende-zu-Ende — 8192-MiB-Slice im Request, exakt 8192 MiB in `npu-smi`; ein zweiter Pod binpackt auf dieselbe Karte mit eigenem Slice; Prometheus am Plugin meldet beide Quotas korrekt.

## Hintergrund: das Volcano–Ascend–HAMi-Dreieck

Drei Rollen:

**Volcano** — Kubernetes-nativer Batch- und AI-Scheduler (CNCF incubating): Queues, Gang Scheduling, Binpack/Spread.

**Ascend NPUs** — Huaweis AI-Beschleuniger. **vNPU** = logisches Gerät aus physischer NPU für einen Container — 21,5 GiB lassen sich z. B. in 8 GiB + 8 GiB plus ~5,5 GiB Rest teilen.

**HAMi** als Enforcer: **hami-vnpu-core** (`libvnpu.so`) setzt Speicher- und Compute-Quotas auf Ascend-API-Ebene durch.

HAMi v2.10: Volcano-Integration, heterogenes Management (Template-vNPUs und HAMi-core-Knoten im selben Cluster), vNPU-HAMi-core-Monitoring. Hier der Pfad „Volcano + Soft Slicing“.

## Begriffe sortieren: NPU, vNPU, Hard vs. Soft Slicing

| Ebene | Frage |
|-|-|
| NPU / vNPU | Welches Gerät: vNPU = logisches Gerät aus physischer NPU |
| Hard / Soft Slicing | Wie isoliert wird |
| HAMi-core | Wer die Soft-Slicing-Quota im Container durchsetzt |
| HAMi / Volcano | Wer welche Karte und wie viel einem Pod gibt |

**Hard Slicing** über Ascend-Treiber/Firmware-Virtualisierung; nur vordefinierte Templates, z. B. `vir05_1c_16g` (feste AI Cores, AI CPUs, 16 GiB). Echte vNPU-Instanz auf Geräteebene (`npu-smi info -t template-info`).

**Soft Slicing** erzeugt keine Hardware-vNPU. Mehrere Container teilen dieselbe NPU; `libvnpu.so` fängt Ascend-Runtime-APIs ab und verbucht:

![Soft Slicing: Container ruft Ascend-APIs; libvnpu.so fängt ab und lässt nur quota-konforme Speicher- und Compute-Nutzung zu](/images/blog/volcano-ascend-vnpu-soft-slicing/vnpu-intercept-en.png)

Bei 8192 MiB Quota sieht die Anwendung genau 8192 MiB; Allocations werden verbucht, Überschreitung blockiert die Runtime-Schicht.

|  | Hard Slicing | Soft Slicing |
|-|-|-|
| Isolationsgrenze | Gerätevirtualisierung, stärker | Software-Runtime-Interception, kein SR-IOV-Hardwaregrenze |
| Größen | Nur Vendor-Templates (8/16 GiB …) | Beliebig MiB, beliebiges Compute-Verhältnis |
| Einheiten | AI Core, AI CPU, Speicher, DVPP | Speicher- und Compute-Quotas |
| Voraussetzungen | Chip/Treiber unterstützt Template | `libvnpu.so`, Treiberkompatibilität; derzeit nur ARM |

**Hard Slicing baut Wände im Haus; Soft Slicing teilt das Haus, mit strenger Buchhaltung an jeder Tür.**

„Soft-sliced vNPU“ hier = logisches Slice aus Sicht Kubernetes/HAMi — kein Hardware-vNPU via `npu-smi ... create-vnpu`.

## Zwei Wege: Volcano scheduliert Ascend-vNPUs

|  | MindCluster-Modus | HAMi-Modus |
|-|-|-|
| Volcano-Flag | `deviceshare.AscendMindClusterVNPUEnable` | `deviceshare.AscendHAMiVNPUEnable` |
| Provider | Volcano Ascend-Plugin | Project-HAMi/ascend-device-plugin |
| Templates | `vir04_3c_ndvpp` (mit `dvpp`) | `vir05_1c_16g` (`memory`/`aiCore`/`aiCPU`) |
| Slicing | Treiber-Templates (Hard) | Standard Templates; Soft bei `huawei.com/vnpu-mode: hami-core` |
| Ressourcennamen | `huawei.com/npu-core` | `huawei.com/Ascend310P`, `-memory` |

Dieser Artikel: **Soft Slicing via `hami-vnpu-core` im HAMi-Modus**. HAMi-Modus ≠ immer Soft Slicing — Annotation wählt Hard vs. Soft. Nur der HAMi-Modus macht Runtime-Interception: User-Space statt fester Virtualisierungs-Templates. **Volcano wählt das Slice; HAMi-core setzt es durch.**

## Was die Integration wirklich bringt

**HAMi-core** = Sammelbegriff für In-Container-Runtime-Isolation (ursprünglich NVIDIAs `libvgpu.so`); **hami-vnpu-core** = Ascend-Implementierung mit `libvnpu.so`.

Ascend Soft Slicing existierte schon (Code April 2026, nutzbar in HAMi 2.9). HAMi 2.10 tauscht den „Allocator“ von HAMi Scheduler zu Volcano, untere Schichten bleiben:

![HAMi 2.9: HAMi Scheduler; 2.10: Volcano, gleiches ascend-device-plugin und hami-vnpu-core](/images/blog/volcano-ascend-vnpu-soft-slicing/volcano-path-en.png)

| Schicht | HAMi 2.9 | Volcano-Integration |
|-|-|-|
| Scheduler | HAMi Scheduler | Volcano Scheduler |
| Device Discovery/Mount | ascend-device-plugin | gleich |
| Soft Slicing | hami-vnpu-core | gleich |
| Queues, Gang | nicht Fokus | Volcano |
| binpack / spread | HAMi-Policies | Volcano deviceshare |

**Volcano-Scheduling von Ascend HAMi-core Soft-Sliced-Ressourcen**, plus Monitoring und gemischtes Hard/Soft-Management.

## Integrationskette

- **Volcano `deviceshare`**: Geometrien aus `hami-scheduler-device` ConfigMap (`AscendHAMiVNPUEnable: "true"`), Binpack/Spread → Node und Karte pro Pod;
- **ascend-device-plugin DaemonSet**: `huawei.com/Ascend310P` und `-memory`, kopiert `libvnpu.so` und `ld.so.preload` nach `/usr/local/hami-vnpu-core/`;
- **HAMi-core**: Preload über Ascend Docker Runtime.

![Integrationskette](/images/blog/volcano-ascend-vnpu-soft-slicing/integration-chain-en.png)

Pod-Vertrag (vier Pflichtpunkte):

```yaml
spec:
  schedulerName: volcano        # Scheduling an Volcano
  runtimeClassName: ascend      # Ascend Docker Runtime
  containers:
    - name: npu
      resources:
        limits:
          huawei.com/Ascend310P: "1"          # 1 vNPU
          huawei.com/Ascend310P-memory: "8192" # 8192 MiB Speicher-Slice
```

Plus Annotation `huawei.com/vnpu-mode: hami-core`. **Ohne Annotation: Template-Pfad, Pod kann auf reinem Soft-Slicing-Node ewig Pending bleiben** — häufigster Stolperstein.

## Validierung auf echter Hardware

Umgebung: Kylin V10 aarch64, Kubernetes 1.28, 2× Ascend 310P3 (Treiber/npu-smi 25.5.1), containerd 1.7.1. Volcano aus Quelle (Lab 13; Soft Slicing braucht 1.16), ascend-device-plugin v1.4.0.

Node: 14 vNPUs (2×7, `vDeviceCount: 7`), 43054 MiB allocatable.

**Check 1:** Container nur sein Slice — `npu-smi info` im ersten Pod `0 / 8192`, Host `1848 / 21525`:

```text
$ kubectl exec ascend-vnpu-check -- npu-smi info
[INFO limiter::manager] [Manager] Registered as Global Manager #0 (PID: 10).
  Compute limit: 1, Memory limit: 8192, FixedShare: false
| 0  0 | 0000:81:00.0 | 0  0 / 8192 |
```

Env: `NPU_MEM_QUOTA=8192`, `ASCEND_VISIBLE_DEVICES=0`.

**Check 2:** Zwei Pods auf Bus-Id `0000:81:00.0`, je 8192 MiB, `Global Manager #0/#1`. Node: `Ascend310P 2/14`, `Ascend310P-memory 16384/43054`.

**Check 3:** Metriken auf Plugin `:9395`:

```text
hami_vgpu_memory_limit_bytes{...,pod="ascend-vnpu-check",vdevice_index="0"} 8.589934592e+09
hami_vgpu_memory_limit_bytes{...,pod="ascend-vnpu-check-2",vdevice_index="0"} 8.589934592e+09
```

| Check | Ergebnis | Beleg |
|-|-|-|
| Speicher-Slice-Isolation | Bestanden | Container `0 / 8192`, Host `1848 / 21525` |
| Binpack eine Karte | Bestanden | Beide Pods Bus-Id `0000:81:00.0`, Manager #0/#1 |
| Ressourcenbuchhaltung | Bestanden | 2 vNPUs, 16384 MiB |
| Monitoring | Bestanden | `:9395` host/container/vdevice |

## Fallstricke

- **`libvnpu.so` muss zum NPU-Treiber passen** — sonst hängt `npu-smi` bei `Initialize SchedulerClient...`. Offizielles Image-Version + md5.
- **Docker vs. containerd Image-Store getrennt** — `ctr -n k8s.io images import`.
- **Helm:** `basic.image_pull_policy`, nicht `scheduler.imagePullPolicy`.
- **v1.4.0:** keine `-core`-Ressourcen; nur `Ascend310P` und `-memory`.
- **Metriken am Plugin-Pod**, nicht im Workload.
- **Volcano deinstalliert:** Namespace `volcano-system` evtl. Terminating — Finalizers löschen.

Soft Slicing = Runtime-API-Enforcement, keine SR-IOV-Hardwaregrenze — wie HAMi-core bei GPUs. Für vertrauenswürdiges Intra-Team-Sharing reicht es; Multi-Tenant ohne Vertrauen → Hard Slicing prüfen.

## Zusammenfassung

- Ascend-vNPUs: **Hard Slicing** (Wände) vs. **Soft Slicing** (gemeinsames Haus, Buchhalter an der Tür);
- HAMi 2.10: Volcano als Allocator, gleiche Mount- und Runtime-Schichten, Monitoring und Mixed Management;
- Hardware-Test bestätigt: 8192 MiB im Container, zwei Pods eine Karte — **„vereinbart teilen, niemand greift mehr“ gilt auch für Ascend.**

Serie: NVIDIA (KAI) und Ascend (Volcano) — Scheduler verteilt, HAMi-core setzt durch.

Autor: Jimmy Song (宋净超), Dynamia AI.

## Serie

- Vorheriger: [Teil 1 — KAI Scheduler + HAMi GPU Memory Hard Isolation](/blog/kai-scheduler-hami-gpu-memory-hard-isolation)
- Nächster: [Teil 3 — Composable Scheduling Policies](/blog/hami-composable-scheduler-policies)
- [HAMi v2.10.0 Release](https://project-hami.io/blog/hami-v2-10-0-release)
- [Lab 13](https://project-hami.io/tutorials/labs/volcano-ascend-vnpu)

## Referenzen

- <https://project-hami.io/blog/volcano-ascend-vnpu-soft-slicing>
- <https://project-hami.io/blog/hami-v2-10-0-release>
- <https://project-hami.io/tutorials/labs/volcano-ascend-vnpu>
- <https://project-hami.io/docs/installation/how-to-use-volcano-ascend>
- <https://project-hami.io/docs/userguide/ascend-device/enable-ascend-sharing>
- <https://www.hiascend.com/developer/techArticles/20251212-1>
- ascend-device-plugin: <https://github.com/Project-HAMi/ascend-device-plugin>
- hami-vnpu-core: <https://github.com/Project-HAMi/hami-vnpu-core>
- Volcano: <https://github.com/volcano-sh/volcano>