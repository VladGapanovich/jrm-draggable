import Draggable from '../../Draggable';
import DragOverEvent from '../../Event/DragOverEvent';
import MirrorCreatedEvent from '../../Plugin/Mirror/MirrorEvent/MirrorCreatedEvent';
import Plugin from '../../Plugin/Plugin';
import requestNextAnimationFrame from '../../Shared/utils/requestNextAnimationFrame';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';

export default class ResizeMirror implements Plugin {
  private draggable: Draggable;
  private lastWidth: number;
  private lastHeight: number;
  private mirror: HTMLElement | null;

  public constructor(draggable: Draggable) {
    this.draggable = draggable;
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.mirror = null;
  }

  public attach() {
    this.draggable
      .on(
        JrmDraggableEventType.MIRROR_CREATED_EVENT,
        this.onMirrorCreated.bind(this)
      )
      .on(JrmDraggableEventType.DRAG_OVER_EVENT, this.onDragOver.bind(this))
      .on(
        JrmDraggableEventType.DRAG_OVER_CONTAINER_EVENT,
        this.onDragOver.bind(this)
      );
  }

  public detach() {
    this.draggable
      .off(
        JrmDraggableEventType.MIRROR_CREATED_EVENT,
        this.onMirrorCreated.bind(this)
      )
      .off(
        JrmDraggableEventType.MIRROR_DESTROY_EVENT,
        this.onMirrorDestroy.bind(this)
      )
      .off(JrmDraggableEventType.DRAG_OVER_EVENT, this.onDragOver.bind(this))
      .off(
        JrmDraggableEventType.DRAG_OVER_CONTAINER_EVENT,
        this.onDragOver.bind(this)
      );
  }

  private onMirrorCreated({ mirror }: MirrorCreatedEvent) {
    this.mirror = mirror;
  }

  private onMirrorDestroy() {
    this.mirror = null;
  }

  private onDragOver(dragEvent: DragOverEvent) {
    this.resize(dragEvent);
  }

  private resize({ overContainer, over }: DragOverEvent) {
    requestAnimationFrame(() => {
      if (this.mirror === null || !this.mirror.parentNode) {
        return;
      }

      if (this.mirror.parentNode !== overContainer) {
        overContainer.appendChild(this.mirror);
      }

      const overElement =
        over ||
        this.draggable.getDraggableElementsForContainer(overContainer)[0];

      if (!overElement) {
        return;
      }

      requestNextAnimationFrame(() => {
        const overRect = overElement.getBoundingClientRect();

        if (
          this.mirror === null ||
          (this.lastHeight === overRect.height &&
            this.lastWidth === overRect.width)
        ) {
          return;
        }

        this.mirror.style.width = `${overRect.width}px`;
        this.mirror.style.height = `${overRect.height}px`;

        this.lastWidth = overRect.width;
        this.lastHeight = overRect.height;
      });
    });
  }
}
