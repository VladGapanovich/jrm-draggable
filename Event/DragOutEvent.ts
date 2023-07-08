import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragOutEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  sensorEvent: DragMoveSensorEvent;
  overContainer: HTMLElement | null;
  over: HTMLElement;
};

export default class DragOutEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly sensorEvent: DragMoveSensorEvent;
  public readonly overContainer: HTMLElement | null;
  public readonly over: HTMLElement;

  public constructor(props: DragOutEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.sensorEvent = props.sensorEvent;
    this.overContainer = props.overContainer;
    this.over = props.over;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_OUT_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
