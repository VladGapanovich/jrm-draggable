export type Touches = {
  changedTouches?: { pageX: number; pageY: number }[] | TouchList;
  touches?: { pageX: number; pageY: number }[] | TouchList;
};

export default function touchCoords(event: Touches): {
  pageX: number;
  pageY: number;
} {
  const { touches, changedTouches } = event;
  const coords =
    (touches && touches[0]) || (changedTouches && changedTouches[0]);

  return coords || { pageX: 0, pageY: 0 };
}
