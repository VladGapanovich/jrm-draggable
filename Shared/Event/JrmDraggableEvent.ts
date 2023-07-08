import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

export default abstract class JrmDraggableEvent {
  private _defaultPrevented: boolean;

  protected constructor() {
    this._defaultPrevented = false;
  }

  public preventDefault(): void {
    this._defaultPrevented = true;
  }

  abstract get type(): JrmDraggableEventType;

  abstract get cancelable(): boolean;

  public get defaultPrevented() {
    return this._defaultPrevented;
  }

  public get isTrusted() {
    return false;
  }
}
