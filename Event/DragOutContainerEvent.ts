import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragOutContainerEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  sensorEvent: DragMoveSensorEvent;
  overContainer: HTMLElement;
};

export default class DragOutContainerEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly sensorEvent: DragMoveSensorEvent;
  public readonly overContainer: HTMLElement;

  public constructor(props: DragOutContainerEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.sensorEvent = props.sensorEvent;
    this.overContainer = props.overContainer;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_OUT_CONTAINER_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
