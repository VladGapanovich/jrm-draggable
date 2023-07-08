import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

export type SensorEventListener = (sensorEvent: any) => void;

export default interface Sensor {
  attach();
  detach();
  on(type: JrmDraggableEventType, listener: SensorEventListener);
  off(type: JrmDraggableEventType, listener: SensorEventListener);
}
