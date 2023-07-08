import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

export type EventListener = (event: JrmDraggableEvent) => void;

export default class EventDispatcher {
  private readonly eventListeners: { [key: string]: EventListener[] };

  public constructor() {
    this.eventListeners = {};
  }

  public on(
    type: JrmDraggableEventType,
    ...eventListeners: EventListener[]
  ): this {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }

    this.eventListeners[type].push(...eventListeners);

    return this;
  }

  public off(type: JrmDraggableEventType, eventListener: EventListener): this {
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
    const caughtErrors: any[] = [];

    for (const eventListener of eventListeners.reverse()) {
      try {
        eventListener(event);
      } catch (error) {
        caughtErrors.push(error);
      }
    }

    if (caughtErrors.length) {
      // Todo: add debug mode logs
      /* eslint-disable no-console */
      console.error(
        `Draggable caught errors while triggering '${event.type}'`,
        caughtErrors
      );
    }
  }
}
