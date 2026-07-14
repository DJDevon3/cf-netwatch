#!/usr/bin/env bash
# Shared configuration for network monitor scripts
# Source this file from ping-monitor.sh and speedtest-monitor.sh

# Cloudflare Worker endpoint (set this to your deployed worker URL)
WORKER_URL="${WORKER_URL:-https://cf-netwatch.yourdomain.com}"

# Shared secret for authentication (set this, keep it private)
SHARED_SECRET="${SHARED_SECRET:-your-secret-here}"

if [[ -z "${SHARED_SECRET:-}" ]]; then
    echo "ERROR: SHARED_SECRET must be set in config.sh or environment" >&2
    exit 1
fi


# API paths
PING_ENDPOINT="/api/ping"
SPEEDTEST_ENDPOINT="/api/speedtest"

# Number of ping packets per target
PING_COUNT="${PING_COUNT:-10}"

# Timeout in seconds for curl requests
CURL_TIMEOUT="${CURL_TIMEOUT:-15}"

# Fallback DNS for worker uploads when system DNS fails (curl rc=6).
# Comma-separated; first entry is used with nslookup/dig + curl --resolve.
# Set empty to disable retry.
# Derived from targets.json (see below).

# Resolve a hostname via a specific DNS server (IPv4 only).
resolve_host_via_dns() {
    local host="$1"
    local server="${2:-1.1.1.1}"
    if command -v nslookup >/dev/null 2>&1; then
        nslookup "$host" "$server" 2>/dev/null | awk '/^Address [0-9]/ { print $2; exit }'
        return
    fi
    if command -v dig >/dev/null 2>&1; then
        dig +short "$host" "@$server" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -1
    fi
}

# DNS Servers are now configured in targets.json
# They are separate and not to be confused with ping targets.
# shared with the Cloudflare Worker's config.js
TARGETS_JSON="$(dirname "$0")/cf-worker/src/targets.json"

if [[ ! -f "$TARGETS_JSON" ]]; then
    echo "ERROR: targets.json not found at $TARGETS_JSON" >&2
    exit 1
fi

if command -v jq >/dev/null 2>&1; then
    # DNS servers (comma-separated)
    CURL_DNS_SERVERS="${CURL_DNS_SERVERS:-$(jq -r '[.dnsServers[].host] | join(",")' "$TARGETS_JSON")}"
    # Ping targets
    PING_TARGETS=()
    while IFS= read -r host; do
        [[ -n "$host" ]] && PING_TARGETS+=("$host")
    done < <(jq -r '.pingTargetSets[].targets[].host' "$TARGETS_JSON")
else
    # Fallback without jq: extract with grep/sed
    # DNS servers: extract from dnsServers section only
    CURL_DNS_SERVERS="${CURL_DNS_SERVERS:-$(sed -n '/"dnsServers"/,/"pingTargetSets"/p' "$TARGETS_JSON" | grep '"host"' | sed 's/.*"host": *"//;s/".*//' | paste -sd,)}"
    # Ping targets: extract from pingTargetSets section only
    PING_TARGETS=()
    while IFS= read -r host; do
        [[ -n "$host" ]] && PING_TARGETS+=("$host")
    done < <(sed -n '/"pingTargetSets"/,$p' "$TARGETS_JSON" | grep '"host"' | sed 's/.*"host": *"//;s/".*//')
fi
