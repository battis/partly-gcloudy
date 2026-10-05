import * as secrets from '#secrets';

export async function set({ retainVersions = 1, ...options }: set.Options) {
  const secret = await secrets.set({ ...options });
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

export namespace set {
  export type Options = {
    retainVersions: number;
  } & secrets.set.Options;
}
