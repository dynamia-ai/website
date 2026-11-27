---
title: "HAMi v2.11 Remote GPU in der Praxis: Run CUDA Anywhere"
date: "2026-11-27"
excerpt: "Mit HAMi v2.11 Remote GPU laufen CUDA Samples und vLLM-Inferenz auf einem CPU-Knoten ohne GPU und NVIDIA-Treiber. Der Beitrag prüft entfernte Geräteerkennung, CUDA-Berechnung und Modellbereitstellung."
author: "Dynamia"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["HAMi", "Remote GPU", "CUDA", "Kubernetes", "vLLM"]
---

HAMi v2.11.0 führt **Remote GPU** ein. Damit können reine CPU-Rechner auf GPUs anderer Rechner zugreifen und CUDA-Workloads getrennt von GPU-Ressourcen auf verschiedenen Knoten ausführen.

Bisher mussten CUDA- oder vLLM-Pods in Kubernetes meist auf GPU-Knoten laufen. Jetzt können Pods auf separaten CPU-Knoten ausgeführt werden und über das Netzwerk einen GPU Server nutzen. Der Client benötigt weder eine lokale GPU noch einen NVIDIA-Treiber.

## Einführung in Lupine Remote GPU

Lupine ist ein `GPU-over-IP`-Projekt, mit dem reine CPU-Rechner CUDA-Workloads über das Netzwerk auf GPUs anderer Rechner ausführen können.

Lupine unterscheidet zwischen Server- und Client-Knoten.

- Server-Knoten besitzen GPUs, benötigen NVIDIA-Treiber und führen den Lupine-Server aus. Sie empfangen entfernte CUDA-Aufrufe, berechnen die Ergebnisse auf der GPU und senden sie zurück.
- Client-Knoten führen CUDA-Anwendungen aus. Die Lupine-Clientbibliothek leitet CUDA-Aufrufe über das Netzwerk an den Server weiter. Eine lokale GPU oder ein NVIDIA-Treiber ist nicht erforderlich.

![Funktionsweise von lokaler GPU und Remote GPU](/images/blog/hami-remote-gpu-run-cuda-anywhere/image-01-en.png "unnumbered-caption")

Der Anwendungsprozess läuft auf dem CPU Client. Die Clientbibliothek leitet CUDA-Aufrufe an den GPU Server weiter, dessen Treiber die GPU für Berechnungen anspricht und die Ergebnisse zurückliefert.

## Wie HAMi Remote GPU integriert

Bei HAMi Remote GPU laufen Client und Server auf verschiedenen Knoten desselben Clusters. GPU-Knoten können als Server Rechenressourcen bereitstellen, während Anwendungen auf reinen CPU-Knoten laufen und über das Netzwerk auf die GPUs zugreifen.

Für die Integration in Kubernetes sind mehrere Fragen zu klären: Welche Knoten bieten entfernte GPUs an? Welchen Server soll ein Pod nutzen? Wie werden Clientbibliotheken und Verbindungsadresse beim Start bereitgestellt? HAMi integriert diese Aufgaben in Ressourcenerkennung, Scheduling und Pod-Injektion.

![HAMi Remote GPU: Control Plane und Architektur entfernter CUDA-Aufrufe](/images/blog/hami-remote-gpu-run-cuda-anywhere/image-02-en.png "unnumbered-caption")

### GPU-Knoten als Server registrieren

Administratoren setzen GPU-Knoten auf `operatingmode: remote`. Das Device Plugin registriert die GPU-Informationen als entfernte Ressourcen und ergänzt automatisch das Erkennungslabel `hami.io/lupine-server`, über das HAMi GPU Server auswählt. Der Remote-Server läuft auf dem GPU-Knoten und stellt den CUDA-Endpunkt für Workloads bereit.

HAMi kann damit zuweisbare GPU Server im Cluster erkennen. Über Knotenlabels lassen sich Server außerdem in Ressourcenpools für verschiedene Workloads einteilen.

### Client und GPU Server für einen Pod auswählen

Workloads fordern entfernte GPUs über `nvidia.com/remote-gpu` an. Mit `nvidia.com/remote-gpu-memory` lässt sich zusätzlich ein Speicherlimit pro GPU in MiB angeben.

Die folgende Pod-Konfiguration platziert die Anwendung auf einem CPU-Knoten, fordert eine entfernte GPU an und legt ein Speicherlimit von 3000 MiB pro GPU fest.

~~~yaml
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  containers:
    - name: cuda
      image: nvidia/cuda:13.0.2-devel-ubuntu24.04
      command: ["nvidia-smi", "-L"]
      resources:
        limits:
          nvidia.com/remote-gpu: 1 # 远程 GPU 数量
          nvidia.com/remote-gpu-memory: 3000 # 每张 GPU 的显存配额，单位 MiB
~~~

Beim Scheduling werden zwei Orte bestimmt: der Client-Knoten, auf dem der Pod tatsächlich läuft, und der Server, der die GPUs bereitstellt. Hier wird der Pod mit `nodeSelector` auf einem bestimmten CPU-Knoten platziert; HAMi weist ihm anschließend einen entfernten Server zu.

> Um einen bestimmten Ressourcenpool auszuwählen, kann ein Pod die Annotation `hami.io/remote-server` setzen.

> **Einschränkung der aktuellen Version**
>
> Ein Workload reserviert den gesamten GPU-Server exklusiv. Die GPU-Anzahl muss der Anzahl physischer GPUs des Servers entsprechen, da der Endpunkt alle GPUs bereitstellt. Ein kleineres Speicherlimit ermöglicht anderen Workloads nicht, die verbleibende Serverkapazität zu nutzen. Die folgenden Test-Pods müssen nacheinander oder auf getrennten GPU Servern laufen.

### Clientumgebung vorbereiten

Nach der Zuweisung einer entfernten GPU muss die Anwendung die Clientbibliotheken laden können und wissen, mit welchem Server sie sich verbinden soll.

HAMi stellt über Init-Container die Lupine-Clientbibliotheken und ein kompatibles `nvidia-smi` bereit, bindet die Bibliotheken in den Anwendungscontainer ein und übergibt die Serveradresse über `LUPINE_SERVER`. Bei aktivierten Speicherlimits wird zusätzlich HAMi-core bereitgestellt und über `LD_PRELOAD` in die Aufrufkette aufgenommen, um das Speicherlimit durchzusetzen.

Der folgende Auszug zeigt die von HAMi injizierten Init-Container und die wichtigsten Einstellungen eines Workloads mit Speicherlimit:

> Diese Felder werden von HAMi injiziert und müssen beim Erstellen des Workloads nicht angegeben werden.

~~~yaml
spec:
  initContainers:
    - name: hami-remote-gpu-lib
      image: docker.m.daocloud.io/projecthami/hami:v2.11.0
      volumeMounts:
        - name: hami-remote-gpu-lib
          mountPath: /hami-remote-gpu
    - name: hami-lupine-client
      image: ghcr.io/lupinemachines/lupine-client:cuda-13.3.1-ubuntu24.04
      volumeMounts:
        - name: hami-lupine-client
          mountPath: /lupine-lib
  containers:
    - name: vllm
      env:
        - name: LUPINE_SERVER
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['hami.io/lupine-endpoint']
        - name: LD_PRELOAD
          value: /hami-remote-gpu/libvgpu.so
        - name: CUDA_DEVICE_MEMORY_LIMIT
          value: 15360m
      volumeMounts:
        - name: hami-remote-gpu-lib
          mountPath: /hami-remote-gpu
        - name: hami-lupine-client
          mountPath: /opt/lupine/lib
          readOnly: true
  volumes:
    - name: hami-remote-gpu-lib
      emptyDir: {}
    - name: hami-lupine-client
      emptyDir: {}
~~~

Beide gemeinsam genutzten Volumes verwenden `emptyDir`. Zuerst schreiben die Init-Container die Dateien; anschließend bindet der Anwendungscontainer sie ein und verwendet sie.

### Anwendung starten und entfernte CUDA-Aufrufe ausführen

Sobald die Clientumgebung bereit ist, startet die Anwendung auf dem CPU Client. Ihre CUDA-Aufrufe werden über die Clientbibliothek an den zugewiesenen GPU Server weitergeleitet, der die GPU-Berechnung ausführt und die Ergebnisse zurücksendet.

## Umgebung vorbereiten und bereitstellen

### Kubernetes-Cluster vorbereiten

Bereiten Sie einen Kubernetes-Cluster mit einem GPU-Knoten und einem reinen CPU-Knoten vor.

Manifeste und Ausgaben verwenden durchgehend beispielhafte Knotennamen. Ersetzen Sie diese beim Nachstellen durch die tatsächlichen Namen.

| Komponente | Umgebung | Exitcode |
| --- | --- | --- |
| GPU Server | gpu-server-01, 8 vCPU, 16 GiB RAM, Tesla T4 15360 MiB | 0 |
| CPU Client | cpu-client-01, 4 vCPU, ca. 8 GiB RAM, reiner CPU-Knoten | 0 |
| Kubernetes / containerd | v1.37.0 / 2.2.4 |  |
| HAMi | v2.11.0 |  |

Pods auf dem CPU Client müssen die InternalIP des GPU Servers erreichen können. Der Standardport ist TCP 14833.

Prüfen Sie die Clusterknoten. Ersetzen Sie die Knotennamen in den folgenden Befehlen und YAML-Dateien durch die Ihres Clusters.

~~~bash
kubectl get nodes
~~~

In dieser Umgebung sind beide Knoten Ready.

~~~plain text
NAME            STATUS   ROLES           VERSION
cpu-client-01   Ready    <none>          v1.37.0
gpu-server-01   Ready    control-plane   v1.37.0
~~~

Der GPU Server ist hier zugleich Master beziehungsweise Control-Plane-Knoten. Falls er einen `NoSchedule`-Taint der Control Plane besitzt, entfernen Sie diesen vor der Bereitstellung, damit HAMi Device Plugin und Lupine Server dort eingeplant werden können.

### GPU Operator bereitstellen

Installieren Sie NVIDIA-Treiber, Container Toolkit und Monitoring-Komponenten über GPU Operator. Deaktivieren Sie das native NVIDIA Device Plugin, damit HAMi anschließend die GPUs verwaltet.

Installieren Sie NVIDIA-Treiber, Container Toolkit und Monitoring-Komponenten über GPU Operator. Deaktivieren Sie das native NVIDIA Device Plugin, damit HAMi anschließend die GPUs verwaltet.

~~~bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

helm upgrade --install gpu-operator nvidia/gpu-operator \
  -n gpu-operator --create-namespace \
  --version=v26.3.1 \
  --set driver.enabled=true \
  --set devicePlugin.enabled=false \
  --wait
~~~

> Wenn der NVIDIA-Treiber bereits installiert ist, setzen Sie `driver.enabled` auf `false`.

### HAMi installieren und Remote GPU aktivieren

~~~bash
helm repo add hami-charts https://project-hami.github.io/HAMi/
helm repo update hami-charts
~~~

Installieren Sie zunächst HAMi mit aktiviertem Remote GPU:

~~~bash
kubectl get runtimeclass

helm upgrade --install hami hami-charts/hami \
  --version 2.11.0 -n hami-system --create-namespace \
  --set devices.remotegpu.enabled=true \
  --set devices.nvidia.runtimeClassName=nvidia \
  --set devices.remotegpu.server.runtimeClassName=nvidia \
  --wait
~~~

Ändern Sie nach der Installation die Knotenkonfiguration des Device Plugins, um den GPU Server in den Modus `remote` zu versetzen:

~~~bash
kubectl -n hami-system patch configmap hami-device-plugin \
  --type=merge --patch-file=/dev/stdin <<'EOF'
data:
  config.json: |
    {
      "nodeconfig": [
        {
          "name": "gpu-server-01",
          "operatingmode": "remote"
        }
      ]
    }
EOF

kubectl -n hami-system rollout restart daemonset/hami-device-plugin
kubectl -n hami-system rollout status daemonset/hami-device-plugin --timeout=180s
~~~

Das Device Plugin ergänzt das Erkennungslabel am GPU Server. Anschließend wird der Remote-Server auf diesem Knoten eingeplant.

Versehen Sie den Knoten abschließend mit dem Label `gpu=on`. Knoten ohne dieses Label werden nicht von HAMi übernommen.

~~~bash
# kubectl label nodes {nodeid} gpu=on
kubectl label nodes gpu-server-01 gpu=on --overwrite
~~~

### Bereitstellung prüfen

Prüfen Sie, ob der GPU Server das Label `hami.io/lupine-server` besitzt und alle HAMi-Komponenten bereit sind.

~~~bash
kubectl get nodes -l hami.io/lupine-server -o wide
kubectl -n hami-system get pods -o wide
~~~

Der Komponentenstatus dieser Umgebung ist unten dargestellt.

~~~plain text
NAME                             READY   STATUS    NODE
hami-device-plugin-cphp2         2/2     Running   gpu-server-01
hami-lupine-server-4xjb8         1/1     Running   gpu-server-01
hami-scheduler-c9c5cf696-lgvgn   2/2     Running   cpu-client-01
~~~

Fragen Sie die GPU im Remote-Server-Container ab, um den Gerätezugriff des Servers zu prüfen.

~~~bash
kubectl -n hami-system exec daemonset/hami-lupine-server -- \
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
~~~

Die Ausgabe dieser Umgebung folgt unten.

~~~plain text
Tesla T4, 15360 MiB
~~~

Der GPU Server ist jetzt bereit. Führen Sie als Nächstes CUDA Samples und vLLM auf dem CPU Client aus, um die Zuweisung und tatsächliche Berechnung zu prüfen.

## Praktische Validierung

### Zuerst die entfernte GPU prüfen

Erstellen Sie einen dauerhaft laufenden Pod auf dem CPU-Knoten und führen Sie darin mit `kubectl exec` den Befehl `nvidia-smi` aus, um die Sichtbarkeit der entfernten GPU zu prüfen. Erstellen Sie `remote-gpu-smi.yaml` und ersetzen Sie den `nodeSelector` durch den tatsächlichen CPU-Knotennamen.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: remote-gpu-smi
  namespace: default
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  restartPolicy: Never
  containers:
    - name: smi
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/remote-gpu: 1
~~~

Erstellen Sie den Pod, warten Sie auf die Bereitschaft des Containers und prüfen Sie den zugewiesenen Knoten.

~~~bash
kubectl apply -f remote-gpu-smi.yaml
~~~

Der Pod läuft auf dem CPU-Knoten `cpu-client-01`.

~~~plain text
NAME             READY   STATUS    RESTARTS   AGE   IP              NODE         NOMINATED NODE   READINESS GATES
remote-gpu-smi   1/1     Running   0          13s   172.25.58.225   cpu-client-01   <none>           <none>
~~~

Führen Sie die Abfrage im Container mit `kubectl exec` aus.

~~~bash
kubectl exec remote-gpu-smi -c smi -- nvidia-smi
~~~

Die vollständige Ausgabe von `nvidia-smi` folgt unten.

~~~plain text
Tue Nov 10 04:25:13 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 615.71.09              KMD Version: 580.178.04    CUDA UMD Version: 13.3     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla T4 (via lupine 172...    Off |   00000000:00:06.0 Off |                    0 |
| N/A   34C    P8             15W /   70W |       0MiB /  15360MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
~~~

Die entfernte Tesla T4 und ihre 15360 MiB Speicher sind sichtbar; der Gerätename enthält `via lupine`.

Durch `sleep` bleibt der Pod aktiv und behält seine entfernte GPU-Zuweisung. Löschen Sie den Test-Pod nach der Prüfung, bevor Sie die CUDA-Beispiele ausführen.

~~~bash
kubectl delete pod remote-gpu-smi
~~~

### Offizielle CUDA Samples von NVIDIA ausführen

Prüfen Sie CUDA unabhängig, bevor Sie ein Modell laden. Zwei grundlegende NVIDIA CUDA Samples prüfen getrennt die Geräteerkennung und die tatsächliche Berechnung.

| Beispiel | Prüfung | Ergebnis |
| --- | --- | --- |
| deviceQuery | Geräteanzahl, Name, Compute Capability und Speicher über CUDA Runtime abfragen | 1 Tesla T4 erkannt, Compute Capability 7.5, sichtbarer Speicher 3000 MiB, Result = PASS |
| vectorAdd | GPU-Speicher zuweisen, Eingabe übertragen, Vektoradditionskernel ausführen, Ergebnisse zurückgeben und elementweise auf der CPU prüfen | 50.000 Elemente korrekt berechnet, Test PASSED |

Auch der Zweig ohne Gerät in `deviceQuery` kann PASS ausgeben. Prüfen Sie daher Geräteanzahl und Kartenname. Das Manifest ergänzt eine Prüfung der Geräteanzahl; anschließend prüft `vectorAdd` die Datenübertragung und die Kernel-Ergebnisse.

Bereiten Sie zuerst den Quellcode auf dem CPU Client vor. Verwenden Sie fest `v13.0`, passend zu CUDA 13.0 im Image.

~~~bash
git clone --depth 1 --branch v13.0 --filter=blob:none --sparse \
  https://github.com/NVIDIA/cuda-samples.git /opt/cuda-samples-hami-v13.0
git -C /opt/cuda-samples-hami-v13.0 sparse-checkout set \
  Common Samples/1_Utilities/deviceQuery Samples/0_Introduction/vectorAdd
~~~

Erstellen Sie `cuda-samples-pod.yaml` und ersetzen Sie `nodeSelector` durch den tatsächlichen CPU-Knotennamen.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: cuda-samples-remote
  namespace: default
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  restartPolicy: Never
  containers:
    - name: cuda-samples
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["bash", "-ec"]
      args:
        - |
          set -o pipefail
          NVCC=/usr/local/cuda-13.0/bin/nvcc
          cd /tmp

          "$NVCC" -std=c++17 -O2 -arch=sm_75 -I/samples/Common \
            /samples/Samples/1_Utilities/deviceQuery/deviceQuery.cpp -o deviceQuery
          "$NVCC" -std=c++17 -O2 -arch=sm_75 -I/samples/Common \
            /samples/Samples/0_Introduction/vectorAdd/vectorAdd.cu -o vectorAdd

          ./deviceQuery | tee /tmp/device-query.log
          grep -Eq 'Detected [1-9][0-9]* CUDA Capable device' /tmp/device-query.log
          ./vectorAdd
          echo "REMOTE CUDA SAMPLES PASS"
      resources:
        requests:
          cpu: "1"
          memory: 1Gi
        limits:
          cpu: "2"
          memory: 2Gi
          nvidia.com/remote-gpu: 1
          nvidia.com/remote-gpu-memory: 3000
      volumeMounts:
        - name: samples
          mountPath: /samples
          readOnly: true
  volumes:
    - name: samples
      hostPath:
        path: /opt/cuda-samples-hami-v13.0
        type: Directory
~~~

Erstellen Sie den Pod von einem Terminal mit Clusterzugriff und warten Sie auf den Abschluss.

~~~bash
kubectl apply -f cuda-samples-pod.yaml
kubectl logs cuda-samples-remote -c cuda-samples
~~~

Der Pod läuft auf einem reinen CPU-Knoten. Die Ausgabe lautet:

~~~plain text
Detected 1 CUDA Capable device(s)
Device 0: "Tesla T4"
Result = PASS
~~~

~~~plain text
[Vector addition of 50000 elements]
Test PASSED
Done
REMOTE CUDA SAMPLES PASS
~~~

Löschen Sie nach Abschluss den Pod, um die Serverreservierung vor dem Start von vLLM freizugeben.

~~~bash
kubectl delete pod cuda-samples-remote
~~~

### vLLM auf dem CPU-Knoten bereitstellen

> Legen Sie zunächst das Modell `Qwen2.5-0.5B-Instruct` auf dem CPU Client im Verzeichnis `/opt/models/Qwen2.5-0.5B-Instruct` ab.

Erstellen Sie `vllm-remote.yaml`.

~~~yaml
apiVersion: v1
kind: Pod
metadata:
  name: vllm-remote
spec:
  nodeSelector:
    kubernetes.io/hostname: cpu-client-01
  containers:
    - name: vllm
      image: vllm/vllm-openai:v0.25.1-ubuntu2404
      command: ["vllm", "serve", "/models/Qwen2.5-0.5B-Instruct"]
      args:
        - --served-model-name=qwen
        - --dtype=float16
        - --gpu-memory-utilization=0.7
        - --max-model-len=1024
        - --max-num-seqs=4
        - --enforce-eager
        - --attention-config.backend=TRITON_ATTN
      env:
        - name: TORCH_BLAS_PREFER_CUBLASLT
          value: "0"
        - name: CUDA_LAUNCH_BLOCKING
          value: "1"
      readinessProbe:
        httpGet:
          path: /health
          port: 8000
      resources:
        limits:
          nvidia.com/remote-gpu: 1
      volumeMounts:
        - name: models
          mountPath: /models
          readOnly: true
  volumes:
    - name: models
      hostPath:
        path: /opt/models
~~~

Der Pod fordert eine entfernte GPU an. `gpu-memory-utilization=0.7` steuert den von vLLM genutzten Anteil des GPU-Speichers.

`--enforce-eager` und `CUDA_LAUNCH_BLOCKING=1` werden aus dem offiziellen Beispiel übernommen.

Erstellen Sie den Pod, warten Sie auf die Bereitschaft des Dienstes und prüfen Sie anschließend Platzierung und Startprotokolle.

~~~bash
kubectl apply -f vllm-remote.yaml

kubectl get pod vllm-remote \
  -o jsonpath='{.spec.nodeName}{"\n"}{.metadata.annotations.hami\.io/lupine-endpoint}{"\n"}'
~~~

Das Zuweisungsergebnis dieser Umgebung folgt unten.

~~~plain text
cpu-client-01
172.16.131.132:14833
~~~

Warten Sie nach dem Wechsel auf Running weiter, bis das Modell geladen ist. Eine 200-Antwort von `/health` bestätigt die Bereitschaft. Führen Sie auf dem GPU-Server-Host `nvidia-smi` aus, um Speicherbelegung und Prozesse zu prüfen.

~~~bash
nvidia-smi
~~~

Die vollständige Ausgabe nach dem Laden des Modells folgt unten.

~~~plain text
Tue Nov 10 05:55:16 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.178.04             Driver Version: 580.178.04     CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla T4                       Off |   00000000:00:06.0 Off |                    0 |
| N/A   41C    P0             28W /   70W |   10765MiB /  15360MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A         3442254      C   ...pine/bin/lupine_driver_server        122MiB |
|    0   N/A  N/A         3443585      C   ...pine/bin/lupine_driver_server      10640MiB |
+-----------------------------------------------------------------------------------------+
~~~

Die Speicherbelegung der T4 ist auf 10765 MiB gestiegen. Die Einträge `lupine_driver_server` sind Remote-Dienstprozesse auf dem GPU Server, welche die GPU-Berechnung ausführen. Der vLLM-Anwendungsprozess läuft auf dem CPU Client.

Senden Sie von einem Rechner mit Zugriff auf das Pod-Netzwerk eine Anfrage über die OpenAI-kompatible API. Hier ruft der GPU-Knoten den vLLM-Dienst auf dem CPU-Knoten auf.

~~~bash
POD_IP=$(kubectl get pod vllm-remote \
  -o jsonpath='{.status.podIP}')
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' \
  "http://${POD_IP}:8000/health"

curl --fail-with-body "http://${POD_IP}:8000/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"qwen","messages":[{"role":"user","content":"用一句话解释 Kubernetes。"}],"max_tokens":64,"temperature":0}'
~~~

Die Ausgabe lautet:

> Kubernetes (kurz K8s) ist eine Open-Source-Plattform zur Containerorchestrierung. Sie ermöglicht es, Bereitstellung, Ausführung und Skalierung von Anwendungen über mehrere Knoten hinweg zu definieren und zu verwalten. Entwickler können damit komplexe Cluster containerisierter Anwendungen einfach erstellen, verwalten und warten und so Entwicklungseffizienz und Ressourcennutzung verbessern.

Damit wurde eine Inferenzanfrage über Remote GPU erfolgreich abgeschlossen.

Löschen Sie nach dem Experiment den Test-Pod, um die entfernten GPU-Ressourcen freizugeben.

~~~bash
kubectl delete pod vllm-remote
~~~

## Einsatzmöglichkeiten und Herausforderungen

### Warum Anwendungen getrennt von GPUs bereitstellen?

Lupine bezeichnet sich als GPU-over-IP-Bridge, über die reine CPU-Rechner GPUs anderer Rechner über das Netzwerk nutzen können. HAMi konkretisiert die Ausführung in Kubernetes: Workloads laufen auf Client-Knoten, CUDA-Aufrufe werden auf einem anderen GPU Server ausgeführt. HAMi wählt den Server und stellt die Clientbibliotheken bereit.

Aus Sicht der Ressourcenbereitstellung werden CPU und GPU entkoppelt und GPUs als gesonderte Ressourcen verwaltet. Der Rechner für CPU und Arbeitsspeicher einer Anwendung lässt sich unabhängig vom Rechner für ihre GPU auswählen.

Remote GPU bietet eine weitere Bereitstellungsoption. Ob sie Vorteile bringt, muss mit dem jeweiligen Anwendungsfall geprüft werden.

### Welche Szenarien sind einen Versuch wert?

Aus diesem Ausführungsmodell ergeben sich mehrere mögliche Einsatzbereiche.

**1. Anwendungen mit hohem CPU- oder Speicherbedarf**

Datenvorverarbeitung, Nachverarbeitung und GPU-Berechnung können unterschiedliche Ressourcen benötigen. Läuft die Anwendung auf einem Knoten mit passender CPU- und Speicherausstattung und liefert ein GPU Server das Rechengerät, lassen sich beide Seiten getrennt dimensionieren. Dabei müssen auch die Kosten der Datenübertragung bewertet werden. Eine [Forschungsarbeit zu GPU API Remoting](https://arxiv.org/html/2401.13354v1#S2.SS2) nennt ebenfalls das Missverhältnis zwischen festen CPU/GPU-Verhältnissen und Anwendungsbedarf als Motivation für die Entkopplung.

**2. Zentralisierte GPUs bei verteilten Anwendungen**

Eine weitere Möglichkeit ist die zentrale Pflege von GPUs und Treibern auf Servern, auf die Anwendungen verschiedener CPU-Knoten nach Bedarf zugreifen. Mit HAMi lässt sich zunächst die Trennung von CPU Client und GPU Server im selben Cluster prüfen. Welche gemeinsame Nutzung, Isolation und Scheduling-Funktionen anschließend möglich sind, muss für die jeweilige Implementierung geklärt werden.

**3. Entwicklung und Funktionstests**

Testknoten ohne GPUs können CUDA-Programme, Frameworks und Modelle über entfernte GPUs prüfen. Dieser Artikel verwendet nacheinander `nvidia-smi`, CUDA Samples und vLLM, um Gerätesichtbarkeit, tatsächliche CUDA-Berechnung und Inferenzantworten zu prüfen. Diese Reihenfolge eignet sich auch für Umgebungsprüfungen, etwa wenn ein reiner CPU-Runner für GPU-Workloads mit einer entfernten GPU verbunden wird.

### Was vor dem Einsatz zu beachten ist

**1. Leistung hängt vom Netzwerk und von der Implementierung der Remote-Aufrufe ab**

Zwischen Client und Server werden CUDA-Aufrufe und zugehörige Daten übertragen. Häufige Synchronisierung verstärkt die Umlauflatenz, große Transfers verbrauchen Bandbreite. Auch Serialisierung, Deserialisierung und Weiterleitung verursachen Softwareaufwand. Die [Forschung zu GPU API Remoting](https://arxiv.org/html/2401.13354v1#S3) untersucht diese Kosten und den Einfluss asynchroner Ausführung. Leistung lässt sich daher nicht allein aus der Bandbreite ableiten, und Durchsatzverluste können nicht vollständig dem Netzwerk zugeschrieben werden. Hier wird die Funktion geprüft; Anwendungslatenz und Durchsatz müssen noch gemessen werden.

**2. Clients benötigen keinen NVIDIA-Treiber, aber eine kompatible Laufzeitumgebung**

Laut offizieller HAMi-Dokumentation richtet sich die automatische Bibliotheksbereitstellung derzeit an die angebotenen CUDA- und vLLM-Beispielimages für amd64 und Ubuntu 24.04. Eigene Images benötigen möglicherweise angepasste Bibliothekssuchpfade; über absolute Pfade geladene Bibliotheken sind gesondert zu prüfen. Nach Änderungen an CUDA-, Framework- oder Image-Versionen sind grundlegende Berechnungs- und Anwendungstests erneut auszuführen.

**3. Fehlerdiagnose muss beide Seiten abdecken**

Bei fehlgeschlagenem Anwendungsstart oder unterbrochener Inferenz müssen Client, Netzwerk, Remote-Dienst und GPU Server gemeinsam geprüft werden. Wiederherstellung nach Verbindungsabbruch oder Serverneustart und die Stabilität im Dauerbetrieb gehören zur Prüfung vor dem Produktiveinsatz.

## Zusammenfassung

Mit HAMi v2.11 Remote GPU wurden CUDA Samples und vLLM-Inferenz auf einem CPU-Knoten ohne GPU und NVIDIA-Treiber ausgeführt. Der Anwendungsprozess lief auf dem CPU Client, während eine T4 auf einem anderen Knoten die GPU-Berechnung übernahm. Damit wurde der gesamte Ablauf von der entfernten Geräteerkennung über CUDA-Berechnung bis zur Modellinferenz geprüft.

Remote GPU ergänzt eine Bereitstellungsoption für GPU-Workloads. Anwendungen können CPU und Speicher eines CPU-Knotens nutzen und zugleich über das Netzwerk auf die Rechenleistung eines GPU Servers zugreifen. HAMi integriert Erkennung und Zuweisung entfernter GPUs sowie die Clientumgebung in den bestehenden Scheduling-Ablauf. So lässt sich die knotenübergreifende GPU-Nutzung mit vertrauten Pod-Ressourcendeklarationen verwalten.

Plattformen, die CPU- und GPU-Bereitstellung entkoppeln und GPU-Rechenleistung zentral anbieten möchten, finden in HAMi einen vielversprechenden Ausgangspunkt und weitere Möglichkeiten zur Kombination ihrer KI-Infrastrukturressourcen.

Dieser Artikel wurde von 意琦行 für den offiziellen HAMi-Blog eingereicht. Bitte übernehmen Sie bei einer Wiederveröffentlichung den vollständigen Text. Kontaktieren Sie uns für Bearbeitungen zuerst über WeChat unter HAMi_community.
