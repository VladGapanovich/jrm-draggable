import Draggable from '../Draggable';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

export default class DraggableDestroyEvent extends JrmDraggableEvent {
  public readonly draggable: Draggable;

  public constructor(draggable: Draggable) {
    super();

    this.draggable = draggable;
  }

  public get type() {
    return JrmDraggableEventType.DRAGGABLE_DESTROY_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
