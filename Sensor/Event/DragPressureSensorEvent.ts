import SensorEvent, {
  SensorEventProps,
} from '../../Sensor/Event/SensorEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

type DragPressureSensorEventProps = SensorEventProps & {
  pressure: number;
};

export default class DragPressureSensorEvent extends SensorEvent {
  public readonly pressure: number;

  public constructor(props: DragPressureSensorEventProps) {
    super(props);

    this.pressure = props.pressure;
  }

  public get type() {
    return JrmDraggableEventType.DRAG_PRESSURE_SENSOR_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
