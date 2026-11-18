import { chapters } from './data.js';
export function handleAction(action, value, { state, update, persist }) {
  switch (action) {
    case 'filter':
      state.filter = value;
      update();
      return true;
    case 'chapter':
      location.hash = 'story/' + value;
      return true;
    case 'next-chapter':
      location.hash = 'story/' + ((state.chapter + 1) % chapters.length);
      return true;
    case 'previous-chapter':
      location.hash = 'story/' + Math.max(0, state.chapter - 1);
      return true;
    case 'chapter-read':
      state.readChapters = state.readChapters.includes(state.chapter)
        ? state.readChapters.filter((i) => i !== state.chapter)
        : [...state.readChapters, state.chapter];
      persist();
      update();
      return true;
    case 'photo-save':
      if (state.dialog?.type === 'photo') {
        const id = state.dialog.id;
        state.savedPhotos = state.savedPhotos.includes(id)
          ? state.savedPhotos.filter((x) => x !== id)
          : [...state.savedPhotos, id];
        persist();
        update();
      }
      return true;
    default:
      return false;
  }
}
