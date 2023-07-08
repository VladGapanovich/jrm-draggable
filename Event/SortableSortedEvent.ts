import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import DragOverEvent from '../Event/DragOverEvent';
import DragOverContainerEvent from '../Event/DragOverContainerEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type SortableSortedEventProps = {
  oldIndex: number;
  newIndex: number;
  oldContainer: HTMLElement;
  newContainer: HTMLElement;
  dragEvent: DragOverEvent | DragOverContainerEvent;
};

export default class SortableSortedEvent extends JrmDraggableEvent {
  public readonly oldIndex: number;
  public readonly newIndex: number;
  public readonly oldContainer: HTMLElement;
  public readonly newContainer: HTMLElement;
  public readonly dragEvent: DragOverEvent | DragOverContainerEvent;

  public constructor(props: SortableSortedEventProps) {
    super();

    this.oldIndex = props.oldIndex;
    this.newIndex = props.newIndex;
    this.oldContainer = props.oldContainer;
    this.newContainer = props.newContainer;
    this.dragEvent = props.dragEvent;
  }

  public get type() {
    return JrmDraggableEventType.SORTABLE_SORTED_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
