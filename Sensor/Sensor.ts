import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SensorEventListener = (sensorEvent: any) => void;

export default interface Sensor {
  attach();
  detach();
  on(type: JrmDraggableEventType, listener: SensorEventListener);
  off(type: JrmDraggableEventType, listener: SensorEventListener);
}
