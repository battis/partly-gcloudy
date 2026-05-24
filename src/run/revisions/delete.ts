import { Flags, gcloud } from '#shell';
import * as regions from '../regions/index.js';
import { select } from './select.js';

type Options = {
  /**
   * ID of the revision or fully qualified identifier for the revision. To set
   * the revision attribute:
   *
   * - Provide the argument REVISION on the command line.
   *
   * This positional argument must be specified if any of the other arguments in
   * this group are specified.
   */
  revision?: string;

  /**
   * Specific to Cloud Run for Anthos: Kubernetes namespace for the revision. To
   * set the namespace attribute:
   *
   * - Provide the argument REVISION on the command line with a fully specified
   *   name;
   * - Provide the argument --namespace on the command line;
   * - Set the property run/namespace;
   * - For Cloud Run on Kubernetes Engine, defaults to "default". Otherwise,
   *   defaults to project ID.;
   * - Provide the argument project on the command line;
   * - Set the property core/project.
   */
  namespace?: string;

  /**
   * Return immediately, without waiting for the operation in progress to
   * complete. Defaults to --no-async. Use --async to enable and --no-async to
   * disable.
   */
  async?: true;

  /**
   * Region in which the resource can be found. Alternatively, set the property
   * [run/region].
   */
  region?: string;
};

export async function delete_({ revision, region, ...options }: Options = {}) {
  region = region || (await regions.select({ region }));
  revision = revision || (await select({ revision, region }));

  const flags: Flags = { region, ...options };
  return await gcloud(`run revisions delete ${revision}`, { flags });
}
