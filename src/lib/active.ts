import Descriptor from './Descriptor';

export default class Active<T extends Descriptor> {
  public constructor(
    private instance?: T,
    private identifier: keyof T = 'name'
  ) {}

  public getIdentifier = () =>
    this.instance ? this.instance[this.identifier] : undefined;

  public activate = (instance: T) => (this.instance = instance);

  public get = () => this.instance;
}
