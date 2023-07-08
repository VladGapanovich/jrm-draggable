import SortableStartEvent from '../../../Event/SortableStartEvent';
import JrmDraggableEvent from '../../../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../../../Shared/Event/JrmDraggableEventType';

type MirrorAttachedEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  mirror: HTMLElement;
  dragStartEvent: SortableStartEvent;
};

export default class MirrorAttachedEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly mirror: HTMLElement;
  public readonly dragStartEvent: SortableStartEvent;

  public constructor(props: MirrorAttachedEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.mirror = props.mirror;
    this.dragStartEvent = props.dragStartEvent;
  }

  public get type() {
    return JrmDraggableEventType.MIRROR_ATTACHED_EVENT;
  }

  public get cancelable(): boolean {
    return false;
  }
}
