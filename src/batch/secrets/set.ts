import * as secrets from '../../secrets/index.js';

type Options = { retainVersions: number } & Parameters<typeof secrets.set>[0];

export async function set({
  retainVersions = 1,
  ...secretsSetParams
}: Options) {
  const secret = await secrets.set({ ...secretsSetParams });
  const v = (await secrets.versions.list({ secret: secret.name }))
    .filter((secret) => secret.state != 'DESTROYED')
    .sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    );
  while (v.length > retainVersions) {
    const s = v.shift();
    if (s) {
      await secrets.versions.destroy({
        secret: secret.name,
        version: s.name
      });
    }
  }
}
