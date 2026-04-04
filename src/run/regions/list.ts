import { gcloud } from '#shell';
import { isEnabled } from '../enable.js';
import { Region } from './Region.js';

export type Options = {
  /**
   * Apply a Boolean filter `EXPRESSION` to each resource item to be listed. If
   * the expression evaluates True, then that item is listed. For more details
   * and examples of filter expressions, run $ [gcloud topic
   * filters](https://cloud.google.com/sdk/gcloud/reference/topic/filters). This
   * flag interacts with other flags that are applied in this order:
   * `--flatten`, `--sort-by`, `--filter`, `--limit`.
   */
  filter?: string;
  /**
   * Maximum number of resources to list. The default is unlimited. This flag
   * interacts with other flags that are applied in this order: `--flatten`,
   * `--sort-by`, `--filter`, `--limit`.
   */
  limit?: number | 'unlimited';
  /**
   * Some services group resource list output into pages. This flag specifies
   * the maximum number of resources per page. The default is determined by the
   * service if it supports paging, otherwise it is unlimited (no paging).
   * Paging may be applied before or after `--filter` and `--limit` depending on
   * the service.
   */
  pageSize?: number | 'unlimited';
  /**
   * Comma-separated list of resource field key names to sort by. The default
   * order is ascending. Prefix a field with `~´ for descending order on that
   * field. This flag interacts with other flags that are applied in this order:
   * `--flatten`, `--sort-by`, `--filter`, `--limit`.
   */
  sortBy?: string[];
  /**
   * Print a list of resource URIs instead of the default output, and change the
   * command output to a list of URIs. If this flag is used with `--format`, the
   * formatting is applied on this URI list. To display URIs alongside other
   * keys instead, use the `uri()` transform.
   */
  uri?: boolean;
};

/** List available Cloud Run (fully managed) regions. */
export async function list({
  filter,
  limit,
  pageSize,
  sortBy,
  uri
}: Options = {}): Promise<Region[]> {
  await isEnabled();
  if (typeof limit === 'number' && limit < 1) {
    limit = 'unlimited';
  }
  if (typeof pageSize === 'number' && pageSize < 1) {
    pageSize = 'unlimited';
  }
  return await gcloud(
    `run regions list${filter ? `--filter="${filter}"` : ''}${
      limit ? ` --limit=${limit}` : ''
    }${pageSize ? `--page-size=${pageSize}` : ''}${
      sortBy ? ` --sort-by="${sortBy.join(',')}"` : ''
    }${uri ? ` --uri` : ''}`
  );
}
