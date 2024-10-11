import EventDispatcher, {
  type EventListener,
  type EventMap,
} from './EventDispatcher/EventDispatcher';
import DragStopSensorEvent from './Sensor/Event/DragStopSensorEvent';
import ElementMover from './Service/ElementMover';
import JrmDraggableEvent from './Shared/Event/JrmDraggableEvent';
import SortableSortedEvent from './Event/SortableSortedEvent';
import SortableSortEvent from './Event/SortableSortEvent';
import SortableStartEvent from './Event/SortableStartEvent';
import SortableStopEvent from './Event/SortableStopEvent';
import MirrorCreatedEvent from './Plugin/Mirror/MirrorEvent/MirrorCreatedEvent';
import type Plugin from './Plugin/Plugin';
import type Sensor from './Sensor/Sensor';
import closest from './Shared/utils/closest';
import DragMoveEvent from './Event/DragMoveEvent';
import DragOverEvent from './Event/DragOverEvent';
import DragOutEvent from './Event/DragOutEvent';
import DragOutContainerEvent from './Event/DragOutContainerEvent';
import DragOverContainerEvent from './Event/DragOverContainerEvent';
import DragStoppedEvent from './Event/DragStoppedEvent';
import DragPressureEvent from './Event/DragPressureEvent';
import DraggableDestroyEvent from './Event/DraggableDestroyEvent';
import DragStartSensorEvent from './Sensor/Event/DragStartSensorEvent';
import DragMoveSensorEvent from './Sensor/Event/DragMoveSensorEvent';
import DragPressureSensorEvent from './Sensor/Event/DragPressureSensorEvent';
import JrmDraggableEventType from './Shared/Event/JrmDraggableEventType';

export type Delay = {
  mouse: number;
  drag: number;
  touch: number;
};

export type DraggableOptions = {
  draggable: string;
  handle: string | null;
  delay: Delay;
  classes: { [key: string]: string | string[] };
  distance: number;
  placedTimeout: number;
  sensors: SensorConstructor[];
};

export type SensorConstructor = {
  new (containers: HTMLElement[], options: DraggableOptions): Sensor;
};

export enum DraggableClassName {
  CONTAINER_DRAGGING = 'container:dragging',
  SOURCE_DRAGGING = 'source:dragging',
  SOURCE_PLACED = 'source:placed',
  CONTAINER_PLACED = 'container:placed',
  BODY_DRAGGING = 'body:dragging',
  DRAGGABLE_OVER = 'draggable:over',
  CONTAINER_OVER = 'container:over',
  SOURCE_ORIGINAL = 'source:original',
  MIRROR = 'mirror',
}

const defaultClasses = {
  [DraggableClassName.CONTAINER_DRAGGING]: 'draggable-container--is-dragging',
  [DraggableClassName.SOURCE_DRAGGING]: 'draggable-source--is-dragging',
  [DraggableClassName.SOURCE_PLACED]: 'draggable-source--placed',
  [DraggableClassName.CONTAINER_PLACED]: 'draggable-container--placed',
  [DraggableClassName.BODY_DRAGGING]: 'draggable--is-dragging',
  [DraggableClassName.DRAGGABLE_OVER]: 'draggable--over',
  [DraggableClassName.CONTAINER_OVER]: 'draggable-container--over',
  [DraggableClassName.SOURCE_ORIGINAL]: 'draggable--original',
  [DraggableClassName.MIRROR]: 'draggable-mirror',
};

export const defaultOptions: DraggableOptions = {
  draggable: '.draggable-source',
  handle: null,
  delay: {
    mouse: 0,
    drag: 0,
    touch: 100,
  },
  classes: defaultClasses,
  distance: 0,
  placedTimeout: 800,
  sensors: [],
};

export default class Draggable {
  public containers: HTMLElement[];
  public options: DraggableOptions;
  private readonly eventDispatcher: EventDispatcher;
  private readonly elementMover: ElementMover;
  private readonly plugins: Plugin[];
  private readonly sensors: Sensor[];
  private dragging: boolean;
  private mirror: HTMLElement | null;
  private originalSource: HTMLElement | null;
  private sourceContainer: HTMLElement | null;
  private lastPlacedSource: HTMLElement | null;
  private placedTimeoutID: number | null;
  private source: HTMLElement | null;
  private lastPlacedContainer: HTMLElement | null;
  private currentOverContainer: HTMLElement | null;
  private currentOver: HTMLElement | null;
  private startIndex: number | null;
  private startContainerIndex: number | null;

  public constructor(
    containers: HTMLElement[],
    options: Partial<DraggableOptions> = {},
  ) {
    this.containers = containers;
    this.options = {
      ...defaultOptions,
      ...options,
      classes: {
        ...defaultClasses,
        ...(options.classes || {}),
      },
    };

    this.eventDispatcher = new EventDispatcher();
    this.elementMover = new ElementMover();
    this.dragging = false;
    this.plugins = [];
    this.sensors = [];
    this.mirror = null;
    this.originalSource = null;
    this.sourceContainer = null;
    this.lastPlacedSource = null;
    this.placedTimeoutID = null;
    this.source = null;
    this.lastPlacedContainer = null;
    this.currentOverContainer = null;
    this.currentOver = null;
    this.startIndex = null;
    this.startContainerIndex = null;

    this.onDraggableStart = this.onDraggableStart.bind(this);
    this.onDraggableMove = this.onDraggableMove.bind(this);
    this.onDraggableStop = this.onDraggableStop.bind(this);
    this.onDraggablePressure = this.onDraggablePressure.bind(this);
    this.draggableStop = this.draggableStop.bind(this);

    this.addSensors(this.options.sensors);

    this.on(
      JrmDraggableEventType.MIRROR_CREATED_EVENT,
      (event: MirrorCreatedEvent): void => {
        this.mirror = event.mirror;
      },
    );
    this.on(JrmDraggableEventType.MIRROR_DESTROY_EVENT, () => {
      this.mirror = null;
    });
  }

  public addPlugin(plugin: Plugin) {
    this.plugins.push(plugin);

    plugin.attach();
  }

  public getDraggableElementsForContainer(container): HTMLElement[] {
    const allDraggableElements = container.querySelectorAll(
      this.options.draggable,
    );

    return [...allDraggableElements].filter((childElement) => {
      return (
        childElement !== this.originalSource && childElement !== this.mirror
      );
    });
  }

  public cancel() {
    this.draggableStop();
  }

  private onDraggableStart(dragStartSensorEvent: DragStartSensorEvent) {
    const { target, container, originalSource } = dragStartSensorEvent;

    if (!this.containers.includes(container)) {
      return;
    }

    if (
      this.options.handle !== null &&
      target !== null &&
      target.closest<HTMLElement>(this.options.handle) === null
    ) {
      dragStartSensorEvent.preventDefault();

      return;
    }

    this.originalSource = originalSource;
    this.sourceContainer = container;

    if (this.lastPlacedSource && this.lastPlacedContainer) {
      if (this.placedTimeoutID !== null) {
        window.clearTimeout(this.placedTimeoutID);
      }

      this.lastPlacedSource.classList.remove(
        ...this.getClassNamesFor(DraggableClassName.SOURCE_PLACED),
      );
      this.lastPlacedContainer.classList.remove(
        ...this.getClassNamesFor(DraggableClassName.CONTAINER_PLACED),
      );
    }

    this.source = <HTMLElement>this.originalSource.cloneNode(true);
    this.originalSource.parentNode?.insertBefore(
      this.source,
      this.originalSource,
    );
    this.originalSource.style.display = 'none';
    this.startIndex = this.index(this.source);
    this.startContainerIndex = this.containers.indexOf(
      <HTMLElement>this.sourceContainer,
    );

    const sortableStartEvent = new SortableStartEvent({
      sensorEvent: dragStartSensorEvent,
      source: this.source,
      originalSource: this.originalSource,
      startIndex: this.startIndex,
      startContainerIndex: this.startContainerIndex,
      startContainer: this.sourceContainer,
    });

    this.trigger(sortableStartEvent);

    this.dragging = !sortableStartEvent.defaultPrevented;

    if (sortableStartEvent.defaultPrevented) {
      this.source.remove();

      if (this.originalSource !== null) {
        this.originalSource.style.display = '';
      }

      return;
    }

    this.originalSource.classList.add(
      ...this.getClassNamesFor(DraggableClassName.SOURCE_ORIGINAL),
    );
    this.source.classList.add(
      ...this.getClassNamesFor(DraggableClassName.SOURCE_DRAGGING),
    );
    this.sourceContainer.classList.add(
      ...this.getClassNamesFor(DraggableClassName.CONTAINER_DRAGGING),
    );
    document.body.classList.add(
      ...this.getClassNamesFor(DraggableClassName.BODY_DRAGGING),
    );
    applyUserSelect(document.body, 'none');

    requestAnimationFrame(() => {
      this.onDraggableMove(
        new DragMoveSensorEvent({
          clientX: dragStartSensorEvent.clientX,
          clientY: dragStartSensorEvent.clientY,
          container: dragStartSensorEvent.container,
          originalEvent: dragStartSensorEvent.originalEvent,
          target: this.source,
        }),
      );
    });
  }

  onDraggableMove(dragMoveSensorEvent: DragMoveSensorEvent) {
    if (
      !this.dragging ||
      this.source === null ||
      this.originalSource === null
    ) {
      return;
    }

    const { container } = dragMoveSensorEvent;
    const dragMoveEvent = new DragMoveEvent({
      source: this.source,
      originalSource: this.originalSource,
      sourceContainer: container,
      dragMoveSensorEvent,
    });

    this.trigger(dragMoveEvent);

    if (dragMoveEvent.defaultPrevented) {
      dragMoveSensorEvent.preventDefault();
    }

    const target =
      dragMoveSensorEvent.target?.closest<HTMLElement>(
        this.options.draggable,
      ) || null;
    const overContainer = closest(dragMoveSensorEvent.target, this.containers);

    if (this.currentOver && target !== this.currentOver) {
      const dragOutEvent = new DragOutEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: dragMoveSensorEvent,
        over: this.currentOver,
        overContainer: this.currentOverContainer,
      });

      if (this.currentOver) {
        this.currentOver.classList.remove(
          ...this.getClassNamesFor(DraggableClassName.DRAGGABLE_OVER),
        );
      }
      this.currentOver = null;

      this.trigger(dragOutEvent);
    }

    if (
      this.currentOverContainer &&
      overContainer !== this.currentOverContainer
    ) {
      const dragOutContainerEvent = new DragOutContainerEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: dragMoveSensorEvent,
        overContainer: this.currentOverContainer,
      });

      this.currentOverContainer.classList.remove(
        ...this.getClassNamesFor(DraggableClassName.CONTAINER_OVER),
      );
      this.currentOverContainer = null;

      this.trigger(dragOutContainerEvent);
    }

    if (overContainer && target && this.currentOver !== target) {
      overContainer.classList.add(
        ...this.getClassNamesFor(DraggableClassName.CONTAINER_OVER),
      );

      const dragOverContainerEvent = new DragOverContainerEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: dragMoveSensorEvent,
        overContainer,
      });

      this.currentOverContainer = overContainer;

      this.trigger(dragOverContainerEvent);

      this.handleDragOverContainerEvent(dragOverContainerEvent);
    }

    if (
      overContainer !== null &&
      target !== null &&
      this.currentOver !== target
    ) {
      target.classList.add(
        ...this.getClassNamesFor(DraggableClassName.DRAGGABLE_OVER),
      );

      const dragOverEvent = new DragOverEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: dragMoveSensorEvent,
        overContainer,
        over: target,
      });

      this.currentOver = target;

      this.trigger(dragOverEvent);

      this.handleDragOverEvent(dragOverEvent);
    }
  }

  draggableStop(sensorEvent: DragStopSensorEvent | null = null) {
    if (
      !this.dragging ||
      this.source === null ||
      this.originalSource === null ||
      this.startIndex === null ||
      this.startContainerIndex === null ||
      this.sourceContainer === null
    ) {
      return;
    }

    this.dragging = false;

    const sortableStopEvent = new SortableStopEvent({
      source: this.source,
      oldIndex: this.startIndex,
      newIndex: this.index(this.source),
      oldContainerIndex: this.startContainerIndex,
      newContainerIndex: this.containers.indexOf(
        <HTMLElement>this.source.parentNode,
      ),
      oldContainer: this.sourceContainer,
      newContainer: <HTMLElement>this.source.parentNode,
    });

    this.trigger(sortableStopEvent);

    this.startIndex = null;
    this.source.remove();
    this.originalSource.style.display = '';

    this.source.classList.remove(
      ...this.getClassNamesFor(DraggableClassName.SOURCE_DRAGGING),
    );
    this.originalSource.classList.remove(
      ...this.getClassNamesFor(DraggableClassName.SOURCE_ORIGINAL),
    );
    this.originalSource.classList.add(
      ...this.getClassNamesFor(DraggableClassName.SOURCE_PLACED),
    );
    this.sourceContainer.classList.add(
      ...this.getClassNamesFor(DraggableClassName.CONTAINER_PLACED),
    );
    this.sourceContainer.classList.remove(
      ...this.getClassNamesFor(DraggableClassName.CONTAINER_DRAGGING),
    );
    document.body.classList.remove(
      ...this.getClassNamesFor(DraggableClassName.BODY_DRAGGING),
    );
    applyUserSelect(document.body, '');

    if (this.currentOver) {
      this.currentOver.classList.remove(
        ...this.getClassNamesFor(DraggableClassName.DRAGGABLE_OVER),
      );
    }

    if (this.currentOverContainer) {
      this.currentOverContainer.classList.remove(
        ...this.getClassNamesFor(DraggableClassName.CONTAINER_OVER),
      );
    }

    this.lastPlacedSource = this.originalSource;
    this.lastPlacedContainer = this.sourceContainer;

    this.placedTimeoutID = window.setTimeout(() => {
      if (this.lastPlacedSource) {
        this.lastPlacedSource.classList.remove(
          ...this.getClassNamesFor(DraggableClassName.SOURCE_PLACED),
        );
      }

      if (this.lastPlacedContainer) {
        this.lastPlacedContainer.classList.remove(
          ...this.getClassNamesFor(DraggableClassName.CONTAINER_PLACED),
        );
      }

      this.lastPlacedSource = null;
      this.lastPlacedContainer = null;
    }, this.options.placedTimeout);

    const dragStoppedEvent = new DragStoppedEvent({
      source: this.source,
      originalSource: this.originalSource,
      sourceContainer: this.sourceContainer,
      sensorEvent,
    });

    this.trigger(dragStoppedEvent);

    this.source = null;
    this.originalSource = null;
    this.currentOverContainer = null;
    this.currentOver = null;
    this.sourceContainer = null;
  }

  onDraggableStop(event: DragStopSensorEvent) {
    this.draggableStop(event);
  }

  onDraggablePressure(sensorEvent: DragPressureSensorEvent) {
    if (!this.dragging) {
      return;
    }

    const eventTarget = <HTMLElement>sensorEvent.originalEvent.target;
    const source =
      this.source || eventTarget?.closest<HTMLElement>(this.options.draggable);

    const dragPressureEvent = new DragPressureEvent({
      sensorEvent,
      source,
      pressure: sensorEvent.pressure,
    });

    this.trigger(dragPressureEvent);
  }

  private handleDragOverContainerEvent(event: DragOverContainerEvent) {
    if (event.defaultPrevented) {
      return;
    }

    const { source, overContainer } = event;
    const over = null;
    const oldIndex = this.index(source);
    const sortableSortEvent = new SortableSortEvent({
      dragEvent: event,
      currentIndex: oldIndex,
      source,
      over,
    });

    this.trigger(sortableSortEvent);

    if (sortableSortEvent.defaultPrevented) {
      return;
    }

    const children = this.getSortableElementsForContainer(overContainer);
    const moves = this.elementMover.move({
      source,
      over,
      overContainer,
      children,
    });

    if (moves === null) {
      return;
    }

    const { oldContainer, newContainer } = moves;
    const newIndex = this.index(event.source);

    const sortableSortedEvent = new SortableSortedEvent({
      dragEvent: event,
      oldIndex,
      newIndex,
      oldContainer,
      newContainer,
    });

    this.trigger(sortableSortedEvent);
  }

  private handleDragOverEvent(event: DragOverEvent) {
    const { source, over, overContainer, originalSource } = event;

    if (over === originalSource || over === source) {
      return;
    }

    const oldIndex = this.index(source);
    const sortableSortEvent = new SortableSortEvent({
      dragEvent: event,
      currentIndex: oldIndex,
      source,
      over,
    });

    this.trigger(sortableSortEvent);

    if (sortableSortEvent.defaultPrevented) {
      return;
    }

    const children = this.getDraggableElementsForContainer(overContainer);
    const moves = this.elementMover.move({
      source,
      over,
      overContainer,
      children,
    });

    if (moves === null) {
      return;
    }

    const { oldContainer, newContainer } = moves;
    const newIndex = this.index(source);

    const sortableSortedEvent = new SortableSortedEvent({
      dragEvent: event,
      oldIndex,
      newIndex,
      oldContainer,
      newContainer,
    });

    this.trigger(sortableSortedEvent);
  }

  public getClassNamesFor(name: DraggableClassName): string[] {
    const classNames = this.options.classes[name];

    return typeof classNames === 'string' ? [classNames] : classNames;
  }

  public refresh(
    containers: HTMLElement[],
    options: Partial<DraggableOptions>,
  ) {
    this.detachPlugins();
    this.detachSensors();

    this.containers = containers;
    this.options = {
      ...defaultOptions,
      ...options,
      classes: {
        ...defaultClasses,
        ...(options.classes || {}),
      },
    };
    this.addSensors(this.options.sensors);
    this.attachPlugins();
  }

  public destroy() {
    this.trigger(new DraggableDestroyEvent(this));

    this.detachPlugins();
    this.detachSensors();
  }

  public on<T extends JrmDraggableEventType>(
    type: T,
    ...callbacks: EventListener<EventMap[T]>[]
  ) {
    this.eventDispatcher.on(type, ...callbacks);

    return this;
  }

  public off<T extends JrmDraggableEventType>(
    type: T,
    callback: EventListener<EventMap[T]>,
  ) {
    this.eventDispatcher.off(type, callback);

    return this;
  }

  public trigger(event: JrmDraggableEvent) {
    this.eventDispatcher.trigger(event);
  }

  private index(element: HTMLElement) {
    return this.getSortableElementsForContainer(
      <HTMLElement>element.parentNode,
    ).indexOf(element);
  }

  private getSortableElementsForContainer(container: HTMLElement) {
    const allSortableElements = container.querySelectorAll<HTMLElement>(
      this.options.draggable,
    );

    return Array.from(allSortableElements).filter(
      (childElement) =>
        childElement !== this.originalSource &&
        childElement !== this.mirror &&
        childElement.parentNode === container,
    );
  }

  private addSensors(sensors: SensorConstructor[]) {
    for (const Sensor of sensors) {
      const sensor = new Sensor(this.containers, this.options);

      sensor.on(
        JrmDraggableEventType.DRAG_START_SENSOR_EVENT,
        this.onDraggableStart,
      );
      sensor.on(
        JrmDraggableEventType.DRAG_MOVE_SENSOR_EVENT,
        this.onDraggableMove,
      );
      sensor.on(
        JrmDraggableEventType.DRAG_STOP_SENSOR_EVENT,
        this.onDraggableStop,
      );
      sensor.on(
        JrmDraggableEventType.DRAG_PRESSURE_SENSOR_EVENT,
        this.onDraggablePressure,
      );

      sensor.attach();

      this.sensors.push(sensor);
    }
  }

  private detachPlugins() {
    for (const plugin of this.plugins) {
      plugin.detach();
    }
  }

  private attachPlugins() {
    for (const plugin of this.plugins) {
      plugin.attach();
    }
  }

  private detachSensors() {
    for (const sensor of this.sensors) {
      sensor.detach();
    }
  }
}

function applyUserSelect(element, value) {
  element.style.webkitUserSelect = value;
  element.style.mozUserSelect = value;
  element.style.msUserSelect = value;
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}
