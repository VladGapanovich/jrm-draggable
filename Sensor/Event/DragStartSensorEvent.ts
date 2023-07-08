import SensorEvent, {
  SensorEventProps,
} from '../../Sensor/Event/SensorEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

type DragStartSensorEventProps = SensorEventProps & {
  originalSource: HTMLElement;
};

export default class DragStartSensorEvent extends SensorEvent {
  public readonly originalSource: HTMLElement;

  public constructor(props: DragStartSensorEventProps) {
    super(props);

    this.originalSource = props.originalSource;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_START_SENSOR_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
