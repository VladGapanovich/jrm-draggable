export default function requestNextAnimationFrame(
  callback: FrameRequestCallback,
) {
  return requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}
