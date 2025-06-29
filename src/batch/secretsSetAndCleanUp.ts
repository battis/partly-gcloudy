import * as secrets from '../secrets/index.js';

export async function secretsSetAndCleanUp({
  retainVersions = 1,
  ...secretsSetParams
}: { retainVersions: number } & Parameters<typeof secrets.set>[0]) {
  const secret = await secrets.set({ ...secretsSetParams });
  const v = (await secrets.versions.list({ secret: secret.name }))
    .filter((secret) => secret.state != 'DESTROYED')
    .sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    );
  while (v.length > retainVersions) {
    const s = v.shift();
    s &&
      (await secrets.versions.destroy({
        secret: secret.name,
        version: s.name
      }));
  }
}
