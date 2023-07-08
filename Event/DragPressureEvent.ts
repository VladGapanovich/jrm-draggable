import DragPressureSensorEvent from '../Sensor/Event/DragPressureSensorEvent';
import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type DragPressureEventProps = {
  source: HTMLElement | null;
  sensorEvent: DragPressureSensorEvent;
  pressure: number;
};

export default class DragPressureEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement | null;
  public readonly sensorEvent: DragPressureSensorEvent;
  public readonly pressure: number;

  public constructor(props: DragPressureEventProps) {
    super();

    this.source = props.source;
    this.sensorEvent = props.sensorEvent;
    this.pressure = props.pressure;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_PRESSURE_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
