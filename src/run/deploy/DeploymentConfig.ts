import {
  BooleanString,
  DateTimeString,
  EmailString,
  PathString,
  URLString,
  UUIDString
} from '@battis/descriptive-types';

type Condition = {
  lastTransitionTime: DateTimeString<'ISO'>;
  status: BooleanString<'True' | 'False'>;
  type: string;
};

export type DeploymentConfig = {
  '@type': string;
  apiVersion: string;
  kind: string;
  metadata: {
    annotations: Record<string, string>;
    creationTimestamp: DateTimeString<'ISO'>;
    generation: number;
    labels: Record<string, string>;
    name: string;
    namespace: string;
    resourceVersion: string;
    selfLink: PathString;
    uid: UUIDString;
  };
  spec: {
    template: {
      metadata: {
        annotations: Record<string, string>;
        labels: Record<string, string>;
      };
      spec: {
        containerConcurrency: number;
        containers: [
          {
            env: { name: string; value: string }[];
            image: string;
            ports: { containerPort: number; name: string }[];
            resources: {
              limits: {
                cpu: string;
                memory: string;
              };
            };
            startupProbe: {
              failureThreshold: number;
              periodSeconds: number;
              tcpSocket: {
                port: number;
              };
              timeoutSeconds: number;
            };
          }
        ];
        runtimeClassName: string;
        serviceAccountName?: EmailString;
        timeoutSeconds: number;
      };
    };
    traffic: [
      {
        latestRevision: boolean;
        percent: number;
      }
    ];
  };
  status: {
    address: {
      url: URLString;
    };
    conditions: Condition[];
    latestCreatedRevisionName: string;
    latestReadyRevisionName: string;
    observedGeneration: number;
    traffic: [
      {
        latestRevision: boolean;
        percent: number;
        revisionName: string;
      }
    ];
    url: URLString;
  };
};
