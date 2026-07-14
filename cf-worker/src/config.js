/**
 * Dashboard configuration
 */

// Timezone for displaying results in dashboard.
// Does not affect how data is stored in Cloudflare Analytics Engine.
export const TIMEZONE = 'America/New_York';

// Time range options shown on the dashboard (value in hours).
// The entry marked default: true is selected on page load.
export const PING_RANGE_HOURS = [
  { hours: 1, label: 'Last hour' },
  { hours: 6, label: 'Last 6 hours' },
  { hours: 12, label: 'Last 12 hours' },
  { hours: 24, label: 'Last 24 hours', default: true },
  { hours: 72, label: 'Last 3 days' },
  { hours: 168, label: 'Last 7 days' },
  { hours: 336, label: 'Last 14 days' },
];

// Bucket options shown on the dashboard (value in minutes).
// The entry marked default: true is selected on page load.
export const PING_BUCKET_OPTIONS = [
  { minutes: 5, label: '5 minutes' },
  { minutes: 10, label: '10 minutes' },
  { minutes: 15, label: '15 minutes' },
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour', default: true },
  { minutes: 120, label: '2 hours' },
  { minutes: 240, label: '4 hours' },
  { minutes: 360, label: '6 hours' },
  { minutes: 720, label: '12 hours' },
];

// Allowed bucket sizes (in minutes) for the analytics API.
// Derived from PING_BUCKET_OPTIONS so the API and dashboard stay in sync.
export const PING_BUCKET_MINUTES = new Set(PING_BUCKET_OPTIONS.map(o => o.minutes));

// Hostname of the web server or router serving the worker.
// For Windows Ubuntu WSL this will be the PC name.
export const PING_SOURCE_HOSTNAME = 'GARAGE';

// Analytics Engine dataset name for ping data.
// Must match the `dataset` field in wrangler.toml under [[analytics_engine_datasets]].
// The `binding` name in wrangler.toml is separate and does not need to match.
export const PING_ANALYTICS_DATASET = 'netwatch_ping';

// Ping Targets config is now in a combined formatted JSON file
// This avoids redundent code having them in 2 different files.
// Ensure the path is correct for your install. 
import targetsConfig from './targets.json';
export const PING_TARGET_SETS = [
  ...targetsConfig.pingTargetSets,
  {
    grouplabel: 'DNS Servers',
    targets: targetsConfig.dnsServers,
  },
];



/*
PING_HIDDEN_TARGETS: targets that will not be published
in reporting API endpoint nor shown on the dashboard.

This is useful for:
- Internal hosts that you don't want to show publicly
- Hosts that you've stopped monitoring (to avoid showing partial data)

The format is a list of string literals.
Unsupported formats include: CIDR, ranges, netmasks, and glob patterns.
*/
export const PING_HIDDEN_TARGETS = [
  // Private IPv4 addresses
  '172.0.0.1',
  '192.168.1.1',

  // Loopback
  'localhost',

  // Local network hostnames (.local mDNS)
  'gateway.local',
  'router.local',

  // Home network domains (.home.arpa)
  'home.arpa',

  // Vendor-specific domains
  'pi.hole',
  'router.asus.com',
  'tplinkwifi.net',

  // Kubernetes
  'cluster.local'
];

/*
IP White List for incoming requests.
- Supports CIDR notation.
- Accepts a list of IPv4 or IPv6 addresses.
- Can be overridden by the IP_ALLOWLIST environment variable (comma-separated)
  in which case the value in this file is ignored.
- This has no effect on posting measurements to the API (which uses a shared secret).

// Example: allows all IPv4 and IPv6 addresses.
//export const IP_ALLOWLIST = ['0.0.0.0/0', '::/0'];

// Example: allow one IP. (You would use a public IP)
//export const IP_ALLOWLIST = ['192.168.1.100'];

// Example: allow two net ranges.
//export const IP_ALLOWLIST = ['192.0.2.0/24', '2001:db8::/32'];

// Example: restrict all (disable dashboard).
//export const IP_ALLOWLIST = [];

// Default: allow all (public viewing).
*/
export const IP_ALLOWLIST = ['0.0.0.0/0'];

// Show a small link to the project's source repository on the dashboard,
// so third-party viewers can find and deploy the software themselves.
export const SHOW_PROJECT_LINK = true;

// URL the link points to. Override only if you maintain a fork.
// Original author: https://github.com/az0/cf-netwatch MIT License
export const PROJECT_LINK_URL = 'https://github.com/DJDevon3/cf-netwatch';
export const PROJECT_LINK_TEXT = 'cf-netwatch';
