import JrmDraggableEvent from '../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../Shared/Event/JrmDraggableEventType';

type SortableStopEventProps = {
  source: HTMLElement;
  oldIndex: number;
  newIndex: number;
  oldContainerIndex: number;
  newContainerIndex: number;
  oldContainer: HTMLElement;
  newContainer: HTMLElement | null;
};

export default class SortableStopEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly oldIndex: number;
  public readonly newIndex: number;
  public readonly oldContainerIndex: number;
  public readonly newContainerIndex: number;
  public readonly oldContainer: HTMLElement;
  public readonly newContainer: HTMLElement | null;

  public constructor(props: SortableStopEventProps) {
    super();

    this.source = props.source;
    this.oldIndex = props.oldIndex;
    this.newIndex = props.newIndex;
    this.oldContainerIndex = props.oldContainerIndex;
    this.newContainerIndex = props.newContainerIndex;
    this.oldContainer = props.oldContainer;
    this.newContainer = props.newContainer;
  }

  public get type() {
    return JrmDraggableEventType.SORTABLE_STOP_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
