import { type DraggableOptions } from '../Draggable';
import EventDispatcher, {
  type EventListener,
  type EventMap,
} from '../EventDispatcher/EventDispatcher';
import type Sensor from '../Sensor/Sensor';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';
import euclideanDistance from '../Shared/utils/distance';
import closest from '../Shared/utils/closest';
import DragStartSensorEvent from '../Sensor/Event/DragStartSensorEvent';
import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import DragStopSensorEvent from '../Sensor/Event/DragStopSensorEvent';

export default class MouseSensor implements Sensor {
  private readonly containers: HTMLElement[];
  private readonly options: DraggableOptions;
  private readonly eventDispatcher: EventDispatcher;
  private dragging: boolean;
  private mouseDownTimeout: number | null;
  private onMouseDownAt: number;
  private startEvent: MouseEvent | null;
  private currentContainer: HTMLElement | null;
  private originalSource: HTMLElement | null;

  public constructor(containers: HTMLElement[], options: DraggableOptions) {
    this.containers = containers;
    this.options = options;
    this.eventDispatcher = new EventDispatcher();
    this.dragging = false;
    this.mouseDownTimeout = null;
    this.onMouseDownAt = 0;
    this.startEvent = null;
    this.currentContainer = null;
    this.originalSource = null;

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDistanceChange = this.onDistanceChange.bind(this);
    this.onContextMenuWhileDragging =
      this.onContextMenuWhileDragging.bind(this);
  }

  public attach() {
    document.addEventListener('mousedown', this.onMouseDown, true);
  }

  public detach() {
    document.removeEventListener('mousedown', this.onMouseDown, true);
  }

  private onMouseDown(event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey) {
      return;
    }
    const container = closest(event.target, this.containers);

    if (!container) {
      return;
    }

    if (
      this.options.handle &&
      event.target &&
      !closest(event.target, this.options.handle)
    ) {
      return;
    }

    const originalSource = closest(event.target, this.options.draggable);

    if (!originalSource) {
      return;
    }

    const { pageX, pageY } = event;

    this.onMouseDownAt = Date.now();
    this.startEvent = event;

    this.currentContainer = container;
    this.originalSource = originalSource;

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('dragstart', preventNativeDragStart);
    document.addEventListener('mousemove', this.onDistanceChange);

    this.mouseDownTimeout = window.setTimeout(() => {
      this.onDistanceChange({ pageX, pageY });
    }, this.options.delay.mouse);
  }

  private startDrag() {
    if (
      this.startEvent === null ||
      this.currentContainer === null ||
      this.originalSource === null ||
      !(this.startEvent.target instanceof Element)
    ) {
      return;
    }

    const dragStartEvent = new DragStartSensorEvent({
      clientX: this.startEvent.clientX,
      clientY: this.startEvent.clientY,
      target: this.startEvent.target,
      container: this.currentContainer,
      originalSource: this.originalSource,
      originalEvent: this.startEvent,
    });

    this.eventDispatcher.trigger(dragStartEvent);

    this.dragging = !dragStartEvent.defaultPrevented;

    if (this.dragging) {
      document.addEventListener(
        'contextmenu',
        this.onContextMenuWhileDragging,
        true,
      );
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
  }

  private onDistanceChange(coords: { pageX: number; pageY: number }) {
    if (this.startEvent === null) {
      return;
    }

    const { pageX, pageY } = coords;
    const { distance } = this.options;

    if (!this.currentContainer) {
      return;
    }

    const timeElapsed = Date.now() - this.onMouseDownAt;
    const distanceTravelled =
      euclideanDistance(
        this.startEvent.pageX,
        this.startEvent.pageY,
        pageX,
        pageY,
      ) || 0;

    if (this.mouseDownTimeout !== null) {
      window.clearTimeout(this.mouseDownTimeout);
    }

    if (timeElapsed < this.options.delay.mouse) {
      // moved during delay
      document.removeEventListener('mousemove', this.onDistanceChange);
    } else if (distanceTravelled >= distance) {
      document.removeEventListener('mousemove', this.onDistanceChange);
      this.startDrag();
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.dragging || this.currentContainer === null) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragMoveEvent);
  }

  private onMouseUp(event: MouseEvent) {
    if (this.mouseDownTimeout !== null) {
      window.clearTimeout(this.mouseDownTimeout);
    }

    if (event.button !== 0 || this.currentContainer === null) {
      return;
    }

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('dragstart', preventNativeDragStart);
    document.removeEventListener('mousemove', this.onDistanceChange);

    if (!this.dragging) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragStopEvent = new DragStopSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragStopEvent);

    document.removeEventListener(
      'contextmenu',
      this.onContextMenuWhileDragging,
      true,
    );
    document.removeEventListener('mousemove', this.onMouseMove);

    this.currentContainer = null;
    this.dragging = false;
    this.startEvent = null;
  }

  private onContextMenuWhileDragging(event: MouseEvent) {
    event.preventDefault();
  }

  public on<T extends JrmDraggableEventType>(
    type: T,
    listener: EventListener<EventMap[T]>,
  ) {
    this.eventDispatcher.on(type, listener);
  }

  public off<T extends JrmDraggableEventType>(
    type: T,
    listener: EventListener<EventMap[T]>,
  ) {
    this.eventDispatcher.off(type, listener);
  }
}

function preventNativeDragStart(event) {
  event.preventDefault();
}
