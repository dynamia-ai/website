---
title: 'HAMi v2.5.0 veröffentlicht: Ein Blick auf die Neuerungen'
coverTitle: 'HAMi v2.5.0 veröffentlicht: Ein Blick auf die Neuerungen'
date: '2025-07-29'
excerpt: >-
  HAMi v2.5.0 ist erschienen! Dynamisches MIG sowie deutliche Verbesserungen bei
  Stabilität und Nutzbarkeit. Entdecken Sie, was neu ist.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
category: Product Release
coverImage: /images/blog/gpu8/cover2.jpg
linktitle: HAMi v2.5.0 Release
---

Dieser Artikel basiert auf: <https://mp.weixin.qq.com/s/Af4GaNVhoCUsE5pzd-jnBg>

## 1. Überblick über die Neuerungen

Am 06.02.2025 wurde HAMi v2.5.0 veröffentlicht — mit dynamischem MIG sowie deutlichen Verbesserungen bei Stabilität und Nutzbarkeit. Die wichtigsten Updates:

> Vollständige Release-Informationen: [2.5.0-release](https://github.com/Project-HAMi/HAMi/releases/tag/v2.5.0)

**Funktionen:**

- Dynamisches MIG ergänzt, siehe Dokumentation: [dynamic-mig-support](https://github.com/Project-HAMi/HAMi/blob/master/docs/dynamic-mig-support.md).

**Stabilität:**

- Eine Neuinstallation von HAMi führt nicht mehr zum Absturz laufender GPU-Tasks.
- Behoben: hami-core konnte hängen bleiben, wenn Tasks die cuMallocAsync-API nutzten.
- Behoben: hami-core konnte in Images mit hoher glibc-Version hängen bleiben (z. B. tf-serving:latest).

**Nutzbarkeit:**

- Alle Konfigurationen in einer ConfigMap für zentrales Management, siehe Dokumentation: [config](https://github.com/Project-HAMi/HAMi/blob/master/docs/config.md).
- Automatische Erkennung der Cluster-Version beim Deployment — kein manuelles Setzen von `scheduler.kubeScheduler.imageTag` mehr nötig.
- Ausführlichere Logs für ein klareres Bild des HAMi-Betriebs.
- Aktualisiertes Grafana-Dashboard mit klarerer, intuitiverer Oberfläche.

![HAMi v2.5.0 — Überblick über Neuerungen und Verbesserungen](/images/blog/gpu8/p1.jpg)

**Dokumentation:**

- Mehrere Dokumente überarbeitet.
- MindMap ergänzt, damit Neueinsteiger das HAMi-Projekt schneller verstehen.

**CI:**

- Weitere Unit-Tests ergänzt.
- E2E-Tests für mehr Projektstabilität.

![HAMi v2.5.0 — Mindmap zu Architektur und Komponenten](/images/blog/gpu8/p2.jpg)

![HAMi v2.5.0 — CI/CD-Pipeline und Testabdeckung](/images/blog/gpu8/p3.jpg)

Weitere Updates können Sie selbst im Release entdecken. Im Folgenden zeigen wir vor allem die Stabilitätsverbesserungen und die Nutzung von Dynamic MIG.

## 2. Stabilitätsverbesserungen

### Problemstellung

In früheren Versionen galt: **Ein Neustart von hami-device-plugin konnte GPU-Tasks beeinträchtigen.**

Im Artikel [HAMi-vGPU-Prinzipanalyse Teil 1: hami-device-plugin-nvidia](/blog/open-source-vgpu-hami-device-plugin-nvidia) haben wir beschrieben, wie HAMi GPU-Kern- und Speicher-Isolation erreicht.

> Das geschieht durch Abfangen von CUDA-APIs mit libvgpu.so.

Der Ablauf der Datei `libvgpu.so`:

1. Beim Build liegt `libvgpu.so` im Image von hami-device-plugin.
2. hami-device-plugin läuft als DaemonSet auf allen Knoten (Label `gpu=on`) und kopiert beim Pod-Start `libvgpu.so` nach `/usr/local/vgpu/` auf dem Host.
3. Bei der GPU-Zuweisung mountet hami-device-plugin `libvgpu.so` vom Host in den Pod.

Das Problem entsteht in Schritt 2: **Bei jedem Start des hami-device-plugin-Pods wird `libvgpu.so` erneut auf den Host kopiert.** Im GPU-Pod ist die Datei per Bind-Mount eingebunden — Änderungen auf dem Host können laufende GPU-Pods beeinflussen.

> Beispielsweise kann ein Prozess eine nur teilweise kopierte libvgpu.so laden.

Relevantes YAML für hami-device-plugin:

```yaml
- name: NVIDIA_MIG_MONITOR_DEVICES
  value: all
- name: HOOK_PATH
  value: /usr/local
image: 192.168.116.54:5000/projecthami/hami:v2.3.13
imagePullPolicy: IfNotPresent
lifecycle:
  postStart:
    exec:
      command:
      - /bin/sh
      - -c
      - cp -f /k8s-vgpu/lib/nvidia/* /usr/local/vgpu/
name: device-plugin
resources: {}
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    add:
    - SYS_ADMIN
    drop:
    - ALL
terminationMessagePath: /dev/termination-log
terminationMessagePolicy: File
volumeMounts:
- mountPath: /var/lib/kubelet/device-plugins
  name: device-plugin
- mountPath: /usr/local/vgpu
  name: lib
```

Der Kern:

```yaml
lifecycle:
  postStart:
    exec:
      command:
      - /bin/sh
      - -c
      - cp -f /k8s-vgpu/lib/nvidia/* /usr/local/vgpu/
```

Bei jedem Start läuft `cp` und kopiert `libvgpu.so` aus dem Pod nach `/usr/local/vgpu/` auf dem Host.

Genau dieser Vorgang beeinträchtigt laufende GPU-Tasks.

### Lösung

> Zugehöriger PR: (<https://github.com/Project-HAMi/HAMi/pull/767>)

Ein MD5-Check prüft, ob die Dateien identisch sind. Bei Übereinstimmung wird nicht überschrieben.

Zuerst wurde `cp` durch ein Skript ersetzt:

```bash
# /bin/sh -c cp -f /k8s-vgpu/lib/nvidia/* /usr/local/vgpu/
/bin/sh -c /k8s-vgpu/bin/vgpu-init.sh
```

Inhalt von `vgpu-init.sh`:

```bash
#!/bin/sh

# Prüfen, ob das Zielverzeichnis als Argument übergeben wurde
if [ -z "$1" ]; then
    echo "Usage: $0 <destination_directory>"
    exit 1
fi

# Quellverzeichnis
SOURCE_DIR="/k8s-vgpu/lib/nvidia/"

# Zielverzeichnis aus dem Argument
DEST_DIR="$1"

# Zielverzeichnis anlegen, falls es nicht existiert
if [ ! -d "$DEST_DIR" ]; then
    mkdir -p "$DEST_DIR"
fi

# Alle Dateien im Quellverzeichnis durchlaufen
find "$SOURCE_DIR" -type f | while read -r source_file; do
    # Relativen Pfad der Quelldatei ermitteln
    relative_path="${source_file#$SOURCE_DIR}"

    # Zieldateipfad zusammensetzen
    dest_file="$DEST_DIR$relative_path"

    # Fehlt die Zieldatei, Quelldatei kopieren
    if [ ! -f "$dest_file" ]; then
        # Übergeordnetes Verzeichnis der Zieldatei anlegen, falls nötig
        mkdir -p "$(dirname "$dest_file")"

        # Datei von Quelle nach Ziel kopieren
        cp "$source_file" "$dest_file"
        echo "Copied: $source_file -> $dest_file"
    else
        # MD5-Werte von Quelle und Ziel vergleichen
        source_md5=$(md5sum "$source_file" | cut -d ' ' -f 1)
        dest_md5=$(md5sum "$dest_file" | cut -d ' ' -f 1)

        # Bei unterschiedlichem MD5 kopieren
        if [ "$source_md5" != "$dest_md5" ]; then
            cp "$source_file" "$dest_file"
            echo "Copied: $source_file -> $dest_file"
        else
            echo "Skipped (same MD5): $source_file"
        fi
    fi
done
```

Kernidee: MD5 validieren und nur bei abweichendem Hash kopieren.

```bash
# Bei unterschiedlichem MD5 kopieren
if [ "$source_md5" != "$dest_md5" ]; then
    cp "$source_file" "$dest_file"
    echo "Copied: $source_file -> $dest_file"
else
    echo "Skipped (same MD5): $source_file"
fi
```

Zusätzlich erhält `libvgpu.so` ein Versionssuffix — `libvgpu.so.2.5.0`. Mehrere Versionen stören sich nicht gegenseitig.

> Beispiel: Das Device Plugin 2.5.0 mountet `libvgpu.so.2.5.0`, Version 2.6.0 mountet `libvgpu.so.2.6.0` — HAMi-Upgrades beeinträchtigen laufende Tasks nicht.

```go
// GetLibPath gibt den Pfad zur vGPU-Bibliothek zurück.
func GetLibPath() string {
    libPath := hostHookPath + "/vgpu/libvgpu.so." + info.GetVersion()
    if _, err := os.Stat(libPath); os.IsNotExist(err) {
        libPath = hostHookPath + "/vgpu/libvgpu.so"
    }
    return libPath
}
```

HAMi-core wurde ebenfalls auf 2.5.0 angehoben und Nutzbarkeitsprobleme behoben:

- Behoben: hami-core konnte hängen bleiben, wenn Tasks die cuMallocAsync-API nutzten.
- Behoben: hami-core konnte in Images mit hoher glibc-Version hängen bleiben (z. B. tf-serving:latest).

## 3. Dynamisches MIG

Ascend-NPUs unterstützen mit Ascend Docker Runtime dynamisches vNPU-Slicing. Beim Start per `docker run` setzen Sie Umgebungsvariablen für vNPU-Slicing beim Containerstart.

Das folgende Beispiel schneidet 4 AI Cores vom Chip mit ID 0 als vNPU zu und bindet sie ein. Beim Ende des Containerprozesses wird das virtuelle Gerät automatisch zerstört.

```bash
docker run -it --rm -e ASCEND_VISIBLE_DEVICES=0 -e ASCEND_VNPU_SPECS=vir04 image-name:tag /bin/bash
```

> Über die Umgebungsvariablen `ASCEND_VISIBLE_DEVICES` und `ASCEND_VNPU_SPECS`.

Bei NVIDIA-MIG war bisher manuelles Slicing auf jedem Knoten nötig (z. B. `nvidia-smi -i 0 -mig 1`).

HAMi 2.5.0 bietet **Dynamic MIG**: Slicing beim Containerstart ohne manuelle Vorbereitung — einheitlich von HAMi verwaltet:

- **Dynamische MIG-Instanzverwaltung**: MIG-Instanzen müssen nicht vorab auf dem Knoten erzeugt werden; HAMi legt sie nach Task-Bedarf an.
- **Dynamischer Wechsel der MIG-Slicing-Schemata**: HAMi wechselt MIG-Templates je nach Auslastung und neuen Tasks.
- **MIG-Instanz-Monitoring**: Jede von HAMi verwaltete MIG-Instanz ist im Scheduler-Monitor sichtbar — Cluster-weite MIG-Sicht.
- **Einheitliches Ressourcen-Pooling mit hami-core-Knoten**: MIG- und hami-core-Slicing in einem Pool — ohne Modusangabe Zuweisung zu hami-core oder MIG möglich.
- **Einheitliche API**: Dynamic MIG erfordert keine Anpassung auf Task-Ebene.

### Demo

### Voraussetzungen

- Die GPU muss MIG unterstützen (Blackwell, Hopper™, Ampere — z. B. B100/200, H100, A100/30).
- HAMi-Version >= 2.5.0.
- NVIDIA Container Toolkit auf dem Knoten installiert.

### Feature aktivieren

Feature aktivieren: ConfigMap `hami-device-plugin` bearbeiten.

```bash
kubectl -n kube-system edit cm hami-device-plugin
```

Standardinhalt:

```yaml
apiVersion: v1
data:
  config.json: |
    {
        "nodeconfig": [
            {
                "name": "m5-cloudinfra-online02",
                "devicememoryscaling": 1.8,
                "devicesplitcount": 10,
                "migstrategy": "none",
                "filterdevices": {
                    "uuid": [],
                    "index": []
                }
            }
        ]
    }
```

Inhalt bei aktiviertem MIG:

```json
{
    "nodeconfig": [
        {
            "name": "MIG-NODE-A",
            "operatingmode": "mig",
            "filterdevices": {
                "uuid": [],
                "index": []
            }
        }
    ]
}
```

- `name`: passenden Knotennamen eintragen.
- `operatingmode`: auf `mig` setzen.

> Die Konfiguration schaltet den Knoten `MIG-NODE-A` in den MIG-Modus — künftig vGPU-Slicing per MIG statt libvgpu.so.

Nach der Änderung folgende Pods neu starten:

- hami-scheduler
- hami-device-plugin auf „MIG-NODE-A“

### Benutzerdefinierte Templates

Der vorherige Schritt aktivierte nur den MIG-Modus — das MIG-Template muss noch konfiguriert werden.

> HAMi liefert Default-Templates: [MIG-Konfiguration](https://github.com/Project-HAMi/HAMi/blob/v2.5.0/charts/hami/templates/scheduler/device-configmap.yaml) — direkt nutzbar für A30, A100 40G, A100 80G.

MIG-Slicing nutzt feste Templates — kombinierbar, aber nicht beliebig schneidbar. HAMi liefert Defaults, z. B. für A100/30:

```yaml
knownMigGeometries:
  - models: ["A30"]
    allowedGeometries:
      - name: 1g.6gb
        memory: 6144
        count: 4
      - name: 2g.12gb
        memory: 12288
        count: 2
      - name: 4g.24gb
        memory: 24576
        count: 1
  - models: ["A100-SXM4-40GB", "A100-40GB-PCIe", "A100-PCIE-40GB", "A100-SXM4-40GB"]
    allowedGeometries:
      - name: 1g.5gb
        memory: 5120
        count: 7
      - name: 2g.10gb
        memory: 10240
        count: 3
      - name: 1g.5gb
        memory: 5120
        count: 1
      - name: 3g.20gb
        memory: 20480
        count: 2
      - name: 7g.40gb
        memory: 40960
        count: 1
  - models: ["A100-SXM4-80GB", "A100-80GB-PCIe", "A100-PCIE-80GB"]
    allowedGeometries:
      - name: 1g.10gb
        memory: 10240
        count: 7
      - name: 2g.20gb
        memory: 20480
        count: 3
      - name: 1g.10gb
        memory: 10240
        count: 1
      - name: 3g.40gb
        memory: 40960
        count: 2
      - name: 7g.79gb
        memory: 80896
        count: 1
```

Beispiel A100 40G:

```yaml
- models: ["A100-SXM4-40GB", "A100-40GB-PCIe", "A100-PCIE-40GB", "A100-SXM4-40GB"]
  allowedGeometries:
    - name: 1g.5gb
      memory: 5120
      count: 7
    - name: 2g.10gb
      memory: 10240
      count: 3
    - name: 1g.5gb
      memory: 5120
      count: 1
    - name: 3g.20gb
      memory: 20480
      count: 2
    - name: 7g.40gb
      memory: 40960
      count: 1
```

Die GPU hat 7 Recheneinheiten und 40 GB Speicher. HAMi bietet vier Default-Templates:

- 1g.5gb * 7
- 2g.10gb *3 + 1g.5gb* 1
- 3g.20gb * 2
- 7g.40gb * 1

Kombinationen sind nicht beliebig — verfügbare Profile mit `nvidia-smi mig -lgip`:

```bash
$ sudo nvidia-smi mig -lgip
+-----------------------------------------------------------------------------+
| GPU instance profiles:                                                      |
| GPU   Name             ID    Instances   Memory     P2P    SM    DEC   ENC  |
|                              Free/Total   GiB              CE    JPEG  OFA  |
|=============================================================================|
|   0  MIG 1g.5gb        19     0/7        4.75       No     14     0     0   |
|                                                             1     0     0   |
+-----------------------------------------------------------------------------+
|   0  MIG 1g.5gb+me     20     0/1        4.75       No     14     1     0   |
|                                                             1     1     1   |
+-----------------------------------------------------------------------------+
|   0  MIG 2g.10gb       14     0/3        9.75       No     28     1     0   |
|                                                             2     0     0   |
+-----------------------------------------------------------------------------+
|   0  MIG 3g.20gb        9     0/2        19.62      No     42     2     0   |
|                                                             3     0     0   |
+-----------------------------------------------------------------------------+
|   0  MIG 4g.20gb        5     0/1        19.62      No     56     2     0   |
|                                                             4     0     0   |
+-----------------------------------------------------------------------------+
|   0  MIG 7g.40gb        0     0/1        39.50      No     98     5     0   |
|                                                             7     1     1   |
+-----------------------------------------------------------------------------+
```

HAMis Defaults entsprechen den verfügbaren Profilen. Eigene Templates per ConfigMap `hami-scheduler-device`.

```bash
kubectl -n kube-system edit cm hami-scheduler-device
```

Nach der Bearbeitung neu starten:

- hami-scheduler
- hami-scheduler-device

### Pod anlegen und MIG-Instanz anfordern

Wie bei hami-core: Pod mit `nvidia.com/gpu` und `nvidia.com/gpumem`.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2
          nvidia.com/gpumem: 8000
```

Scheduling auf HAMi-core- oder MIG-Knoten möglich. Nur MIG: Annotation `nvidia.com/vgpu-mode: "mig"`, z. B.:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  annotations:
    nvidia.com/vgpu-mode: "mig" #(optional); ohne Setzen Zuweisung zu MIG oder hami-core
spec:
  containers:
    - name: ubuntu-container
      image: ubuntu:18.04
      command: ["bash", "-c", "sleep 86400"]
      resources:
        limits:
          nvidia.com/gpu: 2
          nvidia.com/gpumem: 8000```
Der Task fordert 2 MIG-Instanzen mit jeweils mindestens 8 GB Speicher.

HAMi durchsucht die MIG-Templates in Reihenfolge, bis eines passt.

Beispiel Template A100 40G:

```yaml
- models: ["A100-SXM4-40GB", "A100-40GB-PCIe", "A100-PCIE-40GB", "A100-SXM4-40GB"]
  allowedGeometries:
    - name: 1g.5gb
      memory: 5120
      count: 7
    - name: 2g.10gb
      memory: 10240
      count: 3
    - name: 1g.5gb
      memory: 5120
      count: 1
    - name: 3g.20gb
      memory: 20480
      count: 2
    - name: 7g.40gb
      memory: 40960
      count: 1
```

Entscheidend ist der Speicher: Bei 8 GB reicht `1g.5gb` nicht. `2g.10gb`, `3g.20gb` und `7g.40gb` reichen, die letzten beiden wären Verschwendung — gewählt wird das zweite Template: 2g.10gb ×3 + 1g.5gb ×1.

> Template mit ausreichend Speicher und möglichst wenig Verschwendung.

Der Pod beansprucht zwei 2g.10gb-Instanzen; unter diesem Template bleiben noch ein 2g.10gb und ein 1g.5gb frei schneidbar.

> Ein weiterer Pod mit 20 GB lässt sich auf dieser GPU nicht schedulen: trotz genug Speicher passen nur noch 2g.10gb und 1g.5gb — unter der Anforderung.

Bei Sonderanforderungen das Template anpassen, z. B.:

```yaml
- name: 2g.10gb
  memory: 10240
  count: 2
- name: 3g.20gb
  memory: 20480
  count: 1
```

#### Monitoring

MIG-Infos im Scheduler-Monitor (Knoten-IP:31993/metrics), z. B.:

```plaintext
# HELP nodeGPUMigInstance GPU Sharing mode. 0 for hami-core, 1 for mig, 2 for mps
# TYPE nodeGPUMigInstance gauge
nodeGPUMigInstance{deviceidx="0",deviceuuid="GPU-936619fc-f6a1-74a8-0bc6-ecf6b3269313",migname="3g.20gb-0",nodeid="aio-node15",zone="vGPU"} 1
nodeGPUMigInstance{deviceidx="0",deviceuuid="GPU-936619fc-f6a1-74a8-0bc6-ecf6b3269313",migname="3g.20gb-1",nodeid="aio-node15",zone="vGPU"} 0
nodeGPUMigInstance{deviceidx="1",deviceuuid="GPU-30f90f49-43ab-0a78-bf5c-93ed41ef2da2",migname="3g.20gb-0",nodeid="aio-node15",zone="vGPU"} 1
nodeGPUMigInstance{deviceidx="1",deviceuuid="GPU-30f90f49-43ab-0a78-bf5c-93ed41ef2da2",migname="3g.20gb-1",nodeid="aio-node15",zone="vGPU"} 1
```

### Designprinzipien

> <https://github.com/Project-HAMi/HAMi/blob/master/docs/develop/dynamic-mig.md>

**Kern von Dynamic MIG: automatisches Slicing-Plugin, das MIG-Slicing bei Bedarf ohne manuellen Eingriff erledigt.**

In HAMi implementiert hami-device-plugin die automatische Slicing-Funktion.

#### Multi-Modus-Unterstützung

hami-device-plugin unterstützt MIG, HAMi-core und MPS.

![HAMi Device Plugin — Multi-Modus-Architektur](/images/blog/gpu8/p4.jpg)

#### Ablauf

Ablauf eines vGPU-Tasks mit dynamic-mig:

![Dynamic MIG — Filter- und Allocate-Phase](/images/blog/gpu8/p5.jpg)

Der Prozess hat zwei Teile:

- **hami-scheduler Filter**: passenden Knoten finden.
- **hami-device-plugin Allocate**: MIG-Instanz slicen (falls noch nicht geschehen) und dem Pod zuweisen.

Unterschiede zwischen MIG-Modus und HAMi-core:

1. **Filter**

- HAMi-core: Filter und Scoring anhand der GPU-Ressourcen auf dem Knoten.

- MIG-Modus: MIG-Instanzen oder -Templates, Speicherabgleich für passendes Template oder Instanz.

1. **Allocate:**

- HAMi-core: QoS über `libvgpu.so` — mounten, Umgebungsvariablen setzen, GPU einbinden.

- MIG-Modus: MIG-Instanz slicen und in den Pod mounten.

#### Vor- und Nachteile

Vorteile von MIG gegenüber hami-core:

1. **Hardware-Isolation**: MIG partitioniert die GPU in Hardware — jede virtuelle GPU wie eine eigene physische GPU, ohne Konkurrenz, stärkere Isolation.
2. **Bessere Performance**: kein Abfangen von CUDA-APIs über `libvgpu.so`.
3. **Stabilität**: Ausfall eines Tasks betrifft andere nicht — unabhängige virtuelle GPUs.

hami-core hat seinen Vorteil: **Kern und Speicher in beliebiger Granularität schneidbar.**

Je nach Einsatzszenario lassen sich beide Modi kombinieren.

---

*Mehr zum HAMi-Projekt: [GitHub](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*
