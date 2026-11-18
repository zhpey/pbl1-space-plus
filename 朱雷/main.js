// Independent module entry; the shared shell wires up navigation and the scene.
if (!location.hash) history.replaceState(null, '', '#atlas/orion');
await import('../js/main.js');
