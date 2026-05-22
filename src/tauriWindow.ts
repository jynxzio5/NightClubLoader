import { getCurrentWindow } from '@tauri-apps/api/window';

export const closeWindow = async () => {
  try {
    const win = getCurrentWindow();
    await win.close();
  } catch (e) {
    console.error("Failed to close window via Tauri", e);
  }
};

export const minimizeWindow = async () => {
  try {
    const win = getCurrentWindow();
    await win.minimize();
  } catch (e) {
    console.error("Failed to minimize window via Tauri", e);
  }
};

export const startDragging = async () => {
  try {
    const win = getCurrentWindow();
    await win.startDragging();
  } catch (e) {
    console.error("Failed to drag window via Tauri", e);
  }
};
