import { DraggableOptions } from '../Draggable';
import EventDispatcher, {
  EventListener,
} from '../EventDispatcher/EventDispatcher';
import Sensor from '../Sensor/Sensor';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';
import closest from '../Shared/utils/closest';
import euclideanDistance from '../Shared/utils/distance';
import touchCoords, {
  Touches,
} from '../Shared/utils/touchCoords';
import DragStartSensorEvent from '../Sensor/Event/DragStartSensorEvent';
import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import DragStopSensorEvent from '../Sensor/Event/DragStopSensorEvent';

let preventScrolling = false;

// WebKit requires cancelable `touchmove` events to be added as early as possible
window.addEventListener(
  'touchmove',
  (event) => {
    if (!preventScrolling) {
      return;
    }

    // Prevent scrolling
    event.preventDefault();
  },
  { passive: false }
);

export default class TouchSensor implements Sensor {
  private readonly containers: HTMLElement[];
  private readonly options: DraggableOptions;
  private readonly eventDispatcher: EventDispatcher;
  private dragging: boolean;
  private tapTimeout: number | null;
  private onTouchStartAt: number;
  private startEvent: TouchEvent | null;
  private currentContainer: HTMLElement | null;
  private originalSource: HTMLElement | null;

  public constructor(containers: HTMLElement[], options: DraggableOptions) {
    this.containers = containers;
    this.options = options;
    this.eventDispatcher = new EventDispatcher();
    this.dragging = false;
    this.tapTimeout = null;
    this.onTouchStartAt = 0;
    this.startEvent = null;
    this.currentContainer = null;
    this.originalSource = null;

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onDistanceChange = this.onDistanceChange.bind(this);
  }

  public attach() {
    document.addEventListener('touchstart', this.onTouchStart);
  }

  public detach() {
    document.removeEventListener('touchstart', this.onTouchStart);
  }

  private onTouchStart(event: TouchEvent) {
    const target = <HTMLElement>event.target;
    const container = closest(target, this.containers);

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

    const { delay, distance } = this.options;
    const { pageX, pageY } = touchCoords(event);

    this.onTouchStartAt = Date.now();
    this.startEvent = event;
    this.currentContainer = container;
    this.originalSource = originalSource;

    document.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('touchcancel', this.onTouchEnd);
    document.addEventListener('touchmove', this.onDistanceChange);
    container.addEventListener('contextmenu', onContextMenu);

    if (distance) {
      preventScrolling = true;
    }

    this.tapTimeout = window.setTimeout(() => {
      this.onDistanceChange({
        touches: [{ pageX, pageY }],
      });
    }, delay.touch);
  }

  private startDrag() {
    if (
      this.startEvent === null ||
      this.currentContainer === null ||
      this.originalSource === null ||
      (this.startEvent.target !== null &&
        !(this.startEvent.target instanceof Element))
    ) {
      return;
    }

    const touch = touchCoords(this.startEvent);
    const dragStartEvent = new DragStartSensorEvent({
      clientX: touch.pageX,
      clientY: touch.pageY,
      target: <HTMLElement>this.startEvent.target,
      container: this.currentContainer,
      originalSource: this.originalSource,
      originalEvent: this.startEvent,
    });

    this.eventDispatcher.trigger(dragStartEvent);

    this.dragging = !dragStartEvent.defaultPrevented;

    if (this.dragging) {
      document.addEventListener('touchmove', this.onTouchMove);
    }

    preventScrolling = this.dragging;
  }

  private onDistanceChange(event: TouchEvent | Touches) {
    if (this.startEvent === null) {
      return;
    }

    const { distance, delay } = this.options;
    const start = touchCoords(this.startEvent);
    const current = touchCoords(event);
    const timeElapsed = Date.now() - this.onTouchStartAt;
    const distanceTravelled = euclideanDistance(
      start.pageX,
      start.pageY,
      current.pageX,
      current.pageY
    );

    if (this.tapTimeout !== null) {
      window.clearTimeout(this.tapTimeout);
    }

    if (timeElapsed < delay.touch) {
      // moved during delay
      document.removeEventListener('touchmove', this.onDistanceChange);
    } else if (distanceTravelled >= distance) {
      document.removeEventListener('touchmove', this.onDistanceChange);
      this.startDrag();
    }
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.dragging || this.currentContainer === null) {
      return;
    }

    const { pageX, pageY } = touchCoords(event);
    const target = document.elementFromPoint(
      pageX - window.scrollX,
      pageY - window.scrollY
    );

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: pageX,
      clientY: pageY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragMoveEvent);
  }

  private onTouchEnd(event: TouchEvent) {
    if (this.tapTimeout !== null) {
      window.clearTimeout(this.tapTimeout);
    }

    preventScrolling = false;

    document.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('touchcancel', this.onTouchEnd);
    document.removeEventListener('touchmove', this.onDistanceChange);

    if (this.currentContainer !== null) {
      this.currentContainer.removeEventListener('contextmenu', onContextMenu);
    }

    if (!this.dragging || this.currentContainer === null) {
      return;
    }

    document.removeEventListener('touchmove', this.onTouchMove);

    const { pageX, pageY } = touchCoords(event);
    const target = document.elementFromPoint(
      pageX - window.scrollX,
      pageY - window.scrollY
    );

    event.preventDefault();

    const dragStopEvent = new DragStopSensorEvent({
      clientX: pageX,
      clientY: pageY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragStopEvent);

    this.currentContainer = null;
    this.dragging = false;
    this.startEvent = null;
  }

  public on(type: JrmDraggableEventType, listener: EventListener) {
    this.eventDispatcher.on(type, listener);
  }

  public off(type: JrmDraggableEventType, listener: EventListener) {
    this.eventDispatcher.off(type, listener);
  }
}

function onContextMenu(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}
