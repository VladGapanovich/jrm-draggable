import Draggable from '../../Draggable';
import type Plugin from '../../Plugin/Plugin';

export default class Focusable implements Plugin {
  private readonly draggable: Draggable;
  private readonly elementsWithMissingTabIndex: HTMLElement[];

  public constructor(draggable: Draggable) {
    this.draggable = draggable;
    this.elementsWithMissingTabIndex = [];
  }

  public attach() {
    requestAnimationFrame(() => {
      for (const element of this.allDraggableElements) {
        this.decorateElement(element);
      }
    });
  }

  public detach() {
    requestAnimationFrame(() => {
      for (const element of this.allDraggableElements) {
        this.stripElement(element);
      }
    });
  }

  private decorateElement(element: HTMLElement) {
    const hasMissingTabIndex =
      !element.getAttribute('tabindex') && element.tabIndex === -1;

    if (hasMissingTabIndex) {
      this.elementsWithMissingTabIndex.push(element);
      element.tabIndex = 0;
    }
  }

  private stripElement(element: HTMLElement) {
    const tabIndexElementPosition =
      this.elementsWithMissingTabIndex.indexOf(element);

    if (tabIndexElementPosition !== -1) {
      element.tabIndex = -1;
      this.elementsWithMissingTabIndex.splice(tabIndexElementPosition, 1);
    }
  }

  private get allDraggableElements() {
    return [
      ...this.draggable.containers,
      ...this.draggable.containers.reduce<HTMLElement[]>(
        (current: HTMLElement[], container) => [
          ...current,
          ...this.draggable.getDraggableElementsForContainer(container),
        ],
        [],
      ),
    ];
  }
}
