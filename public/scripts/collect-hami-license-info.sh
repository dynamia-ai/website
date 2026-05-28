#!/usr/bin/env bash
set -euo pipefail

# ─── Prerequisites ──────────────────────────────────────────────────────

if ! command -v kubectl &>/dev/null; then
    jq -n '{error:"kubectl not found in PATH",kube_system_uid:null,collection_time:null,total_licenses:0,licenses:[]}'
    exit 1
fi

if ! command -v jq &>/dev/null; then
    # Cannot use jq if jq is missing, output plain JSON
    echo '{"error":"jq not found in PATH","kube_system_uid":null,"collection_time":null,"total_licenses":0,"licenses":[]}'
    exit 1
fi

# Check connectivity
if ! kubectl cluster-info > /dev/null 2>&1; then
    jq -n '{error:"Cannot connect to Kubernetes cluster",kube_system_uid:null,collection_time:null,total_licenses:0,licenses:[]}'
    exit 1
fi

# ─── Collect kube-system namespace UID ──────────────────────────────────

if ! kubectl get namespace kube-system > /dev/null 2>&1; then
    jq -n '{error:"kube-system namespace not found",kube_system_uid:null,collection_time:null,total_licenses:0,licenses:[]}'
    exit 1
fi

KUBE_SYSTEM_UID=$(kubectl get namespace kube-system -o jsonpath='{.metadata.uid}' 2>/dev/null)
if [[ -z "$KUBE_SYSTEM_UID" ]]; then
    jq -n '{error:"Failed to get kube-system namespace UID",kube_system_uid:null,collection_time:null,total_licenses:0,licenses:[]}'
    exit 1
fi

COLLECTION_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ─── Find hami-scheduler namespace ──────────────────────────────────────

# Search for hami-scheduler deployment across all namespaces
HAMI_SCHEDULER_NS=$(kubectl get deployment --all-namespaces -o json 2>/dev/null | \
    jq -r '.items[] | select(.metadata.name == "hami-scheduler") | .metadata.namespace' | \
    head -n 1)

if [[ -z "$HAMI_SCHEDULER_NS" ]]; then
    # Fallback: search by label if name doesn't match
    HAMI_SCHEDULER_NS=$(kubectl get deployment --all-namespaces -l app=hami-scheduler -o jsonpath='{.items[0].metadata.namespace}' 2>/dev/null || true)
fi

if [[ -z "$HAMI_SCHEDULER_NS" ]]; then
    HAMI_SCHEDULER_NS="not_found"
fi

# ─── Collect nodes and build output ─────────────────────────────────────

NODES_JSON=$(kubectl get nodes -o json 2>/dev/null)
if [[ -z "$NODES_JSON" ]]; then
    jq -n \
        --arg uid "$KUBE_SYSTEM_UID" \
        --arg time "$COLLECTION_TIME" \
        '{error:"No nodes found in cluster",kube_system_uid:$uid,collection_time:$time,total_licenses:0,licenses:[]}'
    exit 0
fi

# Build output — flatten all licenses into a single 1-D array
echo "$NODES_JSON" | jq \
    --arg kube_system_uid "$KUBE_SYSTEM_UID" \
    --arg collection_time "$COLLECTION_TIME" \
    --arg hami_ns "$HAMI_SCHEDULER_NS" \
    '
    {
        kube_system_uid: $kube_system_uid,
        collection_time: $collection_time,
        hami_install_location_namespace: $hami_ns,
        total_licenses: 0,
        licenses: (
            .items
            | map(select(
                (.status.allocatable["nvidia.com/gpu"] // "0")
                | tonumber > 0
            ))
            | map(
                .metadata.name as $node_name
                | (.metadata.annotations["hami.io/nvidia-license"] // "null")
                | if . == "null" then
                    []
                  else
                    try fromjson catch []
                  end
                | map(. + {node_name: $node_name})
            )
            | flatten
        )
    }
    | .total_licenses = (.licenses | length)
'
