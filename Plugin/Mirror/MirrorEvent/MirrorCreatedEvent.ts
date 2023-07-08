import SortableStartEvent from '../../../Event/SortableStartEvent';
import JrmDraggableEvent from '../../../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../../../Shared/Event/JrmDraggableEventType';

type MirrorCreatedEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  mirror: HTMLElement;
  dragStartEvent: SortableStartEvent;
};

export default class MirrorCreatedEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly mirror: HTMLElement;
  public readonly dragStartEvent: SortableStartEvent;

  public constructor(props: MirrorCreatedEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.mirror = props.mirror;
    this.dragStartEvent = props.dragStartEvent;
  }

  public get type() {
    return JrmDraggableEventType.MIRROR_CREATED_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
