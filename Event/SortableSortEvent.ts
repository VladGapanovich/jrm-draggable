import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import DragOverEvent from '../Event/DragOverEvent';
import DragOverContainerEvent from '../Event/DragOverContainerEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type SortableSortEventProps = {
  currentIndex: number;
  over: Element | null;
  source: HTMLElement;
  dragEvent: DragOverEvent | DragOverContainerEvent;
};

export default class SortableSortEvent extends JrmDraggableEvent {
  public readonly currentIndex: number;
  public readonly over: Element | null;
  public readonly source: HTMLElement;
  public readonly dragEvent: DragOverEvent | DragOverContainerEvent;

  public constructor(props: SortableSortEventProps) {
    super();

    this.currentIndex = props.currentIndex;
    this.over = props.over;
    this.source = props.source;
    this.dragEvent = props.dragEvent;
  }

  public get type() {
    return JrmDraggableEventType.SORTABLE_SORT_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
