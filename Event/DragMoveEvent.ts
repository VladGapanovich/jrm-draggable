import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragMoveEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  dragMoveSensorEvent: DragMoveSensorEvent;
};

export default class DragMoveEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly dragMoveSensorEvent: DragMoveSensorEvent;

  public constructor(props: DragMoveEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.dragMoveSensorEvent = props.dragMoveSensorEvent;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_MOVE_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
