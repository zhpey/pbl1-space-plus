// Independent module entry; the shared shell wires up navigation and the scene.
if (!location.hash) history.replaceState(null, '', '#explore/earth');
await import('../js/main.js');
