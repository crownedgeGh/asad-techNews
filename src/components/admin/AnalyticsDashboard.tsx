import { useEffect, useMemo, useState } from 'react';

interface DailyPoint { date: string; count: number }
interface TopArticle { title: string; slug: string; views: number }
interface DeviceRow { device: string; count: number }
interface ReferrerRow { source: string; count: number }

interface AnalyticsResponse {
  range: string;
  daily: DailyPoint[];
  topArticles: TopArticle[];
  deviceBreakdown: DeviceRow[];
  topReferrers: ReferrerRow[];
  totalPageviews: number;
  site: { totalArticles: number; totalViews: number; totalLikes: number; totalComments: number };
}

const RANGES: { key: string; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
];

// Validated categorical palette (see dataviz skill) — fixed order, never cycled.
const CATEGORICAL = {
  light: ['#2a78d6', '#eb6834', '#1baf7a'],
  dark: ['#3987e5', '#d95926', '#199e70'],
};
const SEQUENTIAL = { light: '#256abf', dark: '#3987e5' };

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  unknown: 'Unknown',
};

function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function niceCeil(value: number): number {
  if (value <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function StatTile({ label, value, desc }: { label: string; value: string | number; desc: string }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm p-5 flex flex-col gap-2">
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="text-3xl font-bold text-base-content">{value}</div>
      <div className="text-xs text-base-content/60">{desc}</div>
    </div>
  );
}

function TrendChart({ data }: { data: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 700;
  const H = 220;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = niceCeil(Math.max(...data.map((d) => d.count), 1));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const xAt = (i: number) => padL + i * stepX;
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.count)}`).join(' ');
  const areaPath = `${linePath} L ${xAt(data.length - 1)} ${padT + innerH} L ${xAt(0)} ${padT + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const active = hover !== null ? data[hover] : null;

  // Show ~6 x-axis ticks regardless of range length.
  const tickEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="lumen-viz relative">
      <style>{`
        .lumen-viz { --series-1: ${SEQUENTIAL.light}; --grid: color-mix(in oklab, currentColor 12%, transparent); --muted: color-mix(in oklab, currentColor 45%, transparent); }
        [data-theme="dark"] .lumen-viz { --series-1: ${SEQUENTIAL.dark}; }
      `}</style>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round((x - padL) / (stepX || 1));
          setHover(Math.min(Math.max(i, 0), data.length - 1));
        }}
      >
        {gridLines.map((g) => (
          <line
            key={g}
            x1={padL}
            x2={W - padR}
            y1={padT + innerH * (1 - g)}
            y2={padT + innerH * (1 - g)}
            stroke="var(--grid)"
            strokeWidth={1}
          />
        ))}
        {gridLines.map((g) => (
          <text key={g} x={padL - 8} y={padT + innerH * (1 - g) + 4} textAnchor="end" fontSize={10} fill="var(--muted)">
            {Math.round(max * g).toLocaleString()}
          </text>
        ))}
        {data.map((d, i) =>
          i % tickEvery === 0 ? (
            <text key={d.date} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
              {formatDateShort(d.date)}
            </text>
          ) : null
        )}
        <path d={areaPath} fill="var(--series-1)" opacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {active && (
          <>
            <line x1={xAt(hover!)} x2={xAt(hover!)} y1={padT} y2={padT + innerH} stroke="var(--grid)" strokeWidth={1} />
            <circle cx={xAt(hover!)} cy={yAt(active.count)} r={4} fill="var(--series-1)" stroke="var(--surface, white)" strokeWidth={2} />
          </>
        )}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 shadow-md text-xs"
          style={{ left: `clamp(0%, ${(xAt(hover!) / W) * 100}%, calc(100% - 120px))` }}
        >
          <div className="font-semibold text-base-content">{active.count.toLocaleString()} views</div>
          <div className="text-base-content/60">{formatDateShort(active.date)}</div>
        </div>
      )}
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-base-content/60 hover:text-base-content">View as table</summary>
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-base-300">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-base-200">
              <tr>
                <th className="px-3 py-1.5 font-medium">Date</th>
                <th className="px-3 py-1.5 font-medium">Pageviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {data.map((d) => (
                <tr key={d.date}>
                  <td className="px-3 py-1.5 tabular-nums">{d.date}</td>
                  <td className="px-3 py-1.5 tabular-nums">{d.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function TopArticlesBars({ items }: { items: TopArticle[] }) {
  const max = niceCeil(Math.max(...items.map((i) => i.views), 1));
  return (
    <div className="lumen-viz space-y-3">
      <style>{`.lumen-viz { --series-1: ${SEQUENTIAL.light}; } [data-theme="dark"] .lumen-viz { --series-1: ${SEQUENTIAL.dark}; }`}</style>
      {items.length === 0 && <p className="text-sm text-base-content/60">No article views in this range yet.</p>}
      {items.map((item) => (
        <div key={item.slug} className="group">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="truncate max-w-[70%] text-base-content" title={item.title}>{item.title}</span>
            <span className="tabular-nums text-base-content/60">{item.views.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-base-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all group-hover:opacity-80"
              style={{ width: `${Math.max((item.views / max) * 100, 3)}%`, background: 'var(--series-1)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceBars({ items }: { items: DeviceRow[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0) || 1;
  const order = ['mobile', 'tablet', 'desktop', 'unknown'];
  const sorted = [...items].sort((a, b) => order.indexOf(a.device) - order.indexOf(b.device));
  return (
    <div className="space-y-3">
      {sorted.length === 0 && <p className="text-sm text-base-content/60">No pageviews in this range yet.</p>}
      {sorted.map((row, i) => (
        <div key={row.device} className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ background: CATEGORICAL.light[i % CATEGORICAL.light.length] }}
          />
          <span className="text-sm text-base-content w-16 shrink-0">{DEVICE_LABELS[row.device] ?? row.device}</span>
          <div className="h-2.5 flex-1 rounded-full bg-base-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.count / total) * 100}%`,
                background: CATEGORICAL.light[i % CATEGORICAL.light.length],
              }}
            />
          </div>
          <span className="text-xs tabular-nums text-base-content/60 w-14 text-right shrink-0">
            {Math.round((row.count / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener('admin:refresh', handler);
    return () => window.removeEventListener('admin:refresh', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, refreshKey]);

  const totals = useMemo(
    () => [
      { label: 'Pageviews', value: (data?.totalPageviews ?? 0).toLocaleString(), desc: RANGES.find((r) => r.key === range)?.label ?? '' },
      { label: 'Total Article Views', value: (data?.site.totalViews ?? 0).toLocaleString(), desc: 'All-time' },
      { label: 'Total Likes', value: (data?.site.totalLikes ?? 0).toLocaleString(), desc: 'All-time' },
      { label: 'Total Comments', value: (data?.site.totalComments ?? 0).toLocaleString(), desc: 'All-time' },
    ],
    [data, range]
  );

  return (
    <div className="space-y-6">
      {/* Filter row */}
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              range === r.key
                ? 'bg-primary text-primary-content border-primary'
                : 'bg-base-100 border-base-300 text-base-content hover:bg-base-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-base-content">
          Couldn't load analytics. Make sure <code className="text-xs">DATABASE_URL</code> is set and the latest migration has run.
        </div>
      )}

      <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {totals.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>

        <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm p-6">
          <h2 className="font-semibold text-base-content mb-4">Pageviews trend</h2>
          <TrendChart data={data?.daily ?? []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm p-6">
            <h2 className="font-semibold text-base-content mb-4">Top articles</h2>
            <TopArticlesBars items={data?.topArticles ?? []} />
          </div>

          <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm p-6">
            <h2 className="font-semibold text-base-content mb-4">Devices</h2>
            <DeviceBars items={data?.deviceBreakdown ?? []} />
          </div>
        </div>

        <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-base-300">
            <h2 className="font-semibold text-base-content">Top referrers</h2>
          </div>
          <div className="divide-y divide-base-300">
            {(data?.topReferrers ?? []).length === 0 ? (
              <p className="text-center py-8 text-base-content/60 text-sm">No referrer data yet.</p>
            ) : (
              data!.topReferrers.map((r) => (
                <div key={r.source} className="flex items-center justify-between px-6 py-3">
                  <span className="text-sm text-base-content">{r.source}</span>
                  <span className="text-sm tabular-nums text-base-content/60">{r.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
