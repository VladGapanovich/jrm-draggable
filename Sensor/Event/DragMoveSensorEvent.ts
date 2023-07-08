import SensorEvent from '../../Sensor/Event/SensorEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

export default class DragMoveSensorEvent extends SensorEvent {
  public get type() {
    return JrmDraggableEventType.DRAG_MOVE_SENSOR_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
