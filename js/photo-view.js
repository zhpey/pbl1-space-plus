export function capturePhotoView(viewer, point) {
  if (!viewer) return null;
  const image = viewer.querySelector('img');
  const bounds = viewer.getBoundingClientRect();
  const picture = image.getBoundingClientRect();
  const anchor = point || {x:viewer.clientWidth / 2, y:viewer.clientHeight / 2};
  return {
    viewer, id:viewer.dataset.photo, focused:document.activeElement===viewer,
    dialogScroll:viewer.closest('.dialog').scrollTop,
    x:anchor.x, y:anchor.y,
    relativeX:picture.width ? (bounds.left + viewer.clientLeft + anchor.x - picture.left) / picture.width : 0.5,
    relativeY:picture.height ? (bounds.top + viewer.clientTop + anchor.y - picture.top) / picture.height : 0.5
  };
}

export function fitPhotoView(viewer, zoom, snapshot) {
  const image = viewer.querySelector('img');
  const fit = () => {
    if (!viewer.isConnected || !image.naturalWidth) return;
    const factor = Math.min(viewer.clientWidth / image.naturalWidth, viewer.clientHeight / image.naturalHeight);
    const width = image.naturalWidth * factor * zoom;
    const height = image.naturalHeight * factor * zoom;
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    const space = image.parentElement;
    space.style.width = `${Math.max(viewer.clientWidth, width)}px`;
    space.style.height = `${Math.max(viewer.clientHeight, height)}px`;
    viewer.dataset.zoom = zoom;
    viewer.classList.toggle('zoomed', zoom > 1);
    if (snapshot) {
      viewer.scrollLeft = image.offsetLeft + snapshot.relativeX * width - snapshot.x;
      viewer.scrollTop = image.offsetTop + snapshot.relativeY * height - snapshot.y;
    } else {
      viewer.scrollTo(0, 0);
    }
  };
  if (image.complete && image.naturalWidth) fit();
  else image.addEventListener('load', fit, {once:true});
}
