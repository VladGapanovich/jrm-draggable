import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragOverEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  sensorEvent: DragMoveSensorEvent;
  overContainer: HTMLElement;
  over: Element | null;
};

export default class DragOverEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly sensorEvent: DragMoveSensorEvent;
  public readonly overContainer: HTMLElement;
  public readonly over: Element | null;

  public constructor(props: DragOverEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.sensorEvent = props.sensorEvent;
    this.overContainer = props.overContainer;
    this.over = props.over;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_OVER_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
