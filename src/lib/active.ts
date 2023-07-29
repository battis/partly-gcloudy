import { Descriptor } from './descriptor';

export default class Active<T extends Descriptor> {
  private id: string;
  private descriptor: T;

  constructor(defaultIdentifier?: string, descriptor?: T) {
    this.id = defaultIdentifier;
    this.descriptor = descriptor;
  }

  get = () => this.id;

  set(identifier: string, descriptor?: T) {
    this.id = identifier;
    this.descriptor = descriptor;
  }

  instance = () => this.descriptor;
}
