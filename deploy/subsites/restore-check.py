import sqlite3, os, glob
D = sorted(glob.glob('/opt/backups/20*'))[-1]
print("验证快照:", D)
for f in sorted(glob.glob(D + '/db/*.db')) + sorted(glob.glob(D + '/db/*.sqlite*')):
    try:
        c = sqlite3.connect(f)
        tables = c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        print("OK", os.path.basename(f), "| 表数:", len(tables))
        c.close()
    except Exception as e:
        print("FAIL", os.path.basename(f), str(e)[:80])
pg = D + '/db/umami-pg.sql'
with open(pg) as fh:
    content = fh.read(2000)
    tail = fh.read()
print("pg_dump 头部含 CREATE:", "CREATE TABLE" in content or "CREATE TABLE" in tail)
