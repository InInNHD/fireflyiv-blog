interface StatusMonitor {
  id: number;
  name: string;
}

interface StatusHeartbeat {
  status: number;
  time?: string;
}

export interface ServiceStatus {
  up: number;
  total: number;
  down: string[];
  checkedAt?: string;
  monitors: Record<string, { status: "up" | "down" | "unknown"; checkedAt?: string }>;
}

export async function getServiceStatus(): Promise<ServiceStatus | null> {
  try {
    const [configResponse, heartbeatResponse] = await Promise.all([
      fetch("https://status.fireflyiv.com/api/status-page/firefly", {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      }),
      fetch("https://status.fireflyiv.com/api/status-page/heartbeat/firefly", {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      }),
    ]);
    if (!configResponse.ok || !heartbeatResponse.ok) throw new Error("status api failed");
    const config = await configResponse.json();
    const heartbeat = await heartbeatResponse.json();
    const monitorList = (config.publicGroupList ?? []).flatMap(
      (group: { monitorList?: StatusMonitor[] }) => group.monitorList ?? [],
    ) as StatusMonitor[];
    const heartbeatList = (heartbeat.heartbeatList ?? {}) as Record<string, StatusHeartbeat[]>;
    const latest = monitorList.map((monitor) => ({
      monitor,
      heartbeat: heartbeatList[String(monitor.id)]?.at(-1),
    }));
    const monitors = Object.fromEntries(latest.map(({ monitor, heartbeat: item }) => [
      monitor.name,
      { status: item ? (item.status === 1 ? "up" : "down") : "unknown", checkedAt: item?.time },
    ])) as ServiceStatus["monitors"];
    const up = latest.filter(({ heartbeat: item }) => item?.status === 1).length;
    const down = latest.filter(({ heartbeat: item }) => item && item.status !== 1).map(({ monitor }) => monitor.name);
    const checkedAt = latest.map(({ heartbeat: item }) => item?.time).filter((time): time is string => Boolean(time)).sort().at(-1);
    return { up, total: monitorList.length, down, checkedAt, monitors };
  } catch {
    return null;
  }
}
