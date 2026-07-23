import { App } from './core/App';

function supportsWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

function showFatal(message: string) {
  const boot = document.getElementById('boot-screen');
  const status = document.getElementById('boot-status');
  if (status) { status.textContent = message; status.style.color = '#e0464f'; }
  if (boot) boot.classList.remove('hidden');
  const spinner = boot?.querySelector('.boot-spinner') as HTMLElement | null;
  if (spinner) spinner.style.display = 'none';
}

async function main() {
  if (!supportsWebGL2()) {
    showFatal('This game needs WebGL2. Try an up-to-date Chrome, Edge, Firefox or Safari.');
    return;
  }
  try {
    const app = new App();
    await app.start();
  } catch (err) {
    console.error('Failed to start game', err);
    showFatal('Something went wrong starting the game — see the console for details.');
  }
}

void main();
