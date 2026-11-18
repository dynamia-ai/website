---
title: >-
  HAMi-vGPU-Prinzipanalyse Teil 5: HAMi-Core (libvgpu.so) – Funktionsprinzip von vCUDA
coverTitle: 'HAMi-Core (libvgpu.so): Feingranulares vGPU im Überblick'
date: '2025-07-28'
excerpt: >-
  Fünfter Artikel der HAMi-Prinzipanalyse-Serie: Überblick über HAMi-Core – Wirkungsweise,
  CUDA-API-Interception und Ressourcenlimits für GPU-Kerne und Speicher.
author: Dynamia AI Team
tags:
  - HAMi
  - GPU-Sharing
  - vGPU
  - Kubernetes
  - Heterogenes Computing
category: Technical Deep Dive
coverImage: /images/blog/gpu7/cover2.jpg
linktitle: HAMi Core CUDA-Kompatibilität
---

Im letzten Artikel analysierten wir, wie fortgeschrittene Scheduling-Strategien wie Spread und Binpack im `hami-scheduler` umgesetzt werden.

Dies ist der fünfte Artikel der HAMi-Prinzipanalyse-Serie mit einer kompakten Darstellung der Funktionsweise von HAMi-Core – einschließlich Wirkungsweise, CUDA-API-Interception und Ressourcenlimits für GPU-Kerne und Speicher.

Dieser Artikel basiert auf: <https://mp.weixin.qq.com/s/vN3uDRPpAP3UmE2Hgn75vg>

![HAMi-vGPU-Core-Architekturdiagramm](/images/blog/gpu7/p1.jpg)

Dieser Artikel geht vor allem auf folgende Fragen ein:

1. Wie wird `libvgpu.so` wirksam?
2. Wie werden CUDA-APIs abgefangen?
3. Wie wird GPU-Speicher begrenzt?
4. Wie werden GPU-Kerne begrenzt?

> Mit C kenne ich mich nicht so gut aus – falls ich Fehler gemacht habe, bitte in den Kommentaren korrigieren!

## Kurzfassung

**Wie wird `libvgpu.so` wirksam?**

* Im `Allocate`-Verfahren des Device Plugins wird `libvgpu.so` per `hostPath` vom Host in den Pod gemountet.
* Über den `LD_PRELOAD`-Mechanismus wird die in diesem Schritt gemountete `libvgpu.so` vorrangig geladen und wirksam.

**Wie werden CUDA-APIs abgefangen?**

* Durch Überschreiben von `dlsym` werden Aufrufe an NVIDIA-Dynamic Libraries (CUDA, NVML usw.) abgefangen – insbesondere Symbole mit Präfix `cu` und `nvml`.

**Wie wird GPU-Speicher begrenzt?**

* Zuerst wird `_nvmlDeviceGetMemoryInfo` der NVML-API abgefangen, sodass `nvidia-smi` nur den von der Anwendung angeforderten Speicher anzeigt (aus `CUDA_DEVICE_MEMORY_LIMIT_X`).
* Anschließend werden speicherbezogene CUDA-APIs wie `cuMemoryAllocate` und `cuMemAlloc_v2` abgefangen.
* Vor der Allokation erfolgt ein `oom_check`: Überschreitet die aktuelle GPU-Speichernutzung des Pods das Limit (`CUDA_DEVICE_MEMORY_LIMIT_X`), wird direkt ein OOM-Fehler zurückgegeben.

**Wie werden GPU-Kerne begrenzt?**

* Entsprechend werden CUDA-APIs zum Einreichen von Kernels abgefangen, z. B. `cuLaunchKernel`.
* Vor dem Kernel-Start kommt eine `rate_limit`-Logik zum Einsatz – ähnlich einem Token-Bucket: Jede Einreichung verbraucht ein Token; fehlen Tokens, blockiert der Prozess per Sleep, bis Tokens nachgefüllt sind.
* Beim Nachfüllen wird die Umgebungsvariable `CUDA_DEVICE_SM_LIMIT` verwendet.

---

## 1. Wie `libvgpu.so` wirksam wird

1. Wie wird die Library in den Pod gemountet?
2. Wie wird sie geladen?

### Mount in den Pod

Dieser Teil liegt bei `hami-device-plugin-nvidia`, konkret in der `Allocate`-Methode. Relevanter Code:

```go
// pkg/device-plugin/nvidiadevice/nvinternal/plugin/server.go#L385
func (plugin *NvidiaDevicePlugin) Allocate(ctx context.Context, reqs *kubeletdevicepluginv1beta1.AllocateRequest) (*kubeletdevicepluginv1beta1.AllocateResponse, error) {
    // ...
    // Some logic omitted for brevity
    // ...
    response.Mounts = append(response.Mounts,
        &kubeletdevicepluginv1beta1.Mount{ContainerPath: fmt.Sprintf("%s/vgpu/libvgpu.so", hostHookPath),
            HostPath: hostHookPath + "/vgpu/libvgpu.so",
            ReadOnly: true},
        // ... other mounts
    )
    // ...
}
```

Der Kern:

```go
response.Mounts = append(response.Mounts,
    &kubeletdevicepluginv1beta1.Mount{
        ContainerPath: fmt.Sprintf("%s/vgpu/libvgpu.so", hostHookPath),
        HostPath:      hostHookPath + "/vgpu/libvgpu.so",
        ReadOnly:      true,
    },
)
```

Hier wird `libvgpu.so` per `HostPath` gemountet – die Quelle stammt aus einer Umgebungsvariable; in HAMi-Deployments standardmäßig `/usr/local`.

### Laden der Library

In derselben `Allocate`-Methode gibt es folgende Logik:

```go
found := false
for _, val := range currentCtr.Env {
    if strings.Compare(val.Name, "CUDA_DISABLE_CONTROL") == 0 {
        // If the environment variable exists but is false or fails to parse, ignore it
        t, _ := strconv.ParseBool(val.Value)
        if !t {
            continue
        }
        // Only mark as "found" if the environment variable exists and is true
        found = true
        break
    }
}
if !found {
    response.Mounts = append(response.Mounts,
        &kubeletdevicepluginv1beta1.Mount{
            ContainerPath: "/etc/ld.so.preload",
            HostPath:      hostHookPath + "/vgpu/ld.so.preload",
            ReadOnly:      true,
        },
    )
}```
Ist `CUDA_DISABLE_CONTROL=true` nicht gesetzt (HAMi-Isolation aktiv), wird `/usr/local/vgpu/ld.so.preload` vom Host nach `/etc/ld.so.preload` im Pod gemountet.

Unter Linux lädt das System Shared Libraries aus `/etc/ld.so.preload` mit Vorrang – typischerweise, um bestimmte Libraries zu erzwingen und Standard-Dynamic-Linking zu überschreiben.
> Reihenfolge beim Laden: `LD_PRELOAD` > `LD_LIBRARY_PATH` > `/etc/ld.so.cache` > `/lib` > `/usr/lib`.

`LD_PRELOAD` sorgt dafür, dass unsere angepasste `libvgpu.so` geladen wird.

Inhalt der Datei auf dem Host:

```console
root@j99cloudvm:~/lixd/hami# ls /usr/local/vgpu
containers  ld.so.preload  libvgpu.so

root@j99cloudvm:~/lixd/hami# cat /usr/local/vgpu/ld.so.preload
/usr/local/vgpu/libvgpu.so
```

Damit wird die gemountete `libvgpu.so` vorrangig geladen.

**Kurz:** Es wird die eigene `libvgpu.so` per `LD_PRELOAD` geladen.

### Schwellenwerte für Core und Speicher

Woher kennt `libvgpu.so` die Limits?

Auch das regelt `Allocate` in `hami-device-plugin-nvidia`: Es injiziert `CUDA_DEVICE_MEMORY_LIMIT` und `CUDA_DEVICE_SM_LIMIT` in den Pod.

```go
for i, dev := range devreq {
    limitKey := fmt.Sprintf("CUDA_DEVICE_MEMORY_LIMIT_%v", i)
    response.Envs[limitKey] = fmt.Sprintf("%vm", dev.Usedmem)
}
response.Envs["CUDA_DEVICE_SM_LIMIT"] = fmt.Sprint(devreq.Usedcores)
```

So weiß `libvgpu.so`, welche Grenzen gelten.

### Zusammenfassung

Ablauf der Wirkungsweise von `libvgpu.so`:

1. Beim Start kopiert `hami-device-plugin-nvidia` `libvgpu.so` aus dem Image auf den Host – standardmäßig `/usr/local/vgpu/libvgpu.so`.
2. Beim Pod-Start mountet `Allocate` diese Datei per `hostPath` in den Pod.
3. Über `/etc/ld.so.preload` wird dieselbe `libvgpu.so` vorrangig geladen – durch Mount von `/usr/local/vgpu/ld.so.preload` auf `/etc/ld.so.preload` im Pod.

Damit wird beim Laden von Shared Libraries im Pod unsere angepasste `libvgpu.so` bevorzugt.

## 2. Wie CUDA-APIs abgefangen werden

Dieser Abschnitt beschreibt, wie HAMi-Core (`libvgpu.so`) CUDA-APIs abfängt.

### `dlsym` überschreiben

**Überschreiben von `dlsym`**
`dlsym` dient der Symbolauflösung (`dlfcn.h`, POSIX). HAMi-Core überschreibt `dlsym`, um Aufrufe an NVIDIA-Libraries (CUDA, NVML) abzufangen – Symbole mit `cu` und `nvml`.

1. `dlsym` initialisieren.
2. Beginnt das Symbol mit `cu`, Behandlung über `__dlsym_hook_section(handle, symbol)`.
3. Beginnt es mit `nvml`, Behandlung über `__dlsym_hook_section_nvml(handle, symbol)`.
4. Sonst echtes `dlsym`.

Vollständiger Code:

```c
// src/libvgpu.c#L77-L116
FUNC_ATTR_VISIBLE void* dlsym(void* handle, const char* symbol) {
    pthread_once(&dlsym_init_flag, init_dlsym);
    LOG_DEBUG("into dlsym %s", symbol);

    /* 1. Initialize real_dlsym */
    // ... initialization logic ...

    /* 2. Special handling for cu* symbols */
    if (symbol == 'c' && symbol == 'u') {
        pthread_once(&pre_cuinit_flag, (void(*)(void))preInit);
        void* f = __dlsym_hook_section(handle, symbol);
        if (f != NULL)
            return f;
    }

    /* 3. Special handling for nvml* symbols */
#ifdef HOOK_NVML_ENABLE
    if (symbol == 'n' && symbol == 'v' && symbol == 'm' && symbol == 'l') {
        void* f = __dlsym_hook_section_nvml(handle, symbol);
        if (f != NULL)
            return f;
    }
#endif

    /* 4. Other symbols go through the original dlsym */
    return real_dlsym(handle, symbol);
}
```

### `cu`-Symbole: `__dlsym_hook_section`

`__dlsym_hook_section` definiert die Behandlung von Symbolen mit `cu`.
> `__dlsym_hook_section_nvml` ist analog und wird hier nicht im Detail behandelt.

```c
void* __dlsym_hook_section(void* handle, const char* symbol) {
    int it;

    /* 1. Check if the symbol is in the list of CUDA APIs to be intercepted */
    for (it = 0; it < CUDA_ENTRY_END; it++) {
        if (strcmp(cuda_library_entry[it].name, symbol) == 0) {
            if (cuda_library_entry[it].fn_ptr == NULL) {
                LOG_WARN("NEED TO RETURN NULL");
                return NULL;
            } else {
                break;
            }
        }
    }

    /* 2. Fill the hooked function pointer through macro definitions */
    /* Context */
    DLSYM_HOOK_FUNC(cuCtxGetDevice);
    DLSYM_HOOK_FUNC(cuCtxCreate);
    /* ... */
    DLSYM_HOOK_FUNC(cuGraphDestroy);

#ifdef HOOK_MEMINFO_ENABLE
    DLSYM_HOOK_FUNC(cuMemGetInfo_v2);
#endif

    /* 3. Return NULL if not found */
    return NULL;
}```
Die Kernlogik steckt in `DLSYM_HOOK_FUNC`.

### Makro `DLSYM_HOOK_FUNC`
```c
#define DLSYM_HOOK_FUNC(f)                                           \
    if (0 == strcmp(symbol, #f)) {                                   \
        return (void*) f; }                                          \
```

* `#f`: Stringifizierung – z. B. wird `cuGraphDestroy` zu `"cuGraphDestroy"`.
* `strcmp(symbol, #f)`: Bei Übereinstimmung liefert `strcmp` 0.
* `return (void*) f;`: Dann wird der Funktionszeiger von `f` zurückgegeben.

Beispiel – `DLSYM_HOOK_FUNC(cuGraphDestroy);` expandiert zu:

```c
if (0 == strcmp(symbol, "cuGraphDestroy")) {
    return (void*) cuGraphDestroy;
}
```

### `hook.c`

Die Datei nutzt `dlopen` und `dlsym`, lädt die CUDA-Library und leitet Aufrufe um – für Interception, Monitoring oder Anpassung des Verhaltens.

`cuda_library_entry` listet abzufangende Funktionen. `load_cuda_libraries` öffnet `libcuda.so.1` per `dlopen`; `real_dlsym` resolved die Adressen nach Namen.

### `libcuda_hook.h`

`src/include/libcuda_hook.h` enthält die konkrete Interception über Funktionszeiger. `CUDA_OVERRIDE_CALL` leitet Aufrufe über die Tabelle um; `CUDA_FIND_ENTRY` findet den passenden Eintrag anhand des Enums.

### Zusammenfassung

Kernmechanismus: `dlsym` überschreiben und Funktionsadressen ersetzen.

## 3. Wie GPU-Speicher begrenzt wird

Zwei Teile: NVML-Interception und CUDA-API-Interception.

### NVML

Bei 3000 MB Anforderung zeigt `nvidia-smi` im Pod genau 3000 MB – durch Abfangen von `_nvmlDeviceGetMemoryInfo`.

Die Hook-Funktion liest das Limit aus `CUDA_DEVICE_MEMORY_LIMIT_X` und setzt `total`, `free` und `used` in `nvmlMemory_t` auf das virtuelle Limit, nicht die Hardware.

Das Limit wird bei der Initialisierung aus der Umgebung gelesen und in Shared Memory abgelegt.

### CUDA

#### `cuMemAlloc_v2`

HAMi-Core implementiert relevante Methoden neu. `cuMemAlloc_v2` ruft u. a. `add_chunk` mit eigener Prüflogik auf:

```c
if (oom_check(dev, size)) {
    return -1;
}
```

#### `oom_check`

Implementierung von `oom_check`:

```c
int oom_check(const int dev, size_t addon) {
    // ...
    uint64_t limit = get_current_device_memory_limit(d);
    size_t _usage = get_gpu_memory_usage(d);

    if (limit == 0) {
        return 0;
    }

    size_t new_allocated = _usage + addon;
    if (new_allocated > limit) {
        LOG_ERROR("Device %d OOM %zu / %zu", d, new_allocated, limit);
        
        // ... try to clean up resources from quit processes ...
        
        return 1;
    }
    return 0;
}
```

Überschreitet die neue Allokation das Limit, liefert die Funktion `1` – die Allokation schlägt mit OOM fehl.

## 4. Wie GPU-Kerne begrenzt werden

### Was ist ein Kernel?

In CUDA ist ein Kernel eine parallel auf der GPU laufende Funktion; der Start eines Kernels nutzt die GPU wirklich.

HAMi-Core begrenzt Kernel-Einreichungen – Token-Bucket-ähnlich: jede Einreichung verbraucht ein Token; ohne Token schläft der Prozess, bis nachgefüllt wird.

### `cuLaunchKernel`

CUDA-API zum Starten eines Kernels. Die angepasste `cuLaunchKernel` in HAMi-Core ruft `rate_limiter` auf.

```c
CUresult cuLaunchKernel(...) {
    ENSURE_RUNNING();
    pre_launch_kernel();
    if (pidfound == 1) {
        rate_limiter(gridDimX * gridDimY * gridDimZ,
                     blockDimX * blockDimY * blockDimZ);
    }
    CUresult res = CUDA_OVERRIDE_CALL(cuda_library_entry,
                                      cuLaunchKernel,
                                      ...);
    return res;
}
```

### Kernlogik: `rate_limiter`

`rate_limiter` vergleicht Nutzung mit dem Limit aus der Umgebungsvariable. Jede Einreichung verringert `g_cur_cuda_cores`; fällt der Wert unter null, blockiert `nanosleep`; im nächsten Zeitfenster wird wieder aufgefüllt.

```c
void rate_limiter(int grids, int blocks) {
    // ...
    if ((get_current_device_sm_limit(0) >= 100) || (get_current_device_sm_limit(0) == 0))
        return;
    // ...
    do {
CHECK:
        before_cuda_cores = g_cur_cuda_cores;
        LOG_DEBUG("current core: %d", g_cur_cuda_cores);
        if (before_cuda_cores < 0) {
            nanosleep(&g_cycle, NULL);
            goto CHECK;
        }
        after_cuda_cores = before_cuda_cores - kernel_size;
    } while (!CAS(&g_cur_cuda_cores, before_cuda_cores, after_cuda_cores));
}
```

Limit aus `CUDA_DEVICE_SM_LIMIT`. Die `do-while`-Schleife mit `CAS` (Compare And Swap) macht Token-Updates atomar. Sleep-Dauer: konstant 10 Millisekunden.

### Token-Nachfüllung

Ein Hintergrundthread (`utilization_watcher`) überwacht die GPU-Auslastung.

```c
void* utilization_watcher() {
    // ...
    int upper_limit = get_current_device_sm_limit(0);
    // ...
    while (1) {
        nanosleep(&g_wait, NULL);
        // ... get current utilization ...
        share = delta(upper_limit, userutil, share);
        change_token(share);
    }
}
```

Pro Zyklus berechnet `delta` die Nachfüllmenge; `change_token` fügt Tokens hinzu – basierend auf Differenz zwischen Zielauslastung (`upper_limit`) und Ist-Auslastung.

Das passt zu den Testergebnissen in [Open-Source-vGPU-Lösung HAMi: Test der Core- und Speicher-Isolation](/blog/open-source-vgpu-hami-core-memory-test): kurzfristig kann die Auslastung über dem Schwellenwert liegen, langfristig schwankt der Mittelwert um den Schwellenwert.

![vGPU-Speicherallokation und Isolation](/images/blog/gpu7/p3.jpg)
> Das Bild zeigt das Testergebnis bei GPU-Core-Limit 30.

## 5. Zusammenfassung

Dieser Artikel analysiert vor allem das Funktionsprinzip von HAMi-Core. Die Rechenleistungsbegrenzung in HAMi ähnelt einem Token Bucket: Jede GPU-Task-Einreichung verbraucht ein Token; sind keine mehr da, blockiert die Einreichung bis zur nächsten Auffüllung.

#### Antworten auf die Eingangsfragen

#### Wie wird `libvgpu.so` wirksam?

1. Das Device Plugin mountet `libvgpu.so` per `hostPath` vom Host in den Pod.
2. Per `LD_PRELOAD` wird die gemountete `libvgpu.so` vorrangig geladen.
3. Speicher- und Core-Schwellenwerte über `CUDA_DEVICE_MEMORY_LIMIT_X` und `CUDA_DEVICE_SM_LIMIT`.

#### Wie werden CUDA-APIs abgefangen?

* `dlsym` überschreiben, Aufrufe an CUDA/NVML abfangen – Symbole `cu*` und `nvml*`.

#### Wie wird GPU-Speicher begrenzt?

* NVML: `_nvmlDeviceGetMemoryInfo` – `nvidia-smi` zeigt angeforderten Speicher (`CUDA_DEVICE_MEMORY_LIMIT_X`).
* CUDA: Allokations-APIs wie `cuMemoryAllocate`, `cuMemAlloc_v2`.
* `oom_check` vor Allokation; bei Überschreitung OOM.

#### Wie werden GPU-Kerne begrenzt?

* CUDA-APIs wie `cuLaunchKernel` abfangen.
* `rate_limit` (Token Bucket) vor Einreichung; ohne Token Sleep, dann Nachfüllung.
* `CUDA_DEVICE_SM_LIMIT` beim Nachfüllen.

---

*Mehr zum HAMi-Projekt: [GitHub-Repository](https://github.com/Project-HAMi/HAMi) oder [Slack-Community](https://cloud-native.slack.com/archives/C07T10BU4R2).*