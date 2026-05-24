import {
  BooleanString,
  DateTimeString,
  JSONString,
  PathString,
  URLString,
  UUIDString
} from '@battis/descriptive-types';

type Port = {
  containerPort: number;
  name: string;
};

type Container = {
  image: PathString;
  name: string;
  ports: Port[];
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
};

type Condition = {
  lastTransitionTime: DateTimeString;
  message: string;
  reason?: string;
  severity?: string;
  status: BooleanString<'True' | 'False'>;
  type: string;
};

export type Revision = {
  apiVersion: string;
  kind: 'Revision';
  metadata: {
    annotations: Record<string, JSONString>;
    creationTimestamp: DateTimeString;
    generation: number;
    labels: Record<string, string>;
    name: string;
    namespace: string;
    ownerReferences: [
      {
        apiVersion: string;
        blockOwnerDeletion: boolean;
        controller: boolean;
        kind: string;
        name: string;
        uid: UUIDString;
      }
    ];
    resourceVersion: string;
    selfLink: PathString;
    uid: UUIDString;
  };
  spec: {
    containerConcurrency: number;
    containers: Container[];
    runtimeClassName: string;
    serviceAccountName: string;
    timeoutSeconds: number;
  };
  status: {
    conditions: Condition[];
    imageDigest: string;
    logUrl: URLString;
    observedGeneration: number;
  };
};
