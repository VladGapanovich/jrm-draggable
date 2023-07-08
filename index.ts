import { ComputedRef, nextTick, Ref, watch } from 'vue';
import Draggable, {
  DraggableOptions, SensorConstructor,
} from './Draggable';
import Focusable from './Plugin/Focusable';
import Mirror from './Plugin/Mirror';
import Scrollable from './Plugin/Scrollable';
import SortAnimation from './Plugin/SortAnimation';
import MouseSensor from './Sensor/MouseSensor';
import TouchSensor from './Sensor/TouchSensor';

export const useDraggable = (
  values: Ref<any[]> | ComputedRef<any[]>,
  containersSelector: string,
  options: Ref<any>,
  sensors: SensorConstructor[] = [MouseSensor, TouchSensor],
  pluginOptions: any[] = [
    { class: Focusable },
    {
      class: Mirror,
      options: {
        constrainDimensions: true,
      },
    },
    { class: Scrollable },
    { class: SortAnimation },
  ]
) => {
  const containers: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>(containersSelector)
  );
  const sortable = new Draggable(
    containers,
    {
      ...options.value,
      sensors,
    }
  );

  for (const { class: Plugin, options } of pluginOptions) {
    sortable.addPlugin(new Plugin(sortable, options));
  }

  watch(
    () => values.value.length,
    async () => {
      await nextTick();

      const containers: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLElement>(containersSelector)
      );

      sortable.refresh(
        containers,
        {
          ...options.value,
          sensors,
        }
      );
    }
  );

  watch(
    options,
    async (newOptions: Partial<DraggableOptions>) => {
      await nextTick();

      const containers: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLElement>(containersSelector)
      );

      sortable.refresh(
        containers,
        {
          ...newOptions,
          sensors,
        }
      );
    },
    {
      deep: true,
    }
  );

  return {
    sortable,
  };
};
