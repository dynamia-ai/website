---
title: "Kamaji + HAMi in der Praxis: GPU Sharing und Planung in Kubernetes mit mehreren Mandanten"
date: "2026-11-20"
excerpt: "Ein Experiment mit kind, Kamaji und simulierten HAMi Geräten prüft die GPU Planung über Mandanten Steuerungsebenen hinweg ohne physische GPU. Es behandelt Webhook Verbindungen, Ressourcenteilung und Kapazitätsgrenzen sowie die getrennte Sichtbarkeit von API Ressourcen."
author: "Dynamia"
category: "Technical Deep Dive"
coverDisplay: "text"
tags: ["Kamaji", "HAMi", "Kubernetes", "GPU Sharing", "Multitenancy"]
---

In Kubernetes Umgebungen müssen Mandantenisolierung und GPU Auslastung gemeinsam betrachtet werden. Das ist ein wichtiger Teil der KI Infrastruktur.

Separate Kubernetes Cluster für jedes Team bieten relativ unabhängige Steuerungsebenen, erhöhen aber Infrastruktur und Betriebsaufwand. Ein gemeinsam genutzter Cluster erfordert zusätzliche Maßnahmen für Ressourcenisolierung, Berechtigungen und mögliche Wechselwirkungen zwischen Workloads.

Ähnliche Herausforderungen gibt es bei der GPU Zuweisung. Wenn eine Aufgabe nur einen Teil des Speichers oder der Rechenleistung benötigt, kann die Zuweisung einer ganzen Karte Ressourcen ungenutzt lassen. Wie können mehrere Workloads eine GPU gemeinsam nutzen und gleichzeitig klare Ressourcengrenzen behalten?

Kamaji und HAMi setzen auf unterschiedlichen Ebenen an:

- **Kamaji** hostet die Kubernetes Steuerungsebenen mehrerer Mandantencluster zentral in einem Verwaltungscluster und reduziert so den Aufwand für mehrere Steuerungsebenen.
- **HAMi** ermöglicht die gemeinsame GPU Nutzung und eine feingranulare Planung, sodass Workloads Speicher und Rechenleistung nach Bedarf anfordern können.

Funktioniert die GPU Planung, wenn beide kombiniert werden?

Mit kind, Kamaji und dem simulierten Geräte Plug-in von HAMi wird auf einem Rechner ohne physische GPU eine Testumgebung mit zwei Mandantenclustern aufgebaut. Getestet werden die Webhook Kommunikation über die Steuerungsebene hinweg, die GPU Planung, der Umgang mit unzureichenden Ressourcen und die getrennte Sichtbarkeit von Ressourcen zwischen Mandanten.

Alle acht Tests lieferten die erwarteten Ergebnisse. Im Folgenden werden **Architektur, Bereitstellung, wichtige Ergebnisse und aufgetretene Probleme beschrieben. Außerdem wird erläutert, was die simulierte Umgebung prüfen kann und wofür echte GPU Hardware nötig bleibt.**

## 1. Architektur: Gemeinsame Verwaltung, getrennte Mandantencluster

Die Lösung besteht aus einem kind Verwaltungscluster und zwei Mandantenclustern. Das Verwaltungscluster hostet Kamaji und beide Mandanten Steuerungsebenen. Jeder Worker Node läuft in einem eigenen Container, verbindet sich über das kind Netzwerk mit dem jeweiligen Cluster und führt HAMi aus.

![Testarchitektur: ein Verwaltungscluster und zwei Mandantencluster](/images/blog/kamaji-hami-multitenant-gpu-sharing/architecture-en.png)

Die Mandanten teilen weder Worker Nodes noch einen Kubernetes API Server. Gemeinsam genutzt werden das zugrunde liegende Verwaltungscluster und der Datenspeicher `kamaji-etcd`; die Daten jedes Mandanten werden dort getrennt gespeichert.

## 2. Zentrale Prüfung: GPU Planung über Steuerungsebenen hinweg

Kamaji **verwaltet die Steuerungsebenen der Mandantencluster**. So erhält jeder Mandant einen eigenen Kubernetes API Server, ohne dass für jeden eine vollständige separate Infrastruktur der Steuerungsebene bereitgestellt werden muss. HAMi läuft innerhalb des Mandantenclusters und übernimmt GPU Sharing, Zuweisung und Planung. Die Funktionen liegen auf unterschiedlichen Ebenen und ergänzen sich.

**Entscheidend ist, ob ein API Server im Verwaltungscluster den HAMi Webhook im Mandantencluster erreichen kann.**

In diesem Aufbau läuft der Mandanten API Server im Verwaltungscluster, der HAMi Webhook dagegen auf einem Worker Node des Mandanten. Beim Erstellen eines GPU Pods muss die Admission Anfrage durch Kamajis Konnectivity Tunnel übertragen werden.

Deshalb prüft der Versuch nicht nur die GPU Zuweisung, sondern auch, ob der Kommunikationsweg zwischen Steuerungsebene und Worker Node den HAMi Planungsablauf unterstützt.

## 3. Testumgebung: Geräte ohne GPU simulieren

Alle Komponenten laufen als Docker Container auf einem Linux Host. Benötigt werden vier CPU Kerne, 8 GB verfügbarer Arbeitsspeicher und 20 GB Speicherplatz.

**Wie lässt sich GPU Sharing ohne GPU testen?**

Das echte Geräte Plug-in von HAMi muss mit dem NVIDIA Treiber kommunizieren und kann ohne GPU Hardware nicht normal starten. Das simulierte Plug-in umgeht die Hardwareerkennung: Eine Node Annotation beschreibt die simulierte GPU, woraufhin Kapazitäten wie `gpumem` und `gpucores` registriert werden können.

Obwohl keine echte Grafikkarte vorhanden ist, können HAMi Webhook, Scheduler und Quotenlogik denselben Planungsablauf wie bei einem echten Node durchlaufen.

Die beiden Mandanten verwenden unterschiedliche simulierte GPUs:

- **tenant-a**: eine NVIDIA A100 mit 80 GB, 81.920 MB Speicher und 100 Cores Rechenkapazität.
- **tenant-b**: zwei NVIDIA L4 mit je 24 GB, zusammen 49.152 MB Speicher und 200 Cores.

Cores bezeichnet hier die Maßeinheit für GPU Rechenressourcen im Experiment, nicht physische CPU Kerne.

## 4. Bereitstellung: Fünf Schritte zur Testumgebung mit mehreren Mandanten

Die Bereitstellung umfasst fünf Schritte. Schritt 3 erstellt beide Mandanten gleichzeitig; die Schritte 4 und 5 werden für jeden Mandanten getrennt ausgeführt.

Hinweis: Ein direkter `kubectl` Aufruf greift auf das Verwaltungscluster zu. Erst mit `--kubeconfig tenant-a.kubeconfig` wird das entsprechende Mandantencluster angesprochen.

### Schritt 1: Verwaltungscluster, cert-manager und MetalLB bereitstellen

Zuerst das kind Cluster erstellen:

```Bash
kind create cluster --name kamaji
```

Dann cert-manager bereitstellen:

```Bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.21.2/cert-manager.yaml
kubectl -n cert-manager wait pod --all --for=condition=Ready --timeout=180s
```

MetalLB bereitstellen:

```Bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.16.1/config/manifests/metallb-frr-k8s.yaml
kubectl -n metallb-system wait pod --all --for=condition=Ready --timeout=180s
```

Das IPv4 Subnetz im kind Netzwerk ermitteln und MetalLB einen hohen Adressbereich innerhalb dieses Subnetzes zuweisen:

```Bash
docker network inspect kind | grep Subnet
```



```Bash
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: kind-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 172.18.255.200-172.18.255.250
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: empty
  namespace: metallb-system
EOF
```

### Schritt 2: Kamaji installieren

Das Helm Repository hinzufügen und Kamaji installieren:

```Bash
helm repo add clastix https://clastix.github.io/charts
helm upgrade --install kamaji clastix/kamaji \
  --namespace kamaji-system --create-namespace \
  --set 'resources=null' --version 0.0.0+latest
```

Den Status der Kamaji Komponenten prüfen:

```Bash
kubectl -n kamaji-system get pods
```

### Schritt 3: Zwei Mandanten Steuerungsebenen erstellen

Sobald Verwaltungscluster und Kamaji Komponenten bereit sind, werden für `tenant-a` und `tenant-b` zwei unabhängige Steuerungsebenen erstellt.

Dieser Schritt verwendet Kamajis Ressource `TenantControlPlane`. Sie legt für jeden Mandanten Kubernetes Version, Bereitstellung der Steuerungsebene, Netzwerkkonfiguration und Konnectivity Komponente fest.

Die folgende Konfiguration erstellt beide Steuerungsebenen auf einmal:

```Bash
export TENANT_VERSION=v1.36.4
kubectl create namespace tenants

for t in tenant-a tenant-b; docat <<EOF | kubectl apply -f -
apiVersion: kamaji.clastix.io/v1alpha1
kind: TenantControlPlane
metadata:
  name: ${t}
  namespace: tenants
  labels:
    tenant.clastix.io: ${t}
spec:
  controlPlane:
    deployment:
      replicas: 1
    service:
      serviceType: LoadBalancer
  kubernetes:
    version: "${TENANT_VERSION}"
    kubelet:
      configurationJSONPatches:
        - op: add
          path: /cgroupDriver
          value: systemd
  networkProfile:
    port: 6443
    podCidr: 10.244.0.0/16
  addons:
    coreDNS: {}
    kubeProxy: {}
    konnectivity:
      server:
        port: 8132
      agent:
        mode: DaemonSet
EOFdone
```

Nach Anwendung der Konfiguration warten, bis beide Pods der Steuerungsebene `Running` erreichen, und dann die jeweilige kubeconfig exportieren:

```Bash
for t in tenant-a tenant-b; do  kubectl -n tenants get secret ${t}-admin-kubeconfig -o jsonpath='{.data.admin\.conf}' | base64 -d > ${t}.kubeconfig
  kubectl --kubeconfig ${t}.kubeconfig cluster-info
done
```

Jede Mandanten Steuerungsebene läuft als einzelner Pod im Namespace `tenants` des Verwaltungsclusters auf dem Node `kamaji-control-plane`.

Wenn der Pod bei `READY` den Wert `4/4` zeigt, sind alle vier Container bereit:

- `kube-apiserver`: stellt die Kubernetes API des Mandanten bereit und macht sie über eine von MetalLB vergebene IP erreichbar.
- `kube-scheduler`: Standard Scheduler des Mandantenclusters.
- `kube-controller-manager`: führt die integrierten Kubernetes Controller des Mandanten aus.
- `konnectivity-server`: übernimmt die Tunnelseite im Verwaltungscluster, damit der API Server die Worker Nodes des Mandanten erreichen kann.

![Die Steuerungsebenen beider Mandanten laufen als Pods im Verwaltungscluster](/images/blog/kamaji-hami-multitenant-gpu-sharing/control-planes.png)

Damit sind beide Steuerungsebenen erstellt. Anschließend werden Worker Nodes angebunden, damit Workloads ausgeführt werden können.

### Schritt 4: Worker Nodes der Mandanten anbinden

Kamaji bietet kein eigenes Werkzeug zum Anbinden von kind Worker Nodes. Deshalb läuft im kind Netzwerk ein `kindest/node` Container, der über den üblichen `kubeadm` Ablauf dem Mandantencluster beitritt. Die Version des Worker Nodes muss zur Kubernetes Version des Mandanten passen.

```Bash
docker run -d --name tenant-a-worker --hostname tenant-a-worker \
  --network kind --privileged \
  --security-opt seccomp=unconfined --security-opt apparmor=unconfined \
  --tmpfs /tmp --tmpfs /run -v /var -v /lib/modules:/lib/modules:ro \
  kindest/node:v1.36.4@sha256:099e049362a1526b2db71494e1947aae99bd16290d7c895f2b7ea312e3cbfaed
sleep 15
docker exec -i tenant-a-worker sh -c 'cat > /root/tenant-a.kubeconfig' < tenant-a.kubeconfig
JOIN_CMD=$(docker exec tenant-a-worker kubeadm token create --print-join-command \
  --kubeconfig /root/tenant-a.kubeconfig)
echo "$JOIN_CMD"
docker exec tenant-a-worker bash -c "${JOIN_CMD} --ignore-preflight-errors=all"
```

Danach Calico **im Mandantencluster und nicht im Verwaltungscluster** installieren und dessen Adresspool auf den `podCidr` des Mandanten setzen:

```Bash
curl -sLO https://raw.githubusercontent.com/projectcalico/calico/v3.31.2/manifests/calico.yaml
sed -i 's|# - name: CALICO_IPV4POOL_CIDR|- name: CALICO_IPV4POOL_CIDR|; s|#   value: "192.168.0.0/16"|  value: "10.244.0.0/16"|' calico.yaml
kubectl --kubeconfig tenant-a.kubeconfig apply -f calico.yaml
```

Prüfen, ob der Worker Node dem Cluster beigetreten ist:

```Bash
kubectl --kubeconfig tenant-a.kubeconfig get nodes
```

### Schritt 5: HAMi und eine simulierte GPU im Mandanten bereitstellen

Wichtig: **Den Worker Node nicht mit `gpu=on` kennzeichnen.** Andernfalls würde das echte NVIDIA Geräte Plug-in von HAMi gestartet. Ohne GPU Treiber kann es in dieser Testumgebung nicht funktionieren.

```Bash
export KUBECONFIG=$PWD/tenant-a.kubeconfig

helm repo add hami-charts https://project-hami.github.io/HAMi/
helm install hami hami-charts/hami -n kube-system
# wait for hami-scheduler Running, and the hami-scheduler-device ConfigMap to exist
kubectl apply -f https://raw.githubusercontent.com/Project-HAMi/mock-device-plugin/master/k8s-mock-rbac.yaml
kubectl apply -f https://raw.githubusercontent.com/Project-HAMi/mock-device-plugin/master/k8s-mock-plugin.yaml
```

Nun die simulierte GPU auf dem Node konfigurieren. Dieses Beispiel bildet eine A100 mit 80 GB nach:

```Bash
# Simulate 1 x A100 80 GBNODE=tenant-a-worker
kubectl patch node $NODE --subresource=status --type=json \
  -p '[{"op":"add","path":"/status/capacity/nvidia.com~1gpu","value":"10"}]'
kubectl annotate node $NODE \
  'hami.io/node-nvidia-register=[{"id":"GPU-MOCK-0","count":10,"devmem":81920,"devcore":100,"type":"NVIDIA-A100-SXM4-80GB","health":true,"numa":0,"mode":"hami-core"}]'
```

Nach etwa 30 Sekunden meldet der Node die folgenden simulierten GPU Ressourcenkapazitäten:

```JSON
{  "nvidia.com/gpu": "10",  "nvidia.com/gpucores": "100",  "nvidia.com/gpumem": "81920",  "nvidia.com/gpumem-percentage": "100"}
```

Für `tenant-b` die Schritte 4 und 5 mit dessen Namen wiederholen. Die Annotation beschreibt zwei simulierte GPUs, `GPU-MOCK-B0` und `GPU-MOCK-B1`, mit jeweils 24.576 MB Speicher und 100 Cores; die Kapazität von `nvidia.com/gpu` wird auf 20 gesetzt.

## 5. Planungsablauf: Wie wird ein GPU Pod eingeplant?

Wenn ein GPU Pod an ein Mandantencluster übergeben wird, läuft die Planung zwischen Verwaltungscluster und Mandanten Worker Node ab. Das ist der Kern des Zusammenspiels von Kamaji und HAMi.

![Planungsweg eines GPU Pods](/images/blog/kamaji-hami-multitenant-gpu-sharing/gpu-scheduling-flow-en.png)

Der API Server läuft im Verwaltungscluster, der HAMi Webhook dagegen auf dem Worker Node des Mandanten. Die Admission Anfrage muss daher Kamajis Konnectivity Tunnel durchlaufen. Funktioniert dieser Weg nicht, gelangt der GPU Pod möglicherweise nicht wie erwartet in HAMis Planungsprozess.

Deshalb ist die Prüfung dieses Kommunikationswegs ein wichtiger Teil des Versuchs.

## 6. Ergebnisse: GPU Sharing, Ressourcengrenzen und Mandantenisolierung

Es wurden acht Tests durchgeführt; **alle waren erfolgreich**. Die folgenden Ergebnisse zeigen einige zentrale Prüfungen.

### TC-03 und TC-05: Drei Pods teilen sich eine GPU

Jeder Pod fordert 20.000 MB Speicher und 30 % der GPU Rechenleistung an. Die folgende Schleife erstellt drei Pods.

Das simulierte Plug-in gibt die Node Sperre nicht wie das echte Geräte Plug-in frei. Deshalb muss die HAMi Node Sperre nach jedem geplanten Pod manuell entfernt werden. Die Ursache wird später unter „Probleme und Lösungen“ beschrieben.

```Bash
export KUBECONFIG=$PWD/tenant-a.kubeconfig

for i in 1 2 3; docat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-share-${i}
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 20000   # MB
          nvidia.com/gpucores: 30    # % of one card
EOF  kubectl wait pod/gpu-share-${i} --for=condition=PodScheduled --timeout=120s
  kubectl annotate pod gpu-share-${i} hami.io/bind-phase=success --overwrite
  kubectl annotate node tenant-a-worker hami.io/mutex.lock-
done
```

Der Webhook leitet den Pod an den HAMi Scheduler, der ihn auf der simulierten GPU platziert:

```Plain Text
$ kubectl get pod gpu-share-1 -o jsonpath='{.spec.schedulerName}'
hami-scheduler

Annotations:  hami.io/vgpu-devices-allocated: GPU-MOCK-0,NVIDIA,20000,30:;
              hami.io/vgpu-node: tenant-a-worker
Events:
  Normal  FilteringSucceed  hami-scheduler  find fit node(tenant-a-worker), 0 nodes not fit, 1 nodes fit
  Normal  BindingSucceed    hami-scheduler  Successfully binding node [tenant-a-worker] to default/gpu-share-1
```

Alle drei Pods laufen schließlich auf derselben simulierten GPU und fordern zusammen 60.000 MB Speicher und 90 % Rechenleistung an.

```Plain Text
NAME          READY   STATUS    NODE
gpu-share-1   1/1     Running   tenant-a-worker
gpu-share-2   1/1     Running   tenant-a-worker
gpu-share-3   1/1     Running   tenant-a-worker
```

Das bestätigt die feingranulare GPU Sharing Planung von HAMi im simulierten Ressourcenmodell.

### TC-06 und TC-07: Bei unzureichenden Ressourcen nicht weiter einplanen

Ein vierter Pod mit weiteren 30 % Rechenleistung würde die Gesamtnachfrage auf 120 % erhöhen. Das überschreitet die 100 Cores der simulierten Karte.

```Bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-share-4
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 20000   # MB
          nvidia.com/gpucores: 30    # % of one card
EOF
```

Der Pod bleibt im Zustand `Pending`. HAMi nennt einen eindeutigen Grund für das Scheitern der Planung:

```Plain Text
$ kubectl describe pod gpu-share-4 | sed -n '/Events/,$p'
Events:
  Type     Reason            Age                From            Message
  ----     ------            ----               ----            -------
  Warning  FailedScheduling  15s                hami-scheduler  0/1 nodes are available: 1 1/1 CardInsufficientCore. no new claims to deallocate, preemption: 0/1 nodes are available: 1 No preemption victims found for incoming pod.
  Warning  FilteringFailed   15s (x2 over 15s)  hami-scheduler  1 nodes CardInsufficientCore(tenant-a-worker)
  Warning  FilteringFailed   15s (x2 over 15s)  hami-scheduler  no available node, 1 nodes do not meet
```

Anschließend wird unzureichender Speicher geprüft: Ein neuer Pod fordert 90.000 MB an und überschreitet damit die 81.920 MB der simulierten A100.

```Bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-mem-big
spec:
  containers:
    - name: app
      image: busybox
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
          nvidia.com/gpumem: 90000   # MB, more than the whole card
          nvidia.com/gpucores: 10    # % of one card, fits in the free 10%
EOF
```

Auch dieser Pod bleibt `Pending` und meldet `CardInsufficientMemory`.

Die beiden Ergebnisse zeigen, dass HAMi anhand der simulierten GPU Ressourcendaten erkennt, ob der Bedarf an Rechenleistung oder Speicher die zuweisbare Kapazität überschreitet, und entsprechend entscheidet.

### TC-08: Getrennte Sichtbarkeit von Daten und Ressourcen

Dieselben Abfragen an die API Server beider Mandanten stellen Nodes, Pods und zuweisbare GPU Ressourcen gegenüber:

```Bash
for t in a b; do  echo "===== tenant-$t ====="  kubectl --kubeconfig tenant-$t.kubeconfig get nodes
  kubectl --kubeconfig tenant-$t.kubeconfig get pods -A | grep -E 'gpu-|NAME'  kubectl --kubeconfig tenant-$t.kubeconfig get nodes -o json \
    | jq '.items[].status.allocatable | with_entries(select(.key|test("gpumem|gpucores")))'done
```

Die Testausgabe lautet:

```Plain Text
===== tenant-a =====
NAME              STATUS   ROLES    AGE   VERSION
tenant-a-worker   Ready    <none>   29m   v1.36.4
NAMESPACE     NAME          READY   STATUS    RESTARTS   AGE
default       gpu-share-1   1/1     Running   0          14m
default       gpu-share-2   1/1     Running   0          12m
default       gpu-share-3   1/1     Running   0          12m
{
  "nvidia.com/gpucores": "100",
  "nvidia.com/gpumem": "81920",
  "nvidia.com/gpumem-percentage": "100"
}
===== tenant-b =====
NAME              STATUS   ROLES    AGE     VERSION
tenant-b-worker   Ready    <none>   5m28s   v1.36.4
NAMESPACE     NAME          READY   STATUS    RESTARTS   AGE
{
  "nvidia.com/gpucores": "200",
  "nvidia.com/gpumem": "49152",
  "nvidia.com/gpumem-percentage": "200"
}
```

`tenant-a` sieht nur den eigenen Worker Node, drei laufende GPU Pods und simulierte GPU Ressourcen von 100 Cores / 81.920 MB. `tenant-b` sieht nur den eigenen Worker Node und 200 Cores / 49.152 MB.

Obwohl beide Steuerungsebenen im selben Verwaltungscluster laufen, liefert eine Abfrage über den API Server eines Mandanten weder Nodes, Pods noch GPU Ressourcen des anderen Mandanten zurück.

Das bestätigt die **getrennte Sichtbarkeit von API Ressourcen der Mandanten** in dieser Testarchitektur.

## 7. Fehlersuche: MetalLB Adressen und die HAMi Node Sperre

Im Versuch traten zwei bemerkenswerte Probleme auf, die sich relativ direkt beheben ließen.

### Problem 1: IPv6 Angaben im kind Netzwerk beeinflussen den MetalLB Adresspool

Beim Abrufen des Gateways nach der Kamaji Anleitung entstand eine zusammengefügte IPv6 und IPv4 Ausgabe wie `fc00:f853:ccd:e793::1172.18.0.1`. Dadurch war die Adresspool Konfiguration fehlerhaft.

**Lösung:** Mit `docker network inspect kind | grep Subnet` das IPv4 Subnetz ausdrücklich ermitteln und `172.18.255.200-172.18.255.250` als Bereich konfigurieren.

### Problem 2: GPU Pod bleibt wegen einer Node Sperre im Zustand Pending

Nach der Planung des ersten GPU Pods zeigten nachfolgende Pods diese Warnung:

```Plain Text
Warning  BindingFailed  hami-scheduler  node tenant-a-worker has been locked within 5m0s: node lock contention
```

HAMi sperrt den Node beim Binden eines Pods vorübergehend und setzt `hami.io/bind-phase: allocating`. Auf einem echten Node schließt das HAMi Geräte Plug-in die Zuweisung ab und gibt die Sperre frei. Das simulierte Plug-in tut dies nicht; andernfalls läuft die Sperre erst nach fünf Minuten ab.

**Lösung im Experiment:** Die letzten Schritte des Geräte Plug-ins manuell nachbilden, den Bindungsstatus des Pods aktualisieren und die Node Sperre entfernen:

```Bash
kubectl annotate pod gpu-share-1 hami.io/bind-phase=success --overwrite
kubectl annotate node tenant-a-worker hami.io/mutex.lock-
```

Danach konnte der nächste Pod bald gebunden werden.

Das ist **ein Unterschied der simulierten Testumgebung** und kein Hinweis auf einen Fehler in Kamaji oder HAMi selbst.

## 8. Grenzen des Experiments: Was muss mit einer echten GPU geprüft werden?

Der Versuch prüft den Kommunikationsweg zwischen Cluster Komponenten und GPU Planungsentscheidungen; **die Laufzeitisolierung echter GPUs wird damit nicht geprüft**.

- **Echte Speicher und Rechenleistungsgrenzen wurden nicht geprüft.** HAMi-core benötigt unter anderem einen NVIDIA Treiber, um GPU Ressourcengrenzen durchzusetzen. Einer simulierten GPU fehlt die dazu nötige Hardware.
- **Es gibt keine Leistungsmessungen.** Es lief keine CUDA Last. Deshalb lassen sich keine Aussagen zu Durchsatz, Leistungseinbußen oder Beeinträchtigungen durch „laute Nachbarn“ ableiten.
- **Gerätedaten wurden manuell simuliert.** In einer echten Umgebung übernimmt das HAMi Geräte Plug-in normalerweise die Registrierung der Node Annotations und den Abschluss der Ressourcenzuweisung. Hier waren manuelle Schritte nötig.
- **Das Anbinden der Worker Nodes entspricht nicht dem offiziell empfohlenen Weg.** `kindest/node` Container reichen für den Versuch aus. Üblicherweise unterstützt Kamaji das Anbinden echter Maschinen mit kubeadm oder Cluster API.

## Fazit

Mit Kamaji und HAMi wurde ohne physische GPU eine Kubernetes Testumgebung mit mehreren Mandanten aufgebaut und die GPU Planung geprüft.

Die Ergebnisse zeigen, dass ein von Kamaji gehosteter Mandanten API Server den HAMi Webhook über einen Konnectivity Tunnel erreicht. So können GPU Pods Admission und Planung durchlaufen. Die Tests mit simulierten Ressourcen bestätigten außerdem den Umgang von HAMi mit GPU Sharing Anfragen, unzureichenden Ressourcen und getrennter API Ressourcensichtbarkeit zwischen Mandanten.

**Der Wert dieses Aufbaus besteht darin, dass die Integration von Mandanten Steuerungsebenen und GPU Planungswegen bereits ohne echte GPU Hardware überprüft werden kann.**

Das simulierte Gerät kann echte GPU Speicherisolierung, Rechenleistungsgrenzen und Laufzeitleistung nicht überprüfen. Teams, die diese Architektur produktiv einsetzen möchten, müssen weitere Tests mit echter GPU Hardware und realen Workloads durchführen.

Für Entwickler, die Kubernetes Multitenancy, GPU Sharing oder HAMi Planung untersuchen, bietet der Versuch einen Ausgangspunkt.

---

**Originalartikel:** https://anishbista.org/blog/multi-tenant-gpu-kubernetes-on-a-laptop-kamaji-hami/#why-kamaji--hami

**Autor:** Kubernetes Softwareentwickler *Anish Bista*
