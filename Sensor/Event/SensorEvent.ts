import JrmDraggableEvent from '../../Shared/Event/JrmDraggableEvent';

export type SensorEventProps = {
  clientX: number;
  clientY: number;
  container: HTMLElement;
  originalEvent: MouseEvent | TouchEvent;
  target: Element | null;
};

export default abstract class SensorEvent extends JrmDraggableEvent {
  public readonly clientX: number;
  public readonly clientY: number;
  public readonly container: HTMLElement;
  public readonly originalEvent: MouseEvent | TouchEvent | DragEvent;
  public readonly target: Element | null;

  public constructor(props: SensorEventProps) {
    super();

    this.clientX = props.clientX;
    this.clientY = props.clientY;
    this.target = props.target;
    this.container = props.container;
    this.originalEvent = props.originalEvent;
  }
}
