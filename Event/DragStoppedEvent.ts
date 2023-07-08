import DragStopSensorEvent from '../Sensor/Event/DragStopSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragStoppedEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  sensorEvent: DragStopSensorEvent | null;
};

export default class DragStoppedEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly sensorEvent: DragStopSensorEvent | null;

  public constructor(props: DragStoppedEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.sensorEvent = props.sensorEvent;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_STOPPED_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
