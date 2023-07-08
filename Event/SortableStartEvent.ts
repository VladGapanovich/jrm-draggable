import DragStartSensorEvent from '../Sensor/Event/DragStartSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type SortableStartEventProps = {
  sensorEvent: DragStartSensorEvent;
  source: HTMLElement;
  originalSource: HTMLElement;
  startIndex: number;
  startContainerIndex: number;
  startContainer: ParentNode;
};

export default class SortableStartEvent extends JrmDraggableEvent {
  public readonly sensorEvent: DragStartSensorEvent;
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly startIndex: number;
  public readonly startContainerIndex: number;
  public readonly startContainer: ParentNode;

  public constructor(props: SortableStartEventProps) {
    super();

    this.sensorEvent = props.sensorEvent;
    this.source = props.source;
    this.originalSource = props.originalSource;
    this.startIndex = props.startIndex;
    this.startContainerIndex = props.startContainerIndex;
    this.startContainer = props.startContainer;
  }

  public get type() {
    return JrmDraggableEventType.SORTABLE_START_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
