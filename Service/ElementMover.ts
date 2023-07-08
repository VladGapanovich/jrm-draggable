type MoveResult = { oldContainer: HTMLElement; newContainer: HTMLElement };

export default class ElementMover {
  public move({
    source,
    over,
    overContainer,
    children,
  }: {
    source: HTMLElement;
    over: Element | null;
    overContainer: HTMLElement;
    children: HTMLElement[];
  }): MoveResult | null {
    if (children.length === 0) {
      return this.moveInsideEmptyContainer(source, overContainer);
    } else if (over !== null && source.parentNode === over.parentNode) {
      return this.moveWithinContainer(source, over);
    } else if (source.parentNode !== overContainer) {
      return this.moveOutsideContainer(source, over, overContainer);
    }

    return null;
  }

  private moveInsideEmptyContainer(source, overContainer): MoveResult {
    const oldContainer = source.parentNode;

    overContainer.appendChild(source);

    return {
      oldContainer,
      newContainer: overContainer,
    };
  }

  private moveWithinContainer(source, over): MoveResult {
    const oldIndex = this.sortable(source);
    const newIndex = this.sortable(over);

    if (oldIndex < newIndex) {
      source.parentNode.insertBefore(source, over.nextElementSibling);
    } else {
      source.parentNode.insertBefore(source, over);
    }

    return {
      oldContainer: source.parentNode,
      newContainer: source.parentNode,
    };
  }

  private moveOutsideContainer(source, over, overContainer): MoveResult {
    const oldContainer = source.parentNode;

    if (over) {
      over.parentNode.insertBefore(source, over);
    } else {
      overContainer.appendChild(source);
    }

    return {
      oldContainer,
      newContainer: source.parentNode,
    };
  }

  private sortable(element) {
    return Array.prototype.indexOf.call(element.parentNode.children, element);
  }
}
