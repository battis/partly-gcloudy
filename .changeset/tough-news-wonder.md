---
'@battis/partly-gcloudy': minor
---

gcloud.secrets.versions

- Added `gcloud.secrets.versions` vocabulary (partial)
- Added `retain` parameter to `gcloud.secrets.set()` to determine how many secret versions should be retained after setting the new value (default is all, suggested value is 1)
