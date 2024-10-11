import type { DraggableOptions } from '../Draggable';
import EventDispatcher, {
  type EventListener,
  type EventMap,
} from '../EventDispatcher/EventDispatcher';
import type Sensor from '../Sensor/Sensor';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';
import closest from '../Shared/utils/closest';
import DragStartSensorEvent from '../Sensor/Event/DragStartSensorEvent';
import DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import DragStopSensorEvent from '../Sensor/Event/DragStopSensorEvent';

export default class DragSensor implements Sensor {
  private readonly containers: HTMLElement[];
  private readonly options: DraggableOptions;
  private readonly eventDispatcher: EventDispatcher;
  private dragging: boolean;
  private currentContainer: HTMLElement | null;
  private mouseDownTimeout: number | null;
  private draggableElement: HTMLElement | null;
  private nativeDraggableElement: HTMLElement | null;

  public constructor(containers: HTMLElement[], options: DraggableOptions) {
    this.containers = containers;
    this.options = options;
    this.eventDispatcher = new EventDispatcher();
    this.dragging = false;
    this.currentContainer = null;
    this.mouseDownTimeout = null;
    this.draggableElement = null;
    this.nativeDraggableElement = null;
  }

  public attach() {
    document.addEventListener('mousedown', this.onMouseDown.bind(this), true);
  }

  public detach() {
    document.removeEventListener(
      'mousedown',
      this.onMouseDown.bind(this),
      true,
    );
  }

  private onDragStart(event: DragEvent) {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const originalSource = this.draggableElement;

    if (originalSource === null || this.currentContainer === null) {
      return;
    }

    const dragStartEvent = new DragStartSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      originalSource,
      container: this.currentContainer,
      originalEvent: event,
    });

    window.setTimeout(() => {
      if (this.currentContainer !== null) {
        this.eventDispatcher.trigger(dragStartEvent);
      }

      this.dragging = !dragStartEvent.defaultPrevented;
    }, 0);
  }

  private onDragOver(event: DragEvent) {
    if (!this.dragging || this.currentContainer === null) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const container = this.currentContainer;

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragMoveEvent);

    if (!dragMoveEvent.defaultPrevented) {
      event.preventDefault();
    }
  }

  private onDragEnd(event: DragEvent) {
    if (!this.dragging || this.currentContainer === null) {
      return;
    }

    document.removeEventListener('mouseup', this.onMouseUp.bind(this), true);

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const container = this.currentContainer;

    const dragStopEvent = new DragStopSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container,
      originalEvent: event,
    });

    this.eventDispatcher.trigger(dragStopEvent);

    this.dragging = false;

    this.reset();
  }

  private onDrop(event: DragEvent) {
    event.preventDefault();
  }

  private onMouseDown(event: MouseEvent) {
    // Firefox bug for inputs within draggables https://bugzilla.mozilla.org/show_bug.cgi?id=739071
    // @ts-expect-error unexpected fields
    if (event.target && (event.target.form || event.target.contenteditable)) {
      return;
    }

    const target = <HTMLElement | null>event.target;
    this.currentContainer = closest(target, this.containers);

    if (!this.currentContainer) {
      return;
    }

    if (
      target === null ||
      (this.options.handle !== null &&
        target.closest<HTMLElement>(this.options.handle) === null)
    ) {
      return;
    }

    const originalSource = target.closest<HTMLElement>(this.options.draggable);

    if (originalSource === null) {
      return;
    }

    const nativeDraggableElement = closest(
      event.target,
      (element) => element.draggable,
    );

    if (nativeDraggableElement) {
      nativeDraggableElement.draggable = false;
      this.nativeDraggableElement = nativeDraggableElement;
    }

    document.addEventListener('mouseup', this.onMouseUp.bind(this), true);
    document.addEventListener('dragstart', this.onDragStart.bind(this), false);
    document.addEventListener('dragover', this.onDragOver.bind(this), false);
    document.addEventListener('dragend', this.onDragEnd.bind(this), false);
    document.addEventListener('drop', this.onDrop.bind(this), false);

    this.mouseDownTimeout = window.setTimeout(() => {
      originalSource.draggable = true;
      this.draggableElement = originalSource;
    }, this.options.delay.drag);
  }

  private onMouseUp() {
    this.reset();
  }

  private reset() {
    if (this.mouseDownTimeout !== null) {
      window.clearTimeout(this.mouseDownTimeout);
    }

    document.removeEventListener('mouseup', this.onMouseUp.bind(this), true);
    document.removeEventListener(
      'dragstart',
      this.onDragStart.bind(this),
      false,
    );
    document.removeEventListener('dragover', this.onDragOver.bind(this), false);
    document.removeEventListener('dragend', this.onDragEnd.bind(this), false);
    document.removeEventListener('drop', this.onDrop.bind(this), false);

    if (this.nativeDraggableElement !== null) {
      this.nativeDraggableElement.draggable = true;
      this.nativeDraggableElement = null;
    }

    if (this.draggableElement !== null) {
      this.draggableElement.draggable = false;
      this.draggableElement = null;
    }
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
