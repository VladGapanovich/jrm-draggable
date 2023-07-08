import SortableStopEvent from '../../../Event/SortableStopEvent';
import JrmDraggableEvent from '../../../Shared/Event/JrmDraggableEvent';
import JrmDraggableEventType from '../../../Shared/Event/JrmDraggableEventType';

type MirrorDestroyEventProps = {
  source: HTMLElement;
  sourceContainer: HTMLElement;
  mirror: HTMLElement;
  dragStopEvent: SortableStopEvent;
};

export default class MirrorDestroyEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly mirror: HTMLElement;
  public readonly dragStopEvent: SortableStopEvent;

  public constructor(props: MirrorDestroyEventProps) {
    super();

    this.source = props.source;
    this.sourceContainer = props.sourceContainer;
    this.mirror = props.mirror;
    this.dragStopEvent = props.dragStopEvent;
  }

  public get type() {
    return JrmDraggableEventType.MIRROR_DESTROY_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
