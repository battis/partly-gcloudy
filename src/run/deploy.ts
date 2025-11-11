import { EmailString, PathString, URLString } from '@battis/descriptive-types';
import { OneOf } from '@battis/typescript-tricks';
import { pascalCase } from 'change-case-all';
import * as shell from '../shell/index.js';

function concatenate(arg: string[], delimiter = ',') {
  return arg.join(delimiter);
}

function flatten(arg: Record<string, string>, delimiter = ',') {
  return Object.keys(arg)
    .map((key) => `${key}=${arg[key]}`)
    .join(delimiter);
}

function stringify(arg: string[], delimiter?: string): string;
function stringify(arg: Record<string, string>, delimiter?: string): string;
function stringify(
  arg: string[] | Record<string, string>,
  delimiter = ','
): string {
  if (Array.isArray(arg)) {
    return concatenate(arg, delimiter);
  }
  return flatten(arg, delimiter);
}

function getArg(name: string, options: Record<string, unknown>): unknown {
  return options[pascalCase(name)];
}

function option(
  name: string,
  options: Record<string, unknown>,
  delimiter = ','
): string {
  const arg = getArg(name, options);
  if (arg === undefined || arg === null) {
    return '';
  }
  let stringified: string;
  switch (typeof arg) {
    case 'boolean':
      if (arg === true) {
        stringified = `${name}`;
      } else {
        stringified = `no-${name}`;
      }
      break;
    case 'string':
      stringified = `${name}="${arg}"`;
      break;
    case 'number':
      stringified = `${name}=${arg}`;
      break;
    case 'object':
      // @ts-expect-error 2769: stringify() typing protects us
      stringified = `${name}="${stringify(arg, delimiter)}"`;
      break;
    default:
      throw Error();
  }
  return ` --${stringified}`;
}

function flag(name: string, options: Record<string, unknown>): string {
  const arg = getArg(name, options);
  if (arg === true) {
    return ` --${name}`;
  }
  return '';
}

type BaseOptions = {
  /** Specific to Cloud Run for Anthos: Kubernetes namespace for the service. */
  namespace?: string;
  /**
   * Whether to enable allowing unauthenticated access to the service. This may
   * take a few moments to take effect.
   */
  allowUnauthenticated?: boolean;
  /**
   * Return immediately, without waiting for the operation in progress to
   * complete.
   */
  async?: boolean;
  /**
   * Justification to bypass Binary Authorization policy constraints and allow
   * the operation. See
   * https://cloud.google.com/binary-authorization/docs/using-breakglass for
   * more information. Next update or deploy command will automatically clear
   * existing breakglass justification.
   */
  breakglass?: string;
  /** Remove the VPC connector for this resource. */
  clearVpcConnector?: boolean;
  /**
   * Set the maximum number of concurrent requests allowed per container
   * instance. Leave concurrency unspecified or provide the special value
   * 'default' to receive the server default value.
   */
  concurrency?: number;
  /**
   * Specifies a container by name. Flags following `--container` will apply to
   * the specified container. Flags that are not container-specific must be
   * specified before `--container`.
   */
  container?: string;
  /**
   * Whether to allocate extra CPU to containers on startup to reduce the
   * perceived latency of a cold start request. Enabled by default when
   * unspecified on new services.
   */
  cpuBoost?: boolean;
  /**
   * Whether to throttle the CPU when the container is not actively serving
   * requests.
   */
  cpuThrottling?: boolean;
  /**
   * Toggles the default url for a run service. This is enabled by default if
   * not specified.
   */
  defaultUrl?: boolean;
  /**
   * Schedules a single instance of the Revision and waits for it to pass its
   * startup probe for the deployment to succeed. If disabled, the startup probe
   * runs only when the revision is first started via invocation or by setting
   * min-instances. This check is enabled by default when unspecified.
   */
  deployHealthCheck?: boolean;
  /** Provides an optional, human-readable description of the service. */
  description?: string;
  /**
   * Selects the execution environment where the application will run.
   * `EXECUTION_ENVIRONMENT` must be one of:
   *
   * - `gen1` Run the application in a first generation execution environment.
   * - `gen2` Run the application in a second generation execution environment.
   */
  executionEnvironment?: 'gen1' | 'gen2';
  /** The GPU type to use. */
  gpuType?: string;
  /** Set GPU zonal redundancy. */
  gpuZonalRedundancy?: boolean;

  /**
   * Set the ingress traffic sources allowed to call the service. For Cloud Run
   * the `--[no-]allow-unauthenticated` flag separately controls the identities
   * allowed to call the service. `INGRESS` must be one of:
   *
   * - `all` Inbound requests from all sources are allowed.
   * - `internal` For Cloud Run, only inbound requests from VPC networks in the
   *   same project or VPC Service Controls perimeter, as well as Pub/Sub
   *   subscriptions and Eventarc events in the same project or VPC Service
   *   Controls perimeter are allowed. All other requests are rejected. See
   *   https://cloud.google.com/run/docs/securing/ingress for full details on
   *   the definition of internal traffic for Cloud Run.
   * - `internal-and-cloud-load-balancing` Only inbound requests from Google Cloud
   *   Load Balancing or a traffic source allowed by the internal option are
   *   allowed.
   */
  ingress?: 'all' | 'internal' | 'internal-and-cloud-load-balancing';
  /**
   * Optionally disable invoker IAM checks. This feature is available by
   * invitation only. More info at
   * https://cloud.google.com/run/docs/securing/managing-access#invoker_check
   */
  invokerIamCheck?: boolean;
  /**
   * The maximum number of container instances to run for this Service. This
   * instance limit will be divided among all Revisions receiving a percentage
   * of traffic and can be modified without deploying a new Revision.
   */
  max?: number;
  /**
   * The maximum number of container instances for this Revision to run or
   * `'default'` to remove. This setting is immutably set on each new Revision
   * and modifying its value will deploy another Revision.
   */
  maxInstances?: number | 'default';
  /**
   * The minimum number of container instances to run for this Service or
   * `'default'` to remove. These instances will be divided among all Revisions
   * receiving a percentage of traffic and can be modified without deploying a
   * new Revision.
   */
  min?: number | 'default';
  /**
   * The minimum number of container instances to run for this Revision or
   * `'default'` to remove. This setting is immutably set on each new Revision
   * and modifying its value will deploy a another Revision. Consider using
   * --min to set the minimum number of instances across all revisions of the
   * Service which may be modified dynamically.
   */
  minInstances?: number | 'default';
  /**
   * Region in which the resource can be found. Alternatively, set the property
   * [run/region].
   */
  region?: string;
  /**
   * Comma-separated list of regions in which the multi-region Service can be
   * found.
   */
  regions?: string[];
  /** List of containers to remove. */
  removeContainers?: string[];
  /**
   * Specify the suffix of the revision name. Revision names always start with
   * the service name automatically. For example, specifying
   * [--revision-suffix=v1] for a service named 'helloworld', would lead to a
   * revision named 'helloworld-v1'. Set empty string to clear the suffix and
   * resume server-assigned naming.
   */
  revisionSuffix?: string;
  /**
   * The scaling mode to use for this resource. Flag value could be either
   * "auto" for automatic scaling, or a positive integer to configure manual
   * scaling with the given integer as a fixed instance count.
   */
  scaling?: number | 'auto';
  /**
   * The email address of an IAM service account associated with the revision of
   * the service. The service account represents the identity of the running
   * revision, and determines what permissions the revision has.
   */
  serviceAccount?: EmailString;
  /** Whether to enable session affinity for connections to the service. */
  sessionAffinity?: boolean;
  /** Traffic tag to assign to the newly created revision. */
  trafficTag?: string;
  /**
   * Set the maximum request execution time (timeout). It is specified as a
   * duration; for example, "10m5s" is ten minutes, and five seconds. If you
   * don't specify a unit, seconds is assumed. For example, "10" is 10 seconds.
   */
  timeout?: string | number;
  /**
   * True to avoid sending traffic to the revision being deployed. Setting this
   * flag assigns any traffic assigned to the LATEST revision to the specific
   * revision bound to LATEST before the deployment. The effect is that the
   * revision being deployed will not receive traffic.
   *
   * After a deployment with this flag the LATEST revision will not receive
   * traffic on future deployments. To restore sending traffic to the LATEST
   * revision by default, run the [gcloud run services
   * update-traffic](https://cloud.google.com/sdk/gcloud/reference/run/services/update-traffic)
   * command with `--to-latest`.
   */
  noTraffic?: boolean;
  /** Set a VPC connector for this resource. */
  vpcConnector?: string;
  /**
   * Specify which of the outbound traffic to send through Direct VPC egress or
   * the VPC connector for this resource. This resource must have Direct VPC
   * egress enabled or a VPC connector to set this flag. VPC_EGRESS must be one
   * of:
   *
   * - `all` (DEPRECATED) Sends all outbound traffic through Direct VPC egress or
   *   the VPC connector. Provides the same functionality as 'all-traffic'.
   *   Prefer to use 'all-traffic' instead.
   * - `all-traffic` Sends all outbound traffic through Direct VPC egress or the
   *   VPC connector.
   * - `private-ranges-only` Default option. Sends outbound traffic to private IP
   *   addresses (RFC 1918 and Private Google Access IPs) through Direct VPC
   *   egress or the VPC connector. Traffic to other Cloud Run services might
   *   require additional configuration. See
   *   https://cloud.google.com/run/docs/securing/private-networking#send_requests_to_other_services_and_services
   *   for more information.
   */
  vpcEgress?: 'all' | 'all-traffic' | 'private-ranges-only';
};

/**
 * These flags modify the Cloud SQL instances this Service connects to. You can
 * specify a name of a Cloud SQL instance if it's in the same project and region
 * as your Cloud Run service; otherwise specify <project>:<region>:<instance>
 * for the instance.
 */
type CloudSql = OneOf<
  [
    {
      /** Append the given values to the current Cloud SQL instances. */
      addCloudSqlInstances?: string[];
    },
    {
      /** Empty the current Cloud SQL instances. */
      clearCloudSqlInstances: true;
    },
    {
      /** Remove the given values from the current Cloud SQL instances. */
      removeCloudSqlInstances: string[];
    },
    {
      /**
       * Completely replace the current Cloud SQL instances with the given
       * values.
       */
      setCloudSqlInstances: string[];
    }
  ]
>;

/**
 * These flags modify the custom audiences that can be used in the audience
 * field of ID token for authenticated requests.
 */
type CustomAudience = OneOf<
  [
    {
      /** Append the given values to the current custom audiences. */
      addCustomAudiences?: string[];
    },
    {
      /** Empty the current custom audiences. */ clearCustomAudiences?: true;
    },
    {
      /** Remove the given values from the current custom audiences. */
      removeCustomAudiences?: string[];
    },
    {
      /** Completely replace the current custom audiences with the given values. */
      setCustomAudiences?: string[];
    }
  ]
>;

type Volume = { name: string; type: string };

type CloudStorageVolume = Volume & {
  /**
   * A volume representing a Cloud Storage bucket. This volume type is mounted
   * using Cloud Storage FUSE. See
   * https://cloud.google.com/storage/docs/gcs-fuse for the details and
   * limitations of this filesystem.
   */
  type: 'cloud-storage';
  /** The name of the bucket to use as the source of this volume */
  bucket: string;
  /** If true, this volume will be read-only from all mounts. */
  readonly: boolean;
  /**
   * A list of flags to pass to GCSFuse. Flags should be specified without
   * leading dashes and separated by semicolons.
   */
  mountOptions?: Record<string, string>;
};

type InMemoryVolume = Volume & {
  /**
   * An ephemeral volume that stores data in the instance's memory. With this
   * type of volume, data is not shared between instances and all data will be
   * lost when the instance it is on is terminated.
   */
  type: 'in-memory';
  /**
   * A quantity representing the maximum amount of memory allocated to this
   * volume, such as "512Mi" or "3G". Data stored in an in-memory volume
   * consumes the memory allocation of the container that wrote the data. If
   * size-limit is not specified, the maximum size will be half the total memory
   * limit of all containers.
   */
  sizeLimit?: string;
};

type NfsVolume = Volume & {
  /** Represents a volume backed by an NFS server. */ type: 'nfs';
  /** The location of the NFS Server, in the form SERVER:/PATH */
  location: URLString;
  /** If true, this volume will be read-only from all mounts. */
  readonly?: boolean;
};

type AddVolume = OneOf<
  [
    {
      /**
       * Adds a volume to the Cloud Run resource. To add more than one volume,*
       * specify this flag multiple times. Volumes must have a name and type
       * key. Only certain values are supported for type.
       */
      addVolume?: (CloudStorageVolume | InMemoryVolume | NfsVolume)[];
    },
    {
      /**
       * Remove all existing volumes from the Cloud Run resource, including
       * volumes mounted as secrets
       */
      clearVolumes?: true;
    },
    { removeVolume?: string[] }
  ]
>;

type VolumeMount = { volume: string; mountPath: string };

/**
 * The following flags apply to a single container. If the --container flag is
 * specified these flags may only be specified after a --container flag.
 * Otherwise they will apply to the primary ingress container.
 */
type ContainerOptions = {
  /**
   * The following flags apply to a single container. If the --container flag is
   * specified these flags may only be specified after a --container flag.
   * Otherwise they will apply to the primary ingress container.
   *
   * `volume=NAME,mount-path=MOUNT_PATH,...`
   */
  addVolumeMount?: VolumeMount[];
  /**
   * Comma-separated arguments passed to the command run by the container image.
   * If not specified and no `--command` is provided, the container image's
   * default Cmd is used. Otherwise, if not specified, no arguments are passed.
   * To reset this field to its default, pass an empty string.
   */
  args?: string[];
  /**
   * Indicates whether automatic base image updates should be enabled for an
   * image built from source.
   */
  automaticUpdates?: boolean;
  /** Remove all existing mounts from the current container. */
  clearVolumeMounts?: true;
  /**
   * Set a CPU limit in Kubernetes cpu units. Cloud Run supports values
   * fractional values below 1, 1, 2, 4, and 8. Some CPU values requires a
   * minimum Memory `--memory` value.
   */
  cpu?: string;
  /** List of container dependencies to add to the current container. */
  dependsOn?: string[];
  /**
   * Cloud Run supports values 0 or 1. 1 gpu also requires a minimum 4 `--cpu`
   * value and a minimum 16Gi -`-memory` value.
   */
  gpu?: 0 | 1;
  /**
   * Comma separated settings for liveness probe in the form KEY=VALUE. Each key
   * stands for a field of the probe described in
   * https://cloud.google.com/run/docs/reference/rest/v1/Container#Probe.
   * Currently supported keys are: initialDelaySeconds, timeoutSeconds,*
   * periodSeconds, failureThreshold, httpGet.port, httpGet.path, grpc.port,*
   * grpc.service.
   *
   * For example, to set a probe with 10s timeout and HTTP probe requests sent
   * to 8080 port of the container:
   *
   *     --liveness-probe=timeoutSeconds=10,httpGet.port=8080
   *
   * To remove existing probe:
   *
   *     --liveness-probe=""
   */
  livenessProbe?: Record<
    | 'initialDelaySeconds'
    | 'timeoutSeconds'
    | 'periodSeconds'
    | 'failureThreshold'
    | 'httpGet.port'
    | 'httpGet.path'
    | 'grpc.port'
    | 'grpc.service',
    string
  >;
  /** Set a memory limit. Ex: 1024Mi, 4Gi. */
  memory?: string;
  /**
   * Container port to receive requests at. Also sets the $PORT environment
   * variable. Must be a number between 1 and 65535, inclusive. To unset this
   * field, pass the special value "default". If updating an existing service
   * with a TCP startup probe pointing to the previous container port, this will
   * also update the probe port.
   */
  port?: number | 'default';
  /**
   * Removes the volume mounted at the specified path from the current
   * container.
   */
  removeVolumeMount?: string[];
  /**
   * Comma separated settings for startup probe in the form KEY=VALUE. Each key
   * stands for a field of the probe described in
   * https://cloud.google.com/run/docs/reference/rest/v1/Container#Probe.
   * Currently supported keys are: initialDelaySeconds, timeoutSeconds,*
   * periodSeconds, failureThreshold, httpGet.port, httpGet.path, grpc.port,*
   * grpc.service, tcpSocket.port.
   *
   * For example, to set a probe with 10s timeout and HTTP probe requests sent
   * to 8080 port of the container:
   *
   *     --startup-probe=timeoutSeconds=10,httpGet.port=8080
   *
   * To remove existing probe:
   *
   *     --startup-probe=""
   */
  startupProbe?: Record<
    | 'initialDelaySeconds'
    | 'timeoutSeconds'
    | 'periodSeconds'
    | 'failureThreshold'
    | 'httpGet.port'
    | 'httpGet.path'
    | 'grpc.port'
    | 'grpc.service'
    | 'tcpSocket.port',
    string
  >;
  /** Whether to use HTTP/2 for connections to the service. */
  useHttp2?: boolean;
};

type BaseImage = OneOf<
  [
    {
      /**
       * Specifies the base image to be used for automatic base image updates.
       * When deploying from source using the Google Cloud buildpacks, this flag
       * will also override the base image used for the application image. See
       * https://cloud.google.com/run/docs/configuring/services/automatic-base-image-updates
       * for more details.
       */
      baseImage?: string;
    },
    {
      /** Opts out of automatic base image updates. */ clearBaseImage?: true;
    }
  ]
>;

type BuildEnvVars = OneOf<
  [
    {
      /**
       * Path to a local YAML file with definitions for all build environment
       * variables. All existing build environment variables will be removed
       * before the new build environment variables are added. Example YAML
       * content:
       *
       * ```yaml
       * KEY_1: 'value1'
       * KEY_2: 'value 2'
       * ```
       */
      buildEnvVarsFile?: PathString;
    },
    {
      /** Remove all build environment variables. */ clearBuildEnvVars?: true;
    },
    {
      /**
       * List of key-value pairs to set as build environment variables. All
       * existing build environment variables will be removed first.
       */
      setBuildEnvVars: Record<string, string>;
    },
    {
      /** List of build environment variables to be removed. */
      removeBuildEnvVars?: string[];
      /** List of key-value pairs to set as build environment variables. */
      updateBuildEnvVars?: Record<string, string>;
    }
  ]
>;

type BuildServiceAccount = OneOf<
  [
    {
      /**
       * Specifies the service account to use to execute the build. Applies only
       * to source deploy builds using the Build API.
       */
      buildServiceAccount?: string;
    },
    {
      /** Clears the Cloud Build service account field. */
      clearBuildServiceAccount?: true;
    }
  ]
>;

type BuildWorkerPool = OneOf<
  [
    {
      /**
       * Name of the Cloud Build Custom Worker Pool that should be used to build
       * the function. The format of this field is
       * `projects/${PROJECT}/locations/${LOCATION}/workerPools/${WORKERPOOL}`
       * where `${PROJECT}` is the project id and `${LOCATION}` is the location
       * where the worker pool is defined and `${WORKERPOOL}` is the short name
       * of the worker pool.
       */
      buildWorkerPool?: string;
    },
    {
      /** Clears the Cloud Build Custom Worker Pool field. */
      clearBuildWorkerPool?: true;
    }
  ]
>;

type EnvVars = OneOf<
  [
    {
      /** Remove all environment variables. */ clearEnvVars?: true;
    },
    {
      /**
       * Path to a local YAML or ENV file with definitions for all environment
       * variables. All existing environment variables will be removed before
       * the new environment variables are added.
       *
       * Example YAML content:
       *
       * ```yaml
       * KEY_1: 'value1'
       * KEY_2: 'value 2'
       * ```
       *
       * Example ENV content:
       *
       * ```ini
       * KEY_1 = 'value1';
       * KEY_2 = 'value 2';
       * ```
       */
      envVarsFile?: PathString;
    },
    {
      /**
       * List of key-value pairs to set as environment variables. All existing
       * environment variables will be removed first.
       */
      setEnvVars?: Record<string, string>;
    },
    {
      /** List of environment variables to be removed. */
      removeEnvVars?: string[];
      /** List of key-value pairs to set as environment variables. */
      updateEnvVars?: Record<string, string>;
    }
  ]
>;

/**
 * Specify secrets to mount or provide as environment variables. Keys starting
 * with a forward slash '/' are mount paths. All other keys correspond to
 * environment variables. Values should be in the form
 * SECRET_NAME:SECRET_VERSION. For example:
 * '--update-secrets=/secrets/api/key=mysecret:latest,ENV=othersecret:1' will
 * mount a volume at '/secrets/api' containing a file 'key' with the latest
 * version of secret 'mysecret'. An environment variable named ENV will also be
 * created whose value is version 1 of secret 'othersecret'.
 */
type Secrets = OneOf<
  [
    {
      /** Remove all secrets. */ clearSecrets?: true;
    },
    {
      /**
       * List of key-value pairs to set as secrets. All existing secrets will be
       * removed first.
       */
      setSecrets?: Record<string, string>;
    },
    {
      /** List of secrets to be removed. */ removeSecrets?: string[];
      /** List of key-value pairs to set as secrets. */
      updateSecrets?: Record<string, string>;
    }
  ]
>;

type Misc = OneOf<
  [
    {
      /**
       * Entrypoint for the container image. If not specified, the container
       * image's default Entrypoint is run. To reset this field to its default,*
       * pass an empty string.
       */
      command?: string;
    },
    {
      /**
       * Specifies that the deployed object is a function. If a value is
       * provided, that value is used as the entrypoint.
       */
      function?: string;
    },
    {
      /**
       * Name of the container image to deploy (e.g.
       * `us-docker.pkg.dev/cloudrun/container/hello:latest`). When used with
       * --source, the image must be the URI of an Artifact Registry Docker
       * repository in the Docker format
       * ($REGION-docker.pkg.dev/$PROJECT/$REPOSITORY") or
       * ($REGION-docker.pkg.dev/$PROJECT/$REPOSITORY/$IMAGE_NAME"). The image
       * name must be the same as the name of the service.
       */
      image?: string;
    },
    {
      /**
       * The location of the source to build. If a Dockerfile is present in the
       * source code directory, it will be built using that Dockerfile,*
       * otherwise it will use Google Cloud buildpacks. See
       * https://cloud.google.com/run/docs/deploying-source-code for more
       * details. The location can be a directory on a local disk or a gzipped
       * archive file (.tar.gz) in Google Cloud Storage. If the source is a
       * local directory, this command skips the files specified in the
       * --ignore-file. If --ignore-file is not specified, use `.gcloudignore`
       * file. If a `.gcloudignore` file is absent and a .gitignore file is
       * present in the local source directory, gcloud will use a generated
       * Git-compatible `.gcloudignore` file that respects your .gitignored
       * files. The global .gitignore is not respected. For more information on
       * `.gcloudignore`, see [gcloud topic
       * gcloudignore](https://cloud.google.com/sdk/gcloud/reference/topic/gcloudignore).
       */
      source?: PathString;
    }
  ]
>;

type BinaryAuthorization = OneOf<
  [
    {
      /**
       * Binary Authorization policy to check against. This must be set to
       * "default".
       */
      binaryAuthorzation?: 'default';
    },
    {
      /** Remove any previously set Binary Authorization policy. */
      clearBinaryAuthorization?: true;
    }
  ]
>;

type EncryptionKeyShutdownHours = OneOf<
  [
    {
      /** Remove any previously set CMEK key shutdown hours setting. */
      clearEncryptionKeyShutdownHours?: true;
    },
    {
      /**
       * The number of hours to wait before an automatic shutdown server after
       * CMEK key revocation is detected.
       */
      encryptionKeyShutdownHours?: number;
    }
  ]
>;

type CmekKey = OneOf<
  [
    { /** Remove any previously set CMEK key reference. */ clearKey?: true },
    {
      /** CMEK key reference to encrypt the container with. */ key?: string;
    }
  ]
>;

type Labels = OneOf<
  [
    {
      /**
       * Remove all labels. If `--update-labels` is also specified then
       * `--clear-labels` is applied first.
       *
       * For example, to remove all labels:
       *
       * ```bash
       * gcloud run deploy --clear-labels
       * ```
       *
       * To remove all existing labels and create two new labels, `foo` and
       * `baz`:
       *
       * ```bash
       * gcloud run deploy --clear-labels --update-labels foo=bar,baz=qux
       * ```
       */
      clearLabels?: true;
    },
    {
      /**
       * List of label keys to remove. If a label does not exist it is silently
       * ignored. If --update-labels is also specified then --update-labels is
       * applied first
       */
      removeLabels?: string[];
    }
  ]
> &
  OneOf<
    [
      {
        /** List of label KEY=VALUE pairs to add. An alias to --update-labels. */
        labels?: Record<string, string>;
      },
      {
        /**
         * List of label KEY=VALUE pairs to update. If a label exists, its value
         * is modified. Otherwise, a new label is created.
         */
        updateLabels?: Record<string, string>;
      }
    ]
  >;

type Network = OneOf<
  [
    {
      /**
       * Disconnect this Cloud Run service from the VPC network it is connected
       * to.
       */
      clearNetwork?: true;
    },
    {
      /**
       * The VPC network that the Cloud Run service will be able to send traffic
       * to. If --subnet is also specified, subnet must be a subnetwork of the
       * network specified by this --network flag. To clear existing VPC network
       * settings, use --clear-network.
       */
      network?: string;
      /**
       * The VPC subnetwork that the Cloud Run service will get IPs from. The
       * subnetwork must be /26 or larger. If --network is also specified,*
       * subnet must be a subnetwork of the network specified by the --network
       * flag. If --network is not specified, network will be looked up from
       * this subnetwork. To clear existing VPC network settings, use
       * --clear-network.
       */
      subnet?: string;
    }
  ]
>;

type NetworkTags = OneOf<
  [
    {
      /** Clears all existing network tags from the Cloud Run service. */
      clearNetworkTags?: true;
    },
    {
      /**
       * Applies the given network tags (comma separated) to the Cloud Run
       * service. To clear existing tags, use --clear-network-tags.
       */
      networkTags?: string[];
    }
  ]
>;

type PostKeyRevocationActionType = OneOf<
  [
    {
      /** Remove any previously set post CMEK key revocation action type. */
      clearPostKeyRevocationActionType?: true;
    },
    {
      /**
       * Action type after CMEK key revocation.
       * `POST_KEY_REVOCATION_ACTION_TYPE` must be one of:
       *
       * - `prevent-new` No new instances will be started after CMEK key
       *   revocation.
       * - `shut-down` No new instances will be started and the existing instances
       *   will be shut down after CMEK key revocation.
       */
      postKeyRevocationActionType?: 'prevent-new' | 'shut-down';
    }
  ]
>;

type DeployOptions = BaseOptions &
  CloudSql &
  CustomAudience &
  ContainerOptions &
  BaseImage &
  Misc &
  BinaryAuthorization &
  EncryptionKeyShutdownHours &
  CmekKey &
  Labels &
  PostKeyRevocationActionType;

type EnvironmentOptions = EnvVars & Secrets;
type BuildOptions = BuildEnvVars & BuildServiceAccount & BuildWorkerPool;
type NetworkOptions = Network & NetworkTags;

type Options = {
  /** ID of the service or fully qualified identifier for the service. */
  service: string;
  options?: DeployOptions;
  env?: EnvironmentOptions;
  volumes?: AddVolume;
  build?: BuildOptions;
  network?: NetworkOptions;
};

/** Creates or updates a Cloud Run service. */
export async function deploy({
  service,
  options = {},
  volumes,
  env = {},
  build = {},
  network = {}
}: Options) {
  await shell.gcloud(
    `run deploy ${service}${option('namespace', options)}${option(
      'allow-authenticated',
      options
    )}${flag('async', options)}${flag('breakglass', options)}${flag('clear-vpc-connector', options)}${option('concurrency', options)}${option('container', options)}${option('cpu-boost', options)}${option('cpu-throttling', options)}${option('default-url', options)}${option('health-check', options)}${option('description', options)}${option('execution-environment', options)}${option('gpu-type', options)}${option('gpu-zonal-redundancy', options)}${option('ingress', options)}${option('invoker-iam-check', options)}${option('max', options)}${option('max-instances', options)}${option('min', options)}${option('min-instances', options)}${option('region', options)}${option('regions', options)}${option('remove-containers', options)}${option('revision-suffix', options)}${option('scaling', options)}${option('service-account', options)}${option('session-affinity', options)}${option('tag', options)}${option('timeout', options)}${flag('no-traffic', options)}${option('vpc-connector', options)}${option('vpc-egress', options)}${option('add-cloud-sql-instances', options)}${flag('clear-cloud-sql-instances', options)}${option('remove-cloud-sql-instances', options)}${option('set-cloud-sql-instances', options)}${option('add-custom-audiences', options)}${flag('clear-custom-audiences', options)}${option('remove-custom-audiences', options)}${option('set-custom-audiences', options)}${
      volumes?.addVolume
        ? volumes.addVolume
            .map((volume) => {
              switch (volume.type) {
                case 'cloud-storage':
                  return option('add-volume', {
                    addVolume: {
                      ...volume,
                      mountOptions: undefined,
                      'mount-options': volume.mountOptions
                        ? flatten(volume.mountOptions, ';')
                        : undefined
                    }
                  });
                case 'in-memory':
                  return option('add-volume', {
                    addVolume: {
                      ...volume,
                      sizeLimit: undefined,
                      'size-limit': volume.sizeLimit
                    }
                  });
                case 'nfs':
                  return option('add-volume', { addVolume: volume });
              }
              return '';
            })
            .join('')
        : ''
    }${flag('clear-volumes', options)}${option('remove-volume', options)}${option(
      'add-volume-mount',
      {
        addVolumeMount: options.addVolumeMount
          ? concatenate(
              options.addVolumeMount.map((mount: VolumeMount) => flatten(mount))
            )
          : undefined
      }
    )}${option('args', options)}${option('automatic-updates', options)}${flag(
      'clear-volume-mounts',
      options
    )}${option('cpu', options)}${option('depends-on', options)}${option(
      'gpu',
      options
    )}${option('liveness-probe', options)}${option('memory', options)}${option(
      'port',
      options
    )}${option('remove-volume-mount', options)}${option(
      'startup-probe',
      options
    )}${option('use-https', options)}${option('base-image', options)}${flag(
      'clear-base-image',
      options
    )}${option('build-env-vars-file', build)}${flag(
      'clear-build-env-vars',
      build
    )}${option('remove-build-env-vars', build)}${option(
      'update-build-env-vars',
      build
    )}${option('build-service-account', build)}${flag(
      'clear-build-service-account',
      build
    )}${option('build-worker-pool', build)}${flag(
      'clear-build-worker-pool',
      build
    )}${flag('clear-env-vars', env)}${option(
      'env-vars-file',
      env
    )}${option('set-env-vars', env)}${option(
      'remove-env-vars',
      env
    )}${option('update-env-vars', env)}${flag(
      'clear-secrets',
      env
    )}${option('set-secrets', env)}${option(
      'remove-secrets',
      env
    )}${option('update-secrets', env)}${option('command', options)}${option(
      'function',
      options
    )}${option('image', options)}${option('source', options)}${option(
      'binary-authorization',
      options
    )}${flag('clear-binary-authorization', options)}${flag(
      'clear-encryption-key-shutdown-hours',
      options
    )}${option('encryption-key-shutdown-hours', options)}${flag(
      'clear-key',
      options
    )}${option('key', options)}${flag('clear-labels', options)}${option(
      'remove-labels',
      options
    )}${option('labels', options)}${option('update-labels', options)}${flag(
      'clear-network',
      network
    )}${option('network', network)}${option('subnet', network)}${flag(
      'clear-network-tags',
      network
    )}${option('network-tags', network)}${flag(
      'clear-post-key-revocation-action-type',
      options
    )}${option('post-key-revocation-action-type', options)}`
  );
}
