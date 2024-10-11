import type DraggableDestroyEvent from '../Event/DraggableDestroyEvent';
import type DragMoveEvent from '../Event/DragMoveEvent';
import type DragOutContainerEvent from '../Event/DragOutContainerEvent';
import type DragOutEvent from '../Event/DragOutEvent';
import type DragOverContainerEvent from '../Event/DragOverContainerEvent';
import type DragOverEvent from '../Event/DragOverEvent';
import type DragPressureEvent from '../Event/DragPressureEvent';
import type DragStoppedEvent from '../Event/DragStoppedEvent';
import type SortableSortedEvent from '../Event/SortableSortedEvent';
import type SortableSortEvent from '../Event/SortableSortEvent';
import type SortableStartEvent from '../Event/SortableStartEvent';
import type SortableStopEvent from '../Event/SortableStopEvent';
import type MirrorAttachedEvent from '../Plugin/Mirror/MirrorEvent/MirrorAttachedEvent';
import type MirrorCreatedEvent from '../Plugin/Mirror/MirrorEvent/MirrorCreatedEvent';
import type MirrorCreateEvent from '../Plugin/Mirror/MirrorEvent/MirrorCreateEvent';
import type MirrorDestroyEvent from '../Plugin/Mirror/MirrorEvent/MirrorDestroyEvent';
import type MirrorMovedEvent from '../Plugin/Mirror/MirrorEvent/MirrorMovedEvent';
import type MirrorMoveEvent from '../Plugin/Mirror/MirrorEvent/MirrorMoveEvent';
import type DragMoveSensorEvent from '../Sensor/Event/DragMoveSensorEvent';
import type DragPressureSensorEvent from '../Sensor/Event/DragPressureSensorEvent';
import type DragStartSensorEvent from '../Sensor/Event/DragStartSensorEvent';
import type DragStopSensorEvent from '../Sensor/Event/DragStopSensorEvent';
import type JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import type JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

export interface EventMap {
  [JrmDraggableEventType.DRAG_MOVE_EVENT]: DragMoveEvent;
  [JrmDraggableEventType.DRAG_OUT_CONTAINER_EVENT]: DragOutContainerEvent;
  [JrmDraggableEventType.DRAG_OUT_EVENT]: DragOutEvent;
  [JrmDraggableEventType.DRAG_OVER_CONTAINER_EVENT]: DragOverContainerEvent;
  [JrmDraggableEventType.DRAG_OVER_EVENT]: DragOverEvent;
  [JrmDraggableEventType.DRAG_PRESSURE_EVENT]: DragPressureEvent;
  [JrmDraggableEventType.DRAG_STOPPED_EVENT]: DragStoppedEvent;
  [JrmDraggableEventType.DRAGGABLE_DESTROY_EVENT]: DraggableDestroyEvent;
  [JrmDraggableEventType.MIRROR_ATTACHED_EVENT]: MirrorAttachedEvent;
  [JrmDraggableEventType.MIRROR_CREATED_EVENT]: MirrorCreatedEvent;
  [JrmDraggableEventType.MIRROR_CREATE_EVENT]: MirrorCreateEvent;
  [JrmDraggableEventType.MIRROR_DESTROY_EVENT]: MirrorDestroyEvent;
  [JrmDraggableEventType.MIRROR_MOVED_EVENT]: MirrorMovedEvent;
  [JrmDraggableEventType.MIRROR_MOVE_EVENT]: MirrorMoveEvent;
  [JrmDraggableEventType.DRAG_MOVE_SENSOR_EVENT]: DragMoveSensorEvent;
  [JrmDraggableEventType.DRAG_PRESSURE_SENSOR_EVENT]: DragPressureSensorEvent;
  [JrmDraggableEventType.DRAG_START_SENSOR_EVENT]: DragStartSensorEvent;
  [JrmDraggableEventType.DRAG_STOP_SENSOR_EVENT]: DragStopSensorEvent;
  [JrmDraggableEventType.SORTABLE_SORTED_EVENT]: SortableSortedEvent;
  [JrmDraggableEventType.SORTABLE_SORT_EVENT]: SortableSortEvent;
  [JrmDraggableEventType.SORTABLE_START_EVENT]: SortableStartEvent;
  [JrmDraggableEventType.SORTABLE_STOP_EVENT]: SortableStopEvent;
}
export type EventListener<T> = (event: T) => void;

export default class EventDispatcher {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly eventListeners: any;

  public constructor() {
    this.eventListeners = {};
  }

  public on<T extends JrmDraggableEventType>(
    type: T,
    ...eventListeners: EventListener<EventMap[T]>[]
  ): this {
    if (this.eventListeners[type] === undefined) {
      this.eventListeners[type] = [];
    }

    this.eventListeners[type].push(...eventListeners);

    return this;
  }

  public off<T extends JrmDraggableEventType>(
    type: T,
    eventListener: EventListener<EventMap[T]>,
  ): this {
    if (!this.eventListeners[type]) {
      return this;
    }

    const eventListeners = this.eventListeners[type];

    for (let i = 0; i < eventListeners.length; i++) {
      if (eventListener === eventListeners[i]) {
        this.eventListeners[type].splice(i, 1);

        return this;
      }
    }

    return this;
  }

  public trigger(event: JrmDraggableEvent) {
    if (!this.eventListeners[event.type]) {
      return;
    }

    const eventListeners = [...this.eventListeners[event.type]];
    const caughtErrors: unknown[] = [];

    for (const eventListener of eventListeners.reverse()) {
      try {
        eventListener(event);
      } catch (error: unknown) {
        caughtErrors.push(error);
      }
    }

    if (caughtErrors.length) {
      // Todo: add debug mode logs

      console.error(
        `Draggable caught errors while triggering '${event.type}'`,
        caughtErrors,
      );
    }
  }
}
