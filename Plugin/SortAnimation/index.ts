import Draggable from '../../Draggable';
import JrmDraggableEventType from '../../Shared/Event/JrmDraggableEventType';
import Plugin from '../../Plugin/Plugin';
import SortableSortEvent from '../../Event/SortableSortEvent';
import SortableSortedEvent from '../../Event/SortableSortedEvent';

export type SortAnimationOptions = {
  duration: number;
  easingFunction: string;
};

type LastElement = {
  element: HTMLElement;
  offsetTop: number;
  offsetLeft: number;
};

export const defaultOptions: SortAnimationOptions = {
  duration: 150,
  easingFunction: 'ease-in-out',
};

export default class SortAnimation implements Plugin {
  private readonly draggable: Draggable;
  private readonly options: SortAnimationOptions;
  private lastAnimationFrame: number | null;
  private lastElements: LastElement[];

  public constructor(
    draggable: Draggable,
    options: Partial<SortAnimationOptions>
  ) {
    this.draggable = draggable;
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.lastAnimationFrame = null;
    this.lastElements = [];

    this.onSortableSort = this.onSortableSort.bind(this);
    this.onSortableSorted = this.onSortableSorted.bind(this);
  }

  public attach() {
    this.draggable.on(
      JrmDraggableEventType.SORTABLE_SORT_EVENT,
      this.onSortableSort
    );
    this.draggable.on(
      JrmDraggableEventType.SORTABLE_SORTED_EVENT,
      this.onSortableSorted
    );
  }

  public detach() {
    this.draggable.off(
      JrmDraggableEventType.SORTABLE_SORT_EVENT,
      this.onSortableSort
    );
    this.draggable.off(
      JrmDraggableEventType.SORTABLE_SORTED_EVENT,
      this.onSortableSorted
    );
  }

  private onSortableSort({ dragEvent }: SortableSortEvent) {
    const { sourceContainer } = dragEvent;
    const elements =
      this.draggable.getDraggableElementsForContainer(sourceContainer);

    this.lastElements = elements.map((el): LastElement => {
      return {
        element: el,
        offsetTop: el.offsetTop,
        offsetLeft: el.offsetLeft,
      };
    });
  }

  private onSortableSorted({
    oldIndex,
    newIndex,
    oldContainer,
    newContainer,
  }: SortableSortedEvent) {
    if (oldIndex === newIndex && oldContainer === newContainer) {
      return;
    }

    const effectedElements: any[] = [];
    let start;
    let end;
    let num;

    if (oldIndex > newIndex) {
      start = newIndex;
      end = oldIndex - 1;
      num = 1;
    } else {
      start = oldIndex + 1;
      end = newIndex;
      num = -1;
    }

    for (let i = start; i <= end; i++) {
      const from = this.lastElements[i];
      const to = this.lastElements[i + num];

      effectedElements.push({ from, to });
    }

    if (this.lastAnimationFrame !== null) {
      cancelAnimationFrame(this.lastAnimationFrame);
    }

    this.lastAnimationFrame = requestAnimationFrame(() => {
      effectedElements.forEach((element) => animate(element, this.options));
    });
  }
}

function animate(
  { from, to }: { from: LastElement | undefined; to: LastElement | undefined },
  { duration, easingFunction }: SortAnimationOptions
) {
  if (from === undefined || to === undefined) {
    return;
  }

  const element = from.element;
  const x = from.offsetLeft - to.offsetLeft;
  const y = from.offsetTop - to.offsetTop;

  element.style.pointerEvents = 'none';
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  requestAnimationFrame(() => {
    element.addEventListener('transitionend', resetElementOnTransitionEnd);
    element.style.transition = `transform ${duration}ms ${easingFunction}`;
    element.style.transform = '';
  });
}

function resetElementOnTransitionEnd(event) {
  event.target.style.transition = '';
  event.target.style.pointerEvents = '';
  event.target.removeEventListener(
    'transitionend',
    resetElementOnTransitionEnd
  );
}
