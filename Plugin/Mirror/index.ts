import Draggable, {
  DraggableClassName,
} from '../../Draggable';
import SortableStartEvent from '../../Event/SortableStartEvent';
import SortableStopEvent from '../../Event/SortableStopEvent';
import MirrorCreateEvent from '../../Plugin/Mirror/MirrorEvent/MirrorCreateEvent';
import MirrorCreatedEvent from '../../Plugin/Mirror/MirrorEvent/MirrorCreatedEvent';
import MirrorAttachedEvent from '../../Plugin/Mirror/MirrorEvent/MirrorAttachedEvent';
import MirrorMoveEvent from '../../Plugin/Mirror/MirrorEvent/MirrorMoveEvent';
import MirrorDestroyEvent from '../../Plugin/Mirror/MirrorEvent/MirrorDestroyEvent';
import MirrorMovedEvent from '../../Plugin/Mirror/MirrorEvent/MirrorMovedEvent';
import DragMoveEvent from '../../Event/DragMoveEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';
import Plugin from '../../Plugin/Plugin';

export type MirrorOptions = {
  constrainDimensions: boolean;
  xAxis: boolean;
  yAxis: boolean;
  cursorOffsetX: number | null;
  cursorOffsetY: number | null;
  thresholdX: number | null;
  thresholdY: number | null;
  appendTo: any;
};

export const defaultOptions: MirrorOptions = {
  constrainDimensions: false,
  xAxis: true,
  yAxis: true,
  cursorOffsetX: null,
  cursorOffsetY: null,
  thresholdX: null,
  thresholdY: null,
  appendTo: null,
};

type ScrollOffset = {
  x: number;
  y: number;
};

type MirrorOffset = {
  left: number;
  top: number;
};

type Position = {
  x: number;
  y: number;
};

export default class Mirror implements Plugin {
  private draggable: Draggable;
  private readonly options: MirrorOptions;
  private scrollOffset: ScrollOffset;
  private initialScrollOffset: ScrollOffset;
  private lastMirrorMovedClient: Position;
  private mirror: HTMLElement | null;
  private mirrorOffset: MirrorOffset | null;
  private initialX: number | null;
  private initialY: number | null;
  private lastMovedX: number | null;
  private lastMovedY: number | null;

  public constructor(draggable: Draggable, options: Partial<MirrorOptions>) {
    this.draggable = draggable;
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.scrollOffset = {
      x: 0,
      y: 0,
    };
    this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY,
    };
    this.lastMirrorMovedClient = {
      x: 0,
      y: 0,
    };
    this.mirror = null;
    this.mirrorOffset = null;
    this.initialX = null;
    this.initialY = null;
    this.lastMovedX = null;
    this.lastMovedY = null;

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onMirrorCreated = this.onMirrorCreated.bind(this);
    this.onMirrorMove = this.onMirrorMove.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  public attach() {
    this.draggable
      .on(JrmDraggableEventType.SORTABLE_START_EVENT, this.onDragStart)
      .on(JrmDraggableEventType.DRAG_MOVE_EVENT, this.onDragMove)
      .on(JrmDraggableEventType.SORTABLE_STOP_EVENT, this.onDragStop)
      .on(JrmDraggableEventType.MIRROR_CREATED_EVENT, this.onMirrorCreated)
      .on(JrmDraggableEventType.MIRROR_MOVE_EVENT, this.onMirrorMove);
  }

  public detach() {
    this.draggable
      .off(JrmDraggableEventType.SORTABLE_START_EVENT, this.onDragStart)
      .off(JrmDraggableEventType.DRAG_MOVE_EVENT, this.onDragMove)
      .off(JrmDraggableEventType.SORTABLE_STOP_EVENT, this.onDragStop)
      .off(JrmDraggableEventType.MIRROR_CREATED_EVENT, this.onMirrorCreated)
      .off(JrmDraggableEventType.MIRROR_MOVE_EVENT, this.onMirrorMove);
  }

  private onDragStart(dragEvent: SortableStartEvent) {
    if (dragEvent.defaultPrevented) {
      return;
    }

    if ('ontouchstart' in window) {
      document.addEventListener('scroll', this.onScroll, true);
    }

    this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const { source, originalSource, sensorEvent } = dragEvent;
    const startContainer = <HTMLElement>dragEvent.startContainer;

    this.lastMirrorMovedClient = {
      x: sensorEvent.clientX,
      y: sensorEvent.clientY,
    };

    const mirrorCreateEvent = new MirrorCreateEvent({
      source,
      originalSource,
      sourceContainer: startContainer,
      dragStartEvent: dragEvent,
    });

    this.draggable.trigger(mirrorCreateEvent);

    if (isNativeDragEvent(sensorEvent) || mirrorCreateEvent.defaultPrevented) {
      return;
    }

    this.mirror = <HTMLElement>source.cloneNode(true);

    const mirrorCreatedEvent = new MirrorCreatedEvent({
      source,
      originalSource,
      sourceContainer: startContainer,
      mirror: this.mirror,
      dragStartEvent: dragEvent,
    });

    const mirrorAttachedEvent = new MirrorAttachedEvent({
      source,
      originalSource,
      sourceContainer: startContainer,
      mirror: this.mirror,
      dragStartEvent: dragEvent,
    });

    this.draggable.trigger(mirrorCreatedEvent);
    document.body.appendChild(this.mirror);
    this.draggable.trigger(mirrorAttachedEvent);
  }

  private onDragMove(dragEvent: DragMoveEvent) {
    if (this.mirror === null || dragEvent.defaultPrevented) {
      return;
    }

    const { source, originalSource, sourceContainer, dragMoveSensorEvent } =
      dragEvent;

    let passedThreshX = true;
    let passedThreshY = true;

    if (this.options.thresholdX || this.options.thresholdY) {
      const { x: lastX, y: lastY } = this.lastMirrorMovedClient;

      if (
        this.options.thresholdX !== null &&
        Math.abs(lastX - dragMoveSensorEvent.clientX) < this.options.thresholdX
      ) {
        passedThreshX = false;
      } else {
        this.lastMirrorMovedClient.x = dragMoveSensorEvent.clientX;
      }

      if (
        this.options.thresholdY !== null &&
        Math.abs(lastY - dragMoveSensorEvent.clientY) < this.options.thresholdY
      ) {
        passedThreshY = false;
      } else {
        this.lastMirrorMovedClient.y = dragMoveSensorEvent.clientY;
      }

      if (!passedThreshX && !passedThreshY) {
        return;
      }
    }

    const mirrorMoveEvent = new MirrorMoveEvent({
      source,
      originalSource,
      sourceContainer,
      dragMoveEvent: dragEvent,
      mirror: this.mirror,
      passedThreshX,
      passedThreshY,
    });

    this.draggable.trigger(mirrorMoveEvent);
  }

  private onDragStop(dragEvent: SortableStopEvent) {
    if ('ontouchstart' in window) {
      document.removeEventListener('scroll', this.onScroll, true);
    }

    this.initialScrollOffset = { x: 0, y: 0 };
    this.scrollOffset = { x: 0, y: 0 };

    if (this.mirror === null) {
      return;
    }

    const { source, oldContainer } = dragEvent;

    const mirrorDestroyEvent = new MirrorDestroyEvent({
      source,
      mirror: this.mirror,
      sourceContainer: oldContainer,
      dragStopEvent: dragEvent,
    });

    this.draggable.trigger(mirrorDestroyEvent);

    if (!mirrorDestroyEvent.defaultPrevented) {
      this.mirror.remove();
    }
  }

  private onScroll() {
    this.scrollOffset = {
      x: window.scrollX - this.initialScrollOffset.x,
      y: window.scrollY - this.initialScrollOffset.y,
    };
  }

  private onMirrorCreated({ mirror, source, dragStartEvent }: MirrorCreatedEvent) {
    const mirrorClasses = this.draggable.getClassNamesFor(
      DraggableClassName.MIRROR
    );
    const setState = ({ mirrorOffset, initialX, initialY, ...args }) => {
      this.mirrorOffset = mirrorOffset;
      this.initialX = initialX;
      this.initialY = initialY;
      this.lastMovedX = initialX;
      this.lastMovedY = initialY;

      return { mirrorOffset, initialX, initialY, ...args };
    };

    mirror.style.display = 'none';

    const initialState = {
      mirror,
      source,
      sensorEvent: dragStartEvent.sensorEvent,
      mirrorClasses,
      scrollOffset: this.scrollOffset,
      options: this.options,
      passedThreshX: true,
      passedThreshY: true,
      initial: true,
    };

    return (
      Promise.resolve(initialState)
        // Fix reflow here
        .then(computeMirrorDimensions)
        .then(calculateMirrorOffset)
        .then(resetMirror)
        .then(addMirrorClasses)
        .then(positionMirror)
        .then(removeMirrorID)
        .then(setState)
    );
  }

  private onMirrorMove(mirrorEvent: MirrorMoveEvent) {
    if (mirrorEvent.defaultPrevented) {
      return null;
    }

    const setState = ({ lastMovedX, lastMovedY, ...args }) => {
      this.lastMovedX = lastMovedX;
      this.lastMovedY = lastMovedY;

      return { lastMovedX, lastMovedY, ...args };
    };
    const triggerMoved = (args) => {
      if (this.mirror === null) {
        return;
      }

      const mirrorMovedEvent = new MirrorMovedEvent({
        source: mirrorEvent.source,
        originalSource: mirrorEvent.originalSource,
        sourceContainer: mirrorEvent.sourceContainer,
        dragMoveEvent: mirrorEvent.dragMoveEvent,
        mirror: this.mirror,
        passedThreshX: mirrorEvent.passedThreshX,
        passedThreshY: mirrorEvent.passedThreshY,
      });

      this.draggable.trigger(mirrorMovedEvent);

      return args;
    };

    const initialState = {
      mirror: mirrorEvent.mirror,
      sensorEvent: mirrorEvent.dragMoveEvent.dragMoveSensorEvent,
      mirrorOffset: this.mirrorOffset,
      options: this.options,
      initialX: this.initialX,
      initialY: this.initialY,
      scrollOffset: this.scrollOffset,
      passedThreshX: mirrorEvent.passedThreshX,
      passedThreshY: mirrorEvent.passedThreshY,
      lastMovedX: this.lastMovedX,
      lastMovedY: this.lastMovedY,
      initial: false,
    };

    return Promise.resolve(initialState)
      .then(positionMirror)
      .then(setState)
      .then(triggerMoved);
  }
}

function computeMirrorDimensions({ source, ...args }): Promise<any> {
  return withPromise((resolve) => {
    resolve({
      source,
      sourceRect: source.getBoundingClientRect(),
      ...args,
    });
  });
}

function calculateMirrorOffset({
  sensorEvent,
  sourceRect,
  options,
  ...args
}): Promise<any> {
  return withPromise((resolve) => {
    const top: number =
      options.cursorOffsetY === null
        ? sensorEvent.clientY - sourceRect.top
        : options.cursorOffsetY;
    const left: number =
      options.cursorOffsetX === null
        ? sensorEvent.clientX - sourceRect.left
        : options.cursorOffsetX;

    resolve({
      sensorEvent,
      sourceRect,
      mirrorOffset: { top, left },
      options,
      ...args,
    });
  });
}

function resetMirror({ mirror, source, options, ...args }): Promise<any> {
  return withPromise((resolve) => {
    mirror.style.display = null;
    mirror.style.position = 'fixed';
    mirror.style.pointerEvents = 'none';
    mirror.style.top = 0;
    mirror.style.left = 0;
    mirror.style.margin = 0;

    if (options.constrainDimensions) {
      const computedSourceStyles = getComputedStyle(source);

      mirror.style.height = computedSourceStyles.getPropertyValue('height');
      mirror.style.width = computedSourceStyles.getPropertyValue('width');
    }

    resolve({ mirror, source, options, ...args });
  });
}

function addMirrorClasses({ mirror, mirrorClasses, ...args }): Promise<any> {
  return withPromise((resolve) => {
    mirror.classList.add(...mirrorClasses);

    resolve({ mirror, mirrorClasses, ...args });
  });
}

function removeMirrorID({ mirror, ...args }): Promise<any> {
  return withPromise((resolve) => {
    mirror.removeAttribute('id');
    delete mirror.id;

    resolve({ mirror, ...args });
  });
}

function positionMirror({
  mirror,
  sensorEvent,
  mirrorOffset,
  initialY,
  initialX,
  scrollOffset,
  options,
  passedThreshX,
  passedThreshY,
  lastMovedX,
  lastMovedY,
  initial,
  ...args
}: any): Promise<any> {
  return withPromise(
    (resolve) => {
      const result = {
        mirror,
        sensorEvent,
        mirrorOffset,
        options,
        ...args,
      };

      if (mirrorOffset) {
        const x = passedThreshX
          ? Math.round(
              (sensorEvent.clientX - mirrorOffset.left - scrollOffset.x) /
                (options.thresholdX || 1)
            ) * (options.thresholdX || 1)
          : Math.round(lastMovedX);
        const y = passedThreshY
          ? Math.round(
              (sensorEvent.clientY - mirrorOffset.top - scrollOffset.y) /
                (options.thresholdY || 1)
            ) * (options.thresholdY || 1)
          : Math.round(lastMovedY);

        if ((options.xAxis && options.yAxis) || initial) {
          mirror.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        } else if (options.xAxis && !options.yAxis) {
          mirror.style.transform = `translate3d(${x}px, ${initialY}px, 0)`;
        } else if (options.yAxis && !options.xAxis) {
          mirror.style.transform = `translate3d(${initialX}px, ${y}px, 0)`;
        }

        if (initial) {
          result.initialX = x;
          result.initialY = y;
        }

        result.lastMovedX = x;
        result.lastMovedY = y;
      }

      resolve(result);
    },
    { raf: !initial }
  );
}

function withPromise(callback, { raf = false } = {}) {
  return new Promise((resolve, reject) => {
    if (raf) {
      requestAnimationFrame(() => {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}

function isNativeDragEvent(sensorEvent) {
  return /^drag/.test(sensorEvent.originalEvent.type);
}
