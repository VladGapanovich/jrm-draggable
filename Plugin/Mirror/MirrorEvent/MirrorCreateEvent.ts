import SortableStartEvent from '../../../Event/SortableStartEvent';
import JrmDraggableEvent from '../../../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../../../Shared/Event/JrmDraggableEventType';

type MirrorCreateEventProps = {
  source: HTMLElement;
  originalSource: HTMLElement;
  sourceContainer: HTMLElement;
  dragStartEvent: SortableStartEvent;
};

export default class MirrorCreateEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly dragStartEvent: SortableStartEvent;

  public constructor(props: MirrorCreateEventProps) {
    super();

    this.source = props.source;
    this.originalSource = props.originalSource;
    this.sourceContainer = props.sourceContainer;
    this.dragStartEvent = props.dragStartEvent;
  }

  public get type() {
    return JrmDraggableEventType.MIRROR_CREATE_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
