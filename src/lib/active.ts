import Descriptor from './Descriptor';

export default class Active<T extends Descriptor> {
  public constructor(
    private instance?: T,
    private identifier: keyof T = 'name'
  ) {}

  public getIdentifier = () => this.instance[this.identifier];

  public activate = (instance: T) => (this.instance = instance);

  public get = () => this.instance;
}
