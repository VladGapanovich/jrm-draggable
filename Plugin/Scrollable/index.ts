import SortableStartEvent from '../../Event/SortableStartEvent';
import type Plugin from '../../Plugin/Plugin';
import closest from '../../Shared/utils/closest';
import Draggable from '../../Draggable';
import DragMoveEvent from '../../Event/DragMoveEvent';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

export type ScrollableOptions = {
  speed: number;
  sensitivity: number;
  scrollableElements: HTMLElement[];
};

type Position = {
  clientX: number;
  clientY: number;
};

const defaultOptions: ScrollableOptions = {
  speed: 6,
  sensitivity: 50,
  scrollableElements: [],
};

export default class Scrollable implements Plugin {
  private readonly draggable: Draggable;
  private readonly options: ScrollableOptions;
  private currentMousePosition: Position | null;
  private scrollAnimationFrame: number | null;
  private findScrollableElementFrame: number | null;
  private scrollableElement: HTMLElement | null;

  public constructor(
    draggable: Draggable,
    options: Partial<ScrollableOptions>,
  ) {
    this.draggable = draggable;
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.currentMousePosition = null;
    this.scrollAnimationFrame = null;
    this.findScrollableElementFrame = null;
    this.scrollableElement = null;

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.scroll = this.scroll.bind(this);
  }

  public attach() {
    this.draggable
      .on(JrmDraggableEventType.SORTABLE_START_EVENT, this.onDragStart)
      .on(JrmDraggableEventType.DRAG_MOVE_EVENT, this.onDragMove)
      .on(JrmDraggableEventType.SORTABLE_STOP_EVENT, this.onDragStop);
  }

  public detach() {
    this.draggable
      .off(JrmDraggableEventType.SORTABLE_START_EVENT, this.onDragStart)
      .off(JrmDraggableEventType.DRAG_MOVE_EVENT, this.onDragMove)
      .off(JrmDraggableEventType.SORTABLE_STOP_EVENT, this.onDragStop);
  }

  private getScrollableElement(target: Element) {
    if (this.hasDefinedScrollableElements()) {
      return (
        closest(target, this.options.scrollableElements) ||
        document.documentElement
      );
    }

    return closestScrollableElement(target);
  }

  private hasDefinedScrollableElements() {
    return this.options.scrollableElements.length !== 0;
  }

  private onDragStart(dragEvent: SortableStartEvent) {
    this.findScrollableElementFrame = requestAnimationFrame(() => {
      this.scrollableElement = this.getScrollableElement(dragEvent.source);
    });
  }

  private onDragMove(dragEvent: DragMoveEvent) {
    this.findScrollableElementFrame = requestAnimationFrame(() => {
      if (dragEvent.dragMoveSensorEvent.target !== null) {
        this.scrollableElement = this.getScrollableElement(
          dragEvent.dragMoveSensorEvent.target,
        );
      }
    });

    if (!this.scrollableElement) {
      return;
    }

    const sensorEvent = dragEvent.dragMoveSensorEvent;
    const scrollOffset = { x: 0, y: 0 };

    if ('ontouchstart' in window) {
      scrollOffset.y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      scrollOffset.x =
        window.scrollX ||
        document.documentElement.scrollLeft ||
        document.body.scrollLeft ||
        0;
    }

    this.currentMousePosition = {
      clientX: sensorEvent.clientX - scrollOffset.x,
      clientY: sensorEvent.clientY - scrollOffset.y,
    };

    this.scrollAnimationFrame = requestAnimationFrame(this.scroll);
  }

  private onDragStop() {
    if (this.scrollAnimationFrame !== null) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }

    if (this.findScrollableElementFrame !== null) {
      cancelAnimationFrame(this.findScrollableElementFrame);
    }

    this.scrollableElement = null;
    this.scrollAnimationFrame = null;
    this.findScrollableElementFrame = null;
    this.currentMousePosition = null;
  }

  private scroll() {
    if (!this.scrollableElement || !this.currentMousePosition) {
      return;
    }

    if (this.scrollAnimationFrame !== null) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }

    const { speed, sensitivity } = this.options;
    const rect = this.scrollableElement.getBoundingClientRect();
    const bottomCutOff = rect.bottom > window.innerHeight;
    const topCutOff = rect.top < 0;
    const cutOff = topCutOff || bottomCutOff;
    const documentScrollingElement = getDocumentScrollingElement();
    const scrollableElement = this.scrollableElement;
    const clientX = this.currentMousePosition.clientX;
    const clientY = this.currentMousePosition.clientY;

    if (
      scrollableElement !== document.body &&
      scrollableElement !== document.documentElement &&
      !cutOff
    ) {
      const { offsetHeight, offsetWidth } = scrollableElement;

      if (rect.top + offsetHeight - clientY < sensitivity) {
        scrollableElement.scrollTop += speed;
      } else if (clientY - rect.top < sensitivity) {
        scrollableElement.scrollTop -= speed;
      }

      if (rect.left + offsetWidth - clientX < sensitivity) {
        scrollableElement.scrollLeft += speed;
      } else if (clientX - rect.left < sensitivity) {
        scrollableElement.scrollLeft -= speed;
      }
    } else {
      const { innerHeight, innerWidth } = window;

      if (clientY < sensitivity) {
        documentScrollingElement.scrollTop -= speed;
      } else if (innerHeight - clientY < sensitivity) {
        documentScrollingElement.scrollTop += speed;
      }

      if (clientX < sensitivity) {
        documentScrollingElement.scrollLeft -= speed;
      } else if (innerWidth - clientX < sensitivity) {
        documentScrollingElement.scrollLeft += speed;
      }
    }

    this.scrollAnimationFrame = requestAnimationFrame(this.scroll);
  }
}

function hasOverflow(element) {
  const overflowRegex = /(auto|scroll)/;
  const computedStyles = getComputedStyle(element, null);
  const overflow =
    computedStyles.getPropertyValue('overflow') +
    computedStyles.getPropertyValue('overflow-y') +
    computedStyles.getPropertyValue('overflow-x');

  return overflowRegex.test(overflow);
}

function isStaticallyPositioned(element) {
  const position = getComputedStyle(element).getPropertyValue('position');

  return position === 'static';
}

function closestScrollableElement(element) {
  if (!element) {
    return getDocumentScrollingElement();
  }

  const position = getComputedStyle(element).getPropertyValue('position');
  const excludeStaticParents = position === 'absolute';

  const scrollableElement = closest(element, (parent) => {
    if (excludeStaticParents && isStaticallyPositioned(parent)) {
      return false;
    }

    return hasOverflow(parent);
  });

  if (position === 'fixed' || !scrollableElement) {
    return getDocumentScrollingElement();
  }

  return scrollableElement;
}

function getDocumentScrollingElement() {
  return document.scrollingElement || document.documentElement;
}
