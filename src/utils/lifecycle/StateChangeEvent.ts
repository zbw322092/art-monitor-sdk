import Event from './shims/Event';

interface IInitDict {
  prevState: string;
  newState: string;
  originalEvent: Event;
}

export default class StateChangeEvent extends Event {
  constructor(type: string, initDict: IInitDict) {
    super(type);
    this.newState = initDict.newState;
    this.prevState = initDict.prevState;
    this.originalEvent = initDict.originalEvent;
  }

  public newState: string;
  public prevState: string;
  public originalEvent: Event;
}