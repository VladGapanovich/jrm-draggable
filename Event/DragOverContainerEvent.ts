import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragOverContainerEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  sensorEvent: DragMoveSensorEvent;
  overContainer: HTMLElement;
};

export default class DragOverContainerEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly sensorEvent: DragMoveSensorEvent;
  public readonly overContainer: HTMLElement;

  public constructor(props: DragOverContainerEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.sensorEvent = props.sensorEvent;
    this.overContainer = props.overContainer;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_OVER_CONTAINER_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
