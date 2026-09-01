import subprocess, re, collections

# 从 journald 提取最近 7 天 ssh 失败记录
try:
    raw = subprocess.run(
        ["journalctl", "-u", "ssh", "--since", "7 days ago", "--no-pager", "-o", "cat"],
        capture_output=True, text=True, timeout=120
    ).stdout
except Exception as e:
    raw = ""
    print("journalctl err:", e)

lines = raw.splitlines()
fails = [l for l in lines if "Failed password" in l or "Invalid user" in l]
print("总失败尝试数（journald 7天）:", len(fails))

# 按 IP 聚合
ips = collections.Counter()
users = collections.Counter()
days = collections.Counter()
for l in fails:
    m = re.search(r"from (\d+\.\d+\.\d+\.\d+)", l)
    if m:
        ips[m.group(1)] += 1
    m2 = re.search(r"invalid user (\S+)|Failed password for (\S+)", l)
    if m2:
        users[(m2.group(1) or m2.group(2))] += 1
    m3 = re.search(r"^(\S+ \d+)", l)
    if m3:
        days[m3.group(1)] += 1

print("\n== 失败来源 IP TOP15 ==")
for ip, n in ips.most_common(15):
    print(f"{n:>6}  {ip}")
print("\n== 目标用户名 TOP10 ==")
for u, n in users.most_common(10):
    print(f"{n:>6}  {u}")
print("\n== 按天分布 ==")
for d in sorted(days):
    print(f"{d:>8}  {days[d]}")
