import JrmDraggableEvent from '../../../Shared/Event/JrmDraggableEvent';
import DragMoveEvent from '../../../Event/DragMoveEvent';
import JrmDraggableEventType from '../../../Shared/Event/JrmDraggableEventType';

type MirrorMoveEventProps = {
  source: HTMLElement;
  sourceContainer: HTMLElement;
  originalSource: HTMLElement;
  mirror: HTMLElement;
  dragMoveEvent: DragMoveEvent;
  passedThreshX: boolean;
  passedThreshY: boolean;
};

export default class MirrorMoveEvent extends JrmDraggableEvent {
  public readonly source: HTMLElement;
  public readonly sourceContainer: HTMLElement;
  public readonly mirror: HTMLElement;
  public readonly originalSource: HTMLElement;
  public readonly dragMoveEvent: DragMoveEvent;
  public readonly passedThreshX: boolean;
  public readonly passedThreshY: boolean;

  public constructor(props: MirrorMoveEventProps) {
    super();

    this.source = props.source;
    this.sourceContainer = props.sourceContainer;
    this.mirror = props.mirror;
    this.originalSource = props.originalSource;
    this.dragMoveEvent = props.dragMoveEvent;
    this.passedThreshX = props.passedThreshX;
    this.passedThreshY = props.passedThreshY;
  }

  public get type() {
    return JrmDraggableEventType.MIRROR_MOVE_EVENT;
  }

  public get cancelable(): boolean {
    return true;
  }
}
