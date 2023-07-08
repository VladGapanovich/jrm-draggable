import SensorEvent from '../../Sensor/Event/SensorEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

export default class DragStopSensorEvent extends SensorEvent {
  public get type() {
    return JrmDraggableEventType.DRAG_STOP_SENSOR_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
