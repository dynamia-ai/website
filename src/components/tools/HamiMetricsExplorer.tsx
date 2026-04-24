'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';

interface MetricEntry {
  n: string;
  l: Record<string, string>;
  v: number;
}

interface PodUsage {
  name: string;
  ns: string;
  mem: number;
  cores: number;
}

interface GpuState {
  uuid: string;
  type: string;
  idx: string;
  node: string;
  memLimit: number;
  memAlloc: number;
  coreLimit: number;
  coreAlloc: number;
  shared: number;
  memLimitMB: number;
  pods: PodUsage[];
}

interface NodeState {
  name: string;
  gpus: GpuState[];
}

interface ExportNodeType {
  'gpu-type': string;
  'gpu-uuids': string[];
}

interface ExportNode {
  'node-name': string;
  'gpu-types': ExportNodeType[];
}

interface ExportData {
  'kube-system-uuid': string;
  nodes: ExportNode[];
}

interface DerivedResult {
  all: MetricEntry[];
  gpus: GpuState[];
  nodes: NodeState[];
  poolMap: Record<string, NodeState[]>;
  typeEntries: [string, number][];
  exportData: ExportData;
  totalMem: number;
  usedMem: number;
  totalPods: number;
  idleGpuCount: number;
  poolCount: number;
  quotas: Record<string, { n: string; u: number; l: number }[]>;
  buildInfo: Record<string, string> | null;
}

const TYPE_COLORS = ['#2dd4a8', '#4f8df7', '#f5b731', '#f06565', '#a78bfa', '#f472b6', '#38bdf8'];

const formatBytes = (b: number) => {
  if (b === 0) return '0';
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)}G`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(0)}M`;
  return `${b.toFixed(0)}B`;
};

const parseMetrics = (text: string): MetricEntry[] => {
  const result: MetricEntry[] = [];

  const unescapeLabelValue = (value: string) =>
    value.replace(/\\([\\n"])/g, (_, ch: string) => {
      if (ch === 'n') return '\n';
      return ch;
    });

  const parseLabels = (raw: string): Record<string, string> => {
    const labels: Record<string, string> = {};
    // Support escaped characters in quoted label values, e.g. a="x\"y\\z"
    const labelRe = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"((?:\\.|[^"\\])*)"/g;

    for (const match of raw.matchAll(labelRe)) {
      labels[match[1]] = unescapeLabelValue(match[2]);
    }

    return labels;
  };

  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const matched = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\s*\{\s*([^}]*)\s*\})?\s+(.+)$/);
    if (!matched) continue;

    const labels = matched[2] ? parseLabels(matched[2]) : {};

    result.push({
      n: matched[1],
      l: labels,
      v: parseFloat(matched[3]),
    });
  }

  return result;
};

const buildResult = (text: string): DerivedResult => {
  const all = parseMetrics(text);
  const gpuMap: Record<string, GpuState> = {};

  const getGpu = (uuid: string): GpuState => {
    if (!gpuMap[uuid]) {
      gpuMap[uuid] = {
        uuid,
        type: '',
        idx: '',
        node: '',
        memLimit: 0,
        memAlloc: 0,
        coreLimit: 0,
        coreAlloc: 0,
        shared: 0,
        memLimitMB: 0,
        pods: [],
      };
    }
    return gpuMap[uuid];
  };

  all.forEach((m) => {
    if (!m.l.deviceuuid) return;
    const x = getGpu(m.l.deviceuuid);

    switch (m.n) {
      case 'nodeGPUOverview': {
        x.type = m.l.devicetype || x.type;
        x.idx = m.l.deviceidx || x.idx;
        x.node = m.l.nodeid || x.node;

        const shared = parseInt(m.l.sharedcontainers || '0', 10);
        x.shared = Number.isNaN(shared) ? 0 : shared;

        const memLimitMB = parseInt(m.l.devicememorylimit || '0', 10);
        x.memLimitMB = Number.isNaN(memLimitMB) ? 0 : memLimitMB;

        const coreAlloc = parseInt(m.l.devicecores || '0', 10);
        if (!Number.isNaN(coreAlloc)) x.coreAlloc = coreAlloc;

        x.memAlloc = m.v;
        break;
      }
      case 'GPUDeviceCoreAllocated':
        x.type = m.l.devicetype || x.type;
        x.idx = m.l.deviceidx || x.idx;
        x.node = m.l.nodeid || x.node;
        x.coreAlloc = m.v;
        break;
      case 'GPUDeviceCoreLimit':
        x.coreLimit = m.v;
        break;
      case 'GPUDeviceMemoryLimit':
        x.memLimit = m.v;
        if (!x.memLimitMB) x.memLimitMB = Math.round(m.v / 1048576);
        break;
      case 'GPUDeviceMemoryAllocated':
        x.memAlloc = m.v;
        break;
      case 'GPUDeviceSharedNum':
        x.shared = m.v;
        break;
      case 'vGPUMemoryAllocated': {
        const existing = x.pods.find((p) => p.name === m.l.podname);
        if (existing) {
          existing.mem = m.v;
        } else {
          x.pods.push({ name: m.l.podname, ns: m.l.podnamespace, mem: m.v, cores: 0 });
        }
        break;
      }
      case 'vGPUCoreAllocated': {
        const existing = x.pods.find((p) => p.name === m.l.podname);
        if (existing) {
          existing.cores = m.v;
        } else {
          x.pods.push({ name: m.l.podname, ns: m.l.podnamespace, mem: 0, cores: m.v });
        }
        break;
      }
      default:
        break;
    }
  });

  const gpus = Object.values(gpuMap);
  const nodeMap: Record<string, NodeState> = {};
  gpus.forEach((gpu) => {
    if (!nodeMap[gpu.node]) nodeMap[gpu.node] = { name: gpu.node, gpus: [] };
    nodeMap[gpu.node].gpus.push(gpu);
  });
  Object.values(nodeMap).forEach((node) => node.gpus.sort((a, b) => Number(a.idx) - Number(b.idx)));

  const nodes = Object.values(nodeMap);
  const poolMap: Record<string, NodeState[]> = {};
  nodes.forEach((node) => {
    const name = node.name.match(/(.*-pool)/)?.[1] || node.name;
    if (!poolMap[name]) poolMap[name] = [];
    poolMap[name].push(node);
  });

  const totalMem = gpus.reduce((s, x) => s + x.memLimit, 0);
  const usedMem = gpus.reduce((s, x) => s + x.memAlloc, 0);
  const totalPods = gpus.reduce((s, x) => s + x.pods.length, 0);
  const idleGpuCount = gpus.filter((x) => x.memAlloc === 0 && x.coreAlloc === 0).length;

  const typeCounts: Record<string, number> = {};
  gpus.forEach((gpu) => {
    const type = gpu.type || '?';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const clean: GpuState[] = [];
  const seen = new Set<string>();
  gpus.forEach((gpu) => {
    if (seen.has(gpu.uuid) || !gpu.uuid || !gpu.node) return;
    seen.add(gpu.uuid);
    clean.push(gpu);
  });

  const perNodeType: Record<string, Record<string, string[]>> = {};
  clean.forEach((gpu) => {
    if (!perNodeType[gpu.node]) perNodeType[gpu.node] = {};
    const t = gpu.type || 'unknown';
    if (!perNodeType[gpu.node][t]) perNodeType[gpu.node][t] = [];
    perNodeType[gpu.node][t].push(gpu.uuid);
  });

  const genUUID = (ns: string[]) => {
    let h = 0;
    for (const n of ns) {
      for (let i = 0; i < n.length; i += 1) {
        h = (h << 5) - h + n.charCodeAt(i);
        h |= 0;
      }
    }
    const x = Math.abs(h).toString(16).padStart(8, '0');
    return `${x.slice(0, 8)}-${x.slice(0, 4)}-4${x.slice(1, 4)}-${x.slice(0, 4)}-${x.slice(0, 12).padEnd(12, '0')}`;
  };

  const exportData: ExportData = {
    'kube-system-uuid': genUUID(nodes.map((n) => n.name)),
    nodes: Object.keys(perNodeType)
      .sort()
      .map((nodeName) => ({
        'node-name': nodeName,
        'gpu-types': Object.keys(perNodeType[nodeName])
          .sort()
          .map((gpuType) => ({
            'gpu-type': gpuType,
            'gpu-uuids': perNodeType[nodeName][gpuType].sort(),
          })),
      })),
  };

  const quotas: Record<string, { n: string; u: number; l: number }[]> = {};
  all.filter((m) => m.n === 'QuotaUsed').forEach((m) => {
    const ns = m.l.quotanamespace;
    if (!quotas[ns]) quotas[ns] = [];
    quotas[ns].push({ n: m.l.quotaName, u: m.v, l: parseInt(m.l.limit || '0', 10) });
  });

  const buildInfo = all.find((m) => m.n === 'hami_build_info')?.l ?? null;

  return {
    all,
    gpus,
    nodes,
    poolMap,
    typeEntries,
    exportData,
    totalMem,
    usedMem,
    totalPods,
    idleGpuCount,
    poolCount: Object.keys(poolMap).length,
    quotas,
    buildInfo,
  };
};

const download = (filename: string, content: string, mime: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: mime }));
  link.download = filename;
  link.click();
};

export default function HamiMetricsExplorer() {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const mergeFileRef = useRef<HTMLInputElement | null>(null);
  const [raw, setRaw] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [copyMergeOk, setCopyMergeOk] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeInput, setMergeInput] = useState('');
  const [mergeOutput, setMergeOutput] = useState('');
  const [mergeError, setMergeError] = useState('');
  const [mergeStats, setMergeStats] = useState<{ currTotal: number; oldTotal: number; duplicateCount: number; finalTotal: number } | null>(null);

  const result = useMemo(() => (raw ? buildResult(raw) : null), [raw]);

  const openFile = () => fileRef.current?.click();
  const onLoadFile = async (file: File) => {
    const text = await file.text();
    setRaw(text);
    setFileName(file.name);
  };

  const onMerge = () => {
    if (!result) return;
    if (!mergeInput.trim()) {
      setMergeError(t('tools.hamiMetricsExplorerPage.errors.mergeEmpty'));
      return;
    }

    let oldData: ExportData;
    try {
      oldData = JSON.parse(mergeInput) as ExportData;
    } catch (error) {
      setMergeError(`${t('tools.hamiMetricsExplorerPage.errors.invalidJson')}: ${(error as Error).message}`);
      return;
    }

    const currData = result.exportData;
    const uuidSet = new Set<string>();
    const mergedNodes: ExportNode[] = [];

    const collectUUIDs = (node: ExportNode) => {
      node['gpu-types']?.forEach((type) => type['gpu-uuids']?.forEach((uuid) => uuidSet.add(uuid)));
    };

    currData.nodes.forEach((node) => {
      mergedNodes.push(structuredClone(node) as ExportNode);
      collectUUIDs(node);
    });

    oldData.nodes?.forEach((oldNode) => {
      const existingNode = mergedNodes.find((n) => n['node-name'] === oldNode['node-name']);
      if (!existingNode) {
        const copied = structuredClone(oldNode) as ExportNode;
        const filteredTypes: ExportNodeType[] = [];
        copied['gpu-types']?.forEach((type) => {
          const filtered = type['gpu-uuids'].filter((uuid) => !uuidSet.has(uuid));
          if (!filtered.length) return;
          filteredTypes.push({ ...type, 'gpu-uuids': filtered });
          filtered.forEach((uuid) => uuidSet.add(uuid));
        });
        if (filteredTypes.length) mergedNodes.push({ ...copied, 'gpu-types': filteredTypes });
        return;
      }

      oldNode['gpu-types']?.forEach((oldType) => {
        const existingType = existingNode['gpu-types'].find((x) => x['gpu-type'] === oldType['gpu-type']);
        if (!existingType) {
          const filtered = oldType['gpu-uuids'].filter((uuid) => !uuidSet.has(uuid));
          if (!filtered.length) return;
          existingNode['gpu-types'].push({ ...oldType, 'gpu-uuids': filtered });
          filtered.forEach((uuid) => uuidSet.add(uuid));
          return;
        }
        const newUUIDs = oldType['gpu-uuids'].filter((uuid) => !uuidSet.has(uuid));
        if (!newUUIDs.length) return;
        existingType['gpu-uuids'].push(...newUUIDs);
        newUUIDs.forEach((uuid) => uuidSet.add(uuid));
      });
    });

    const mergedResult: ExportData = {
      'kube-system-uuid': currData['kube-system-uuid'],
      nodes: mergedNodes,
    };
    const currTotal = currData.nodes.reduce((s, n) => s + n['gpu-types'].reduce((s2, t2) => s2 + t2['gpu-uuids'].length, 0), 0);
    const oldTotal = oldData.nodes ? oldData.nodes.reduce((s, n) => s + n['gpu-types'].reduce((s2, t2) => s2 + t2['gpu-uuids'].length, 0), 0) : 0;
    const finalTotal = mergedResult.nodes.reduce((s, n) => s + n['gpu-types'].reduce((s2, t2) => s2 + t2['gpu-uuids'].length, 0), 0);
    const duplicateCount = currTotal + oldTotal - finalTotal;

    setMergeError('');
    setMergeStats({ currTotal, oldTotal, duplicateCount, finalTotal });
    setMergeOutput(JSON.stringify(mergedResult, null, 2));
  };

  const analysis = useMemo(() => {
    if (!result) return [];
    const rows: {
      title: string;
      desc: string;
      level: 'info' | 'warn' | 'danger' | 'good';
      tagText?: string;
      tagTone?: 'info' | 'warn' | 'danger' | 'good';
      codeText?: string;
    }[] = [];
    const idle = result.gpus.filter((x) => x.memAlloc === 0 && x.coreAlloc === 0);
    if (idle.length) {
      const p = Math.round((idle.length / result.gpus.length) * 100);
      rows.push({
        title: `${idle.length} idle GPUs`,
        desc: 'Consolidate workloads or scale down.',
        level: p > 50 ? 'warn' : 'info',
        tagText: `${p}%`,
        tagTone: p > 50 ? 'warn' : 'info',
      });
    }
    const hi = result.gpus.filter((x) => x.memLimit > 0 && x.memAlloc / x.memLimit > 0.8);
    if (hi.length) {
      rows.push({
        title: `${hi.length} GPUs near capacity`,
        desc: 'OOM risk.',
        level: 'danger',
        tagText: '>80%',
        tagTone: 'danger',
      });
    }
    if (result.typeEntries.length > 1) {
      rows.push({
        title: `${result.typeEntries.length} GPU types`,
        desc: result.typeEntries.slice(0, 5).map(([t, c]) => `${c}× ${t}`).join(', '),
        level: 'info',
        tagText: 'heterogeneous',
        tagTone: 'info',
      });
    }
    const shared = result.gpus.filter((x) => x.shared > 0);
    if (shared.length) {
      rows.push({
        title: `${shared.length} GPUs sharing`,
        desc: 'HAMi active.',
        level: 'good',
        tagText: 'vGPU',
        tagTone: 'good',
      });
    }
    const clusterPct = result.totalMem > 0 ? result.usedMem / result.totalMem : 0;
    if (clusterPct > 0.7) {
      rows.push({
        title: `Cluster ${Math.round(clusterPct * 100)}%`,
        desc: 'Plan expansion.',
        level: 'danger',
        tagText: 'high',
        tagTone: 'danger',
      });
    }
    result.nodes
      .filter((n) => n.gpus.length > 2)
      .forEach((n) => {
        const half = Math.ceil(n.gpus.length / 2);
        const s0 = n.gpus.slice(0, half);
        const s1 = n.gpus.slice(half);
        const b0 = s0.filter((x) => x.memAlloc > 0).length;
        const b1 = s1.filter((x) => x.memAlloc > 0).length;
        if (b0 > 0 && b1 > 0 && (s0.length - b0 > 0 || s1.length - b1 > 0)) {
          rows.push({
            title: 'Cross-NUMA',
            codeText: n.name.split('-').slice(-2).join('-'),
            desc: `S0:${b0}/${s0.length} S1:${b1}/${s1.length}`,
            level: 'info',
          });
        }
      });
    const license = result.all.filter((m) => m.n === 'vGPULicenseRemains');
    if (license.length) {
      const days = Math.round(Math.min(...license.map((l) => l.v)) / 86400);
      rows.push({
        title: 'License',
        tagText: days < 30 ? `${days}d` : `${days}d+`,
        tagTone: days < 30 ? 'danger' : 'good',
        desc: days < 30 ? 'Renew.' : 'OK.',
        level: days < 30 ? 'danger' : 'good',
      });
    }
    return rows;
  }, [result]);

  const exportGpuCount = useMemo(() => {
    if (!result) return 0;
    return result.exportData.nodes.reduce(
      (sum, node) => sum + node['gpu-types'].reduce((s, t2) => s + t2['gpu-uuids'].length, 0),
      0,
    );
  }, [result]);

  const summaryCards = useMemo(() => {
    if (!result) return [];
    const memPct = result.totalMem > 0 ? Math.round((result.usedMem / result.totalMem) * 100) : 0;
    const typeHint = result.typeEntries
      .slice(0, 3)
      .map(([type]) => type.replace('NVIDIA ', '').split('-')[0])
      .join(', ');
    const activeGpuCount = result.gpus.filter((x) => x.pods.length > 0).length;

    return [
      { label: 'Nodes', value: `${result.nodes.length}`, sub: `${result.poolCount} pools`, color: '#4f8df7' },
      { label: 'GPUs', value: `${result.gpus.length}`, sub: `${result.typeEntries.length} types`, color: '#2dd4a8' },
      { label: 'GPU types', value: `${result.typeEntries.length}`, sub: typeHint || '-', color: '#f5b731' },
      { label: 'Memory', value: `${formatBytes(result.usedMem)}/${formatBytes(result.totalMem)}`, sub: `${memPct}% used`, color: memPct > 70 ? '#f06565' : memPct > 40 ? '#f5b731' : '#2dd4a8' },
      { label: 'Active pods', value: `${result.totalPods}`, sub: `on ${activeGpuCount} GPUs`, color: '#a78bfa' },
      { label: 'Idle GPUs', value: `${result.idleGpuCount}`, sub: 'no allocation', color: '#5a6f94' },
    ];
  }, [result]);

  const poolsUnitText = t('tools.hamiMetricsExplorerPage.poolsUnit');
  const nodesUnitText = t('tools.hamiMetricsExplorerPage.nodesUnit');

  return (
    <MainLayout>
      <div className="bg-[#f8fafc] py-12 text-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tools.hamiMetricsExplorer.title')}</h1>
              <p className="mt-1.5 text-sm text-gray-500">{t('tools.hamiMetricsExplorerPage.subtitle')}</p>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className={`rounded-xl border-2 border-dashed p-10 text-center transition ${dragging ? 'border-primary bg-primary-light' : 'border-gray-300 bg-white'}`}
            onClick={openFile}
            onKeyDown={(e) => e.key === 'Enter' && openFile()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void onLoadFile(file);
            }}
          >
            <p className="font-medium text-gray-900">{fileName || t('tools.hamiMetricsExplorerPage.uploadTitle')}</p>
            <p className="text-xs mt-1 text-gray-500">{t('tools.hamiMetricsExplorerPage.uploadDesc')}</p>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onLoadFile(file);
              }}
            />
          </div>

          {!result ? null : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {summaryCards.map((card) => (
                  <div key={card.label} className="rounded-[10px] border border-gray-200 bg-white px-4 py-3">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5a6f94]">{card.label}</div>
                    <div className="group relative">
                      <div
                        className="truncate font-mono text-[20px] leading-[1.15] font-bold"
                        title={card.value}
                        style={{ color: card.color }}
                      >
                        {card.value}
                      </div>
                      <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden max-w-[280px] rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-md group-hover:block">
                        {card.value}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-[#5a6f94]">{card.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {result.typeEntries.map(([type, count], i) => (
                  <span key={type} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
                    <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span className="font-semibold">{count}x</span> {type}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] bg-primary px-[18px] py-[9px] text-[0.78rem] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-dark hover:shadow-[0_4px_20px_rgba(15,208,93,0.2)]"
                  onClick={() => setShowExport(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[14px] w-[14px]">
                    <path d="M14 3v4a1 1 0 001 1h4" />
                    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                    <path d="M12 11v6m-3-3l3 3 3-3" />
                  </svg>
                  <span>{t('tools.hamiMetricsExplorerPage.exportButton')} ({exportGpuCount})</span>
                </button>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-[8px] border border-amber-500 bg-white px-[18px] py-[9px] text-[0.78rem] font-semibold text-amber-600 transition-all duration-200 hover:-translate-y-[1px] hover:bg-amber-50"
                  onClick={() => setShowMerge(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[14px] w-[14px]">
                    <path d="M19 13H5m0 0l7-7m-7 7l7 7" />
                  </svg>
                  <span>{t('tools.hamiMetricsExplorerPage.mergeButton')}</span>
                </button>
              </div>

              <section className="mb-6">
                <h2 className="mb-2.5 flex items-center gap-[7px] text-[0.9rem] font-bold tracking-[-0.01em] text-gray-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {t('tools.hamiMetricsExplorerPage.analysisTitle')}
                </h2>
                <div className="max-h-[600px] overflow-y-auto grid gap-2 pr-1">
                  {analysis.map((item, index) => (
                    <div
                      key={`${item.title}-${item.desc}-${index}`}
                      className="rounded-[10px] border border-gray-200 bg-white px-[14px] py-[10px] transition-colors duration-200 hover:border-gray-300"
                    >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${
                          item.level === 'danger'
                            ? 'bg-red-50 text-red-600'
                            : item.level === 'warn'
                              ? 'bg-amber-50 text-amber-600'
                              : item.level === 'good'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {item.level === 'danger' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        ) : item.level === 'warn' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        ) : item.level === 'good' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="mb-0.5 text-[0.78rem] font-semibold text-gray-900">
                          <span>{item.title}</span>
                          {item.codeText ? <code className="ml-1 rounded bg-gray-100 px-1 text-[0.64rem] text-gray-700">{item.codeText}</code> : null}
                          {item.tagText ? (
                            <span
                              className={`ml-1 align-middle rounded-[3px] px-[5px] py-[2px] text-[0.56rem] font-semibold ${
                                item.tagTone === 'danger'
                                  ? 'bg-red-100 text-red-700'
                                  : item.tagTone === 'warn'
                                    ? 'bg-amber-100 text-amber-700'
                                    : item.tagTone === 'good'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {item.tagText}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[0.7rem] leading-[1.5] text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                    <path d="M14 3v4a1 1 0 001 1h4" />
                    <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                  </svg>
                  <span>{t('tools.hamiMetricsExplorerPage.inventoryTitle')} ({result.gpus.length})</span>
                </h2>
                <div className="max-h-[320px] overflow-y-auto overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-700">
                      <tr>
                        <th className="sticky top-0 z-20 w-14 bg-gray-50 text-left p-2 font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">{t('tools.hamiMetricsExplorerPage.indexHeader')}</th>
                        <th className="sticky top-0 z-20 w-[170px] bg-gray-50 p-2 text-left font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">Node</th>
                        <th className="sticky top-0 z-20 w-[240px] bg-gray-50 p-2 text-left font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">Type</th>
                        <th className="sticky top-0 z-20 w-[280px] bg-gray-50 p-2 text-left font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">UUID</th>
                        <th className="sticky top-0 z-20 w-24 bg-gray-50 p-2 text-right font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">Mem</th>
                        <th className="sticky top-0 z-20 w-24 bg-gray-50 p-2 text-right font-semibold shadow-[inset_0_-1px_0_0_#e5e7eb]">Core</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.gpus.map((gpu, index) => {
                        const mp = gpu.memLimit > 0 ? Math.round((gpu.memAlloc / gpu.memLimit) * 100) : 0;
                        return (
                          <tr
                            key={`${gpu.uuid}-${index}`}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-primary-light`}
                          >
                            <td className="w-14 p-2 text-gray-400">{index + 1}</td>
                            <td className="w-[170px] p-2 font-mono text-xs text-gray-700">{gpu.node}</td>
                            <td className="w-[240px] p-2">
                              <span
                                className="inline-block max-w-[220px] truncate rounded px-1.5 py-0.5 text-[11px] font-semibold align-middle"
                                style={{
                                  backgroundColor: `${TYPE_COLORS[result.typeEntries.findIndex(([t]) => t === gpu.type) % TYPE_COLORS.length] ?? '#2dd4a8'}22`,
                                  color: TYPE_COLORS[result.typeEntries.findIndex(([t]) => t === gpu.type) % TYPE_COLORS.length] ?? '#2dd4a8',
                                }}
                                title={gpu.type}
                              >
                                {gpu.type}
                              </span>
                            </td>
                            <td className="w-[280px] p-2 font-mono text-xs text-gray-500">{gpu.uuid}</td>
                            <td className="w-24 whitespace-nowrap p-2 text-right tabular-nums">{mp}%</td>
                            <td className="w-24 whitespace-nowrap p-2 text-right tabular-nums">{Math.round(gpu.coreAlloc)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <span>
                    {t('tools.hamiMetricsExplorerPage.nodesTitle')} ({result.poolCount} {poolsUnitText} · {result.nodes.length} {nodesUnitText})
                  </span>
                </h2>
                <div className="max-h-[650px] space-y-2 overflow-y-auto pr-1">
                  {Object.entries(result.poolMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([pool, nodes], poolIndex) => {
                    const poolGpuCount = nodes.reduce((sum, node) => sum + node.gpus.length, 0);
                    const firstType = nodes.flatMap((node) => node.gpus.map((gpu) => gpu.type)).find(Boolean) || '?';
                    const typeColor = TYPE_COLORS[poolIndex % TYPE_COLORS.length] ?? '#2dd4a8';
                    return (
                      <div key={pool} className="rounded-[10px]">
                        <details open className="group rounded-[10px]">
                          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-t-[10px] border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open:rotate-0 group-not-open:-rotate-90">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                            <span className="flex-1 text-[0.82rem] font-semibold text-gray-900">{pool}</span>
                            <span className="rounded-full bg-primary-light px-2 py-0.5 text-[0.65rem] font-semibold text-primary">{nodes.length} {nodesUnitText}</span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.65rem] font-semibold text-gray-600">{poolGpuCount} GPUs</span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold"
                              style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
                            >
                              {firstType}
                            </span>
                          </summary>
                          <div className="space-y-1 rounded-b-[10px] border border-t-0 border-gray-200 bg-gray-50 p-2">
                            {nodes.map((node) => {
                              const activeCount = node.gpus.filter((gpu) => gpu.memAlloc > 0 || gpu.coreAlloc > 0).length;
                              const nodeDotClass = activeCount === 0 ? 'bg-gray-400' : activeCount < node.gpus.length ? 'bg-amber-500' : 'bg-primary';
                              const hasNuma = node.gpus.length > 2;
                              const splitAt = Math.ceil(node.gpus.length / 2);
                              const renderGpuCard = (gpu: GpuState) => {
                                const mp = gpu.memLimit > 0 ? (gpu.memAlloc / gpu.memLimit) * 100 : 0;
                                const cp = gpu.coreLimit > 0 ? (gpu.coreAlloc / gpu.coreLimit) * 100 : gpu.coreAlloc;
                                const memPercent = Math.round(mp);
                                const corePercent = Math.round(cp);
                                const levelColor = memPercent > 80 ? '#ef4444' : memPercent > 50 ? '#f59e0b' : memPercent > 0 ? '#0FD05D' : '#d1d5db';
                                const memBarClass = memPercent > 80 ? 'bg-red-500' : memPercent > 50 ? 'bg-amber-500' : memPercent > 0 ? 'bg-primary' : 'bg-gray-300';
                                const coreBarClass = corePercent > 80 ? 'bg-red-500' : corePercent > 50 ? 'bg-amber-500' : corePercent > 0 ? 'bg-primary' : 'bg-gray-300';
                                return (
                                  <div key={gpu.uuid} className="relative overflow-visible rounded-lg border border-gray-200 border-l-[3px] bg-white p-2" style={{ borderLeftColor: levelColor }}>
                                    <div className="mb-1 flex items-center gap-1.5">
                                      <div className="group/tt relative min-w-0 flex-1">
                                        <div className="truncate text-[0.72rem] font-semibold text-gray-900">{gpu.type}</div>
                                        <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-1 hidden max-w-[260px] rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 shadow-md group-hover/tt:block">
                                          {gpu.type}
                                        </div>
                                      </div>
                                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.62rem] text-gray-500">#{gpu.idx}</span>
                                    </div>
                                    <div className="group/tt relative mb-1">
                                      <div className="truncate font-mono text-[0.58rem] text-gray-500">{gpu.uuid.slice(4, 24)}...</div>
                                      <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-1 hidden max-w-[320px] rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-[11px] text-gray-700 shadow-md group-hover/tt:block">
                                        {gpu.uuid}
                                      </div>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1.5">
                                      <span className="w-7 shrink-0 text-[0.58rem] font-medium text-gray-500">{t('tools.hamiMetricsExplorerPage.memShort')}</span>
                                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-gray-100">
                                        <div className={`h-full rounded ${memBarClass}`} style={{ width: `${Math.min(memPercent, 100)}%` }} />
                                      </div>
                                      <span className="w-9 shrink-0 text-right font-mono text-[0.58rem] text-gray-600">{memPercent}%</span>
                                    </div>
                                    <div className="mb-1 flex items-center gap-1.5">
                                      <span className="w-7 shrink-0 text-[0.58rem] font-medium text-gray-500">{t('tools.hamiMetricsExplorerPage.coreShort')}</span>
                                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-gray-100">
                                        <div className={`h-full rounded ${coreBarClass}`} style={{ width: `${Math.min(corePercent, 100)}%` }} />
                                      </div>
                                      <span className="w-9 shrink-0 text-right font-mono text-[0.58rem] text-gray-600">{corePercent}%</span>
                                    </div>
                                    {gpu.pods.length ? (
                                      <div className="mt-1 border-t border-gray-200 pt-1">
                                        {gpu.pods.map((pod) => (
                                          <div key={`${gpu.uuid}-${pod.ns}-${pod.name}`} className="flex items-center gap-1 text-[0.6rem]">
                                            <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
                                            <span className="group/tt relative min-w-0 flex-1">
                                              <span className="block truncate font-mono text-gray-600">{pod.name}</span>
                                              <span className="pointer-events-none absolute bottom-full left-0 z-40 mb-1 hidden max-w-[260px] rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-[11px] text-gray-700 shadow-md group-hover/tt:block">
                                                {pod.name}
                                              </span>
                                            </span>
                                            <span className="shrink-0 rounded bg-gray-100 px-1 text-[0.56rem] text-gray-500">{pod.ns}</span>
                                            <span className="shrink-0 font-mono text-[0.56rem] text-gray-500">{Math.round(pod.cores)}%/{formatBytes(pod.mem)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-[0.6rem] italic text-gray-400">{t('tools.hamiMetricsExplorerPage.idle')}</div>
                                    )}
                                  </div>
                                );
                              };
                              return (
                                <details key={node.name} className="group/node overflow-visible rounded-[10px] border border-gray-200 bg-white">
                                  <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${nodeDotClass}`} />
                                    <span className="flex-1 truncate font-mono text-[0.72rem] text-gray-700" title={node.name}>{node.name}</span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.62rem] font-semibold text-gray-600">{node.gpus.length}G</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${activeCount > 0 ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                      {activeCount} {t('tools.hamiMetricsExplorerPage.activeShort')}
                                    </span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open/node:rotate-0 group-not-open/node:-rotate-90">
                                      <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                  </summary>
                                  <div className="space-y-2 border-t border-gray-200 p-2">
                                    {hasNuma ? (
                                      <>
                                        <div className="flex items-center gap-2 px-1">
                                          <div className="h-px flex-1 bg-gray-200" />
                                          <span className="text-[0.58rem] font-semibold text-gray-400">NUMA 0</span>
                                          <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                          {node.gpus.slice(0, splitAt).map(renderGpuCard)}
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                          <div className="h-px flex-1 bg-gray-200" />
                                          <span className="font-mono text-[0.58rem] text-amber-500">QPI/UPI</span>
                                          <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                        <div className="flex items-center gap-2 px-1">
                                          <div className="h-px flex-1 bg-gray-200" />
                                          <span className="text-[0.58rem] font-semibold text-gray-400">NUMA 1</span>
                                          <div className="h-px flex-1 bg-gray-200" />
                                        </div>
                                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                          {node.gpus.slice(splitAt).map(renderGpuCard)}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                        {node.gpus.map(renderGpuCard)}
                                      </div>
                                    )}
                                  </div>
                                </details>
                              );
                            })}
                          </div>
                        </details>
                      </div>
                    );
                    })}
                </div>
              </section>

              {Object.keys(result.quotas).length > 0 ? (
                <section className="space-y-2">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-primary">
                      <path d="M12 2v20M2 12h20M7 7l5 5M7 17l5-5" />
                    </svg>
                    <span>{t('tools.hamiMetricsExplorerPage.quotaTitle')}</span>
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2">
                    {Object.entries(result.quotas).map(([ns, items]) => (
                      <div key={ns} className="rounded-[10px] border border-gray-200 bg-white px-[10px] py-2">
                        <div className="mb-1 font-mono text-[0.72rem] font-semibold text-gray-900">{ns}</div>
                        {items.map((item) => (
                          <div key={`${ns}-${item.n}`} className="flex items-center justify-between py-[2px] text-[0.66rem] text-gray-500">
                            <span>{item.n}</span>
                            <span className="font-mono text-gray-600">{item.u}/{item.l || '∞'}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {result.buildInfo ? (
                <section className="text-xs text-gray-500 flex flex-wrap gap-3">
                  <span>{t('tools.hamiMetricsExplorerPage.buildInfoLabel')}:</span>
                  <span className="font-mono">HAMi {result.buildInfo.version}</span>
                  <span className="font-mono">{result.buildInfo.build_date}</span>
                  <span className="font-mono">{result.buildInfo.go_version}</span>
                  <span className="font-mono">{result.buildInfo.platform}</span>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>

      {showExport && result ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setShowExport(false)}>
          <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-xl border border-gray-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">{t('tools.hamiMetricsExplorerPage.exportTitle')}</h3>
              <button type="button" className="cursor-pointer" onClick={() => setShowExport(false)}>x</button>
            </div>
            <pre className="p-4 overflow-auto text-xs flex-1">{JSON.stringify(result.exportData, null, 2)}</pre>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm text-white"
                onClick={async () => {
                  await navigator.clipboard.writeText(JSON.stringify(result.exportData, null, 2));
                  setCopyOk(true);
                  setTimeout(() => setCopyOk(false), 2000);
                }}
              >
                {t('tools.hamiMetricsExplorerPage.copyButton')}
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                onClick={() => download('gpu_inventory.json', JSON.stringify(result.exportData, null, 2), 'application/json')}
              >
                {t('tools.hamiMetricsExplorerPage.downloadButton')}
              </button>
              {copyOk ? <span className="text-sm text-primary self-center">{t('tools.hamiMetricsExplorerPage.copied')}</span> : null}
            </div>
          </div>
        </div>
      ) : null}

      {showMerge ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" onClick={() => setShowMerge(false)}>
          <div className="w-full max-w-4xl max-h-[88vh] bg-white rounded-xl border border-gray-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">{mergeOutput ? t('tools.hamiMetricsExplorerPage.mergeResultTitle') : t('tools.hamiMetricsExplorerPage.mergeTitle')}</h3>
              <button type="button" className="cursor-pointer" onClick={() => setShowMerge(false)}>x</button>
            </div>
            <div className="p-4 overflow-auto flex-1 space-y-3">
              {!mergeOutput ? (
                <>
                  <textarea
                    value={mergeInput}
                    onChange={(e) => setMergeInput(e.target.value)}
                    className="w-full min-h-[200px] rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs text-gray-900"
                    placeholder='{ "kube-system-uuid": "...", "nodes": [] }'
                  />
                  <div className="text-center">
                    <input
                      ref={mergeFileRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setMergeInput(await file.text());
                      }}
                    />
                    <button type="button" className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700" onClick={() => mergeFileRef.current?.click()}>
                      {t('tools.hamiMetricsExplorerPage.chooseJsonFile')}
                    </button>
                  </div>
                  {mergeError ? <div className="text-sm text-red-500">{mergeError}</div> : null}
                  <button type="button" className="cursor-pointer w-full rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white" onClick={onMerge}>
                    {t('tools.hamiMetricsExplorerPage.runMerge')}
                  </button>
                </>
              ) : (
                <pre className="text-xs font-mono whitespace-pre-wrap">{mergeOutput}</pre>
              )}
            </div>
            {mergeOutput ? (
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                  onClick={() => {
                    setMergeOutput('');
                    setMergeStats(null);
                  }}
                >
                  {t('tools.hamiMetricsExplorerPage.backButton')}
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm text-white"
                  onClick={async () => {
                    await navigator.clipboard.writeText(mergeOutput);
                    setCopyMergeOk(true);
                    setTimeout(() => setCopyMergeOk(false), 2000);
                  }}
                >
                  {t('tools.hamiMetricsExplorerPage.copyButton')}
                </button>
                <button type="button" className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700" onClick={() => download('merged_inventory.json', mergeOutput, 'application/json')}>
                  {t('tools.hamiMetricsExplorerPage.downloadButton')}
                </button>
                {copyMergeOk ? <span className="text-sm text-primary self-center">{t('tools.hamiMetricsExplorerPage.copied')}</span> : null}
              </div>
            ) : null}
            {mergeOutput && mergeStats ? (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="rounded border border-gray-200 p-2 bg-gray-50">Current: <span className="font-mono text-gray-900">{mergeStats.currTotal}</span></div>
                <div className="rounded border border-gray-200 p-2 bg-gray-50">Old: <span className="font-mono text-gray-900">{mergeStats.oldTotal}</span></div>
                <div className="rounded border border-gray-200 p-2 bg-gray-50">Duplicates removed: <span className="font-mono text-gray-900">{mergeStats.duplicateCount}</span></div>
                <div className="rounded border border-gray-200 p-2 bg-gray-50">Merged total: <span className="font-mono text-gray-900">{mergeStats.finalTotal}</span></div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </MainLayout>
  );
}
