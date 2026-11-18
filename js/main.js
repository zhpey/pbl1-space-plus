import {createController} from './controller.js';
import {renderHeader,renderSidebar,renderContent,renderDock,renderFooter,renderControls,renderDialog} from './ui.js';
import {renderLearning,renderReadingEntry} from './learning.js';
import {setupSpaceAudio} from './ambient.js';
import {setupSpaceExperience} from './experience.js';
import {setupCinematicPresentation} from './cinema-presentation.js';
import {captureReadingDetails,restoreReadingDetails} from './reading-details.js';
import {setupOdysseyExperience} from './odyssey.js';
import {setupFilmPlayer} from './film-player.js';
import {setupOdysseyVisuals} from './odyssey-visuals.js';
import {setupShipboardExperience} from './shipboard.js';
import {setupCosmos,renderNextChapter} from './cosmos.js';
import {setupExpedition,renderFieldGuide} from './expedition.js';
import {renderScaleLab,bindScaleLab} from '../陈冠伟/scale-lab.js';
import {renderMissionLog,bindMissionLog} from '../邹海鹏/mission-log.js';
import {bindFinder} from '../朱雷/star-finder.js';
import {renderEvidence,bindEvidence} from '../滕紫涵/evidence.js';
import {renderWebbCompare,bindWebbCompare} from '../訾舒然/webb-compare.js';
import {setupInterface} from './interface.js';
import {renderLessonCollection,setupLessonReader} from './lesson-reader.js';
import {lessonCollections} from './lesson-data.js';
const stylesheet = document.querySelector('[data-site-style]');
if (stylesheet?.media === 'print' && !stylesheet.dataset.failed) {
  await new Promise(resolve => {
    stylesheet.addEventListener('load', resolve, {once:true});
    stylesheet.addEventListener('error', resolve, {once:true});
  });
}
if (stylesheet?.dataset.failed) throw new Error('站点样式加载失败');
const fastPreview = new URLSearchParams(location.search).get('view') === 'fast';
document.body.dataset.portalRenderer = fastPreview ? 'fallback' : 'loading';
document.body.dataset.spaceBackdrop = 'static';
const canvas = document.querySelector('#universe');
canvas.inert = true;
const entryRoute = document.body.dataset.entryRoute;
if (!location.hash && entryRoute && entryRoute !== 'universe') {
  history.replaceState(null, '', '#' + entryRoute);
}

setupSpaceAudio();
const app=document.querySelector('#app');
const controller=createController();
const lessonReader=setupLessonReader(app);
const experience=setupSpaceExperience();
const cinema=setupCinematicPresentation();
const odyssey=setupOdysseyExperience();
const filmPlayer=setupFilmPlayer();
const visuals=setupOdysseyVisuals();
const shipboard=setupShipboardExperience();
const cosmos=setupCosmos();
const expedition=setupExpedition();
const interfaceExperience=setupInterface();
bindScaleLab();
bindMissionLog();
bindFinder();
bindEvidence();
bindWebbCompare();
app.addEventListener('click', event => {
  const trigger = event.target.closest('[data-instrument-jump]');
  const section = trigger && document.getElementById(trigger.dataset.instrumentJump);
  if (!section) return;
  if (trigger.matches('a')) event.preventDefault();
  const heading = section.querySelector('h2');
  heading.tabIndex = -1;
  heading.focus({preventScroll:true});
  section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
function renderObservingInstrument(state) {
  switch (state.route) {
    case 'explore': return renderScaleLab(state.planet);
    case 'solar': return renderMissionLog();
    case 'unknown': return state.mystery === 'blackhole' ? renderEvidence() : '';
    case 'observatory': return renderWebbCompare();
    default: return '';
  }
}
function renderLessonEntry(route) {
  const collection = lessonCollections[route];
  if (!collection) return '';
  return `<aside class="lesson-entry" style="--lesson-accent:${collection.accent}"><a href="#science-lessons" data-instrument-jump="science-lessons"><strong>${collection.title}</strong><span>${collection.entries.length} 篇专题与练习 ↓</span></a></aside>`;
}
function render() {
  const state = controller.state;
  const expanded = captureReadingDetails();
  const enable3d = new URL(location.href);
  enable3d.searchParams.delete('view');
  const previewBar = fastPreview ? `<aside class="fast-preview-bar" aria-label="三维展示">快速预览 <a data-enable-3d>开启 3D ↗</a></aside>` : '';
  app.innerHTML = renderHeader(state) + renderSidebar(state) +
    `<main id="page-content" tabindex="-1">${renderContent(state)}${renderLessonEntry(state.route)}${renderDock(state)}${renderObservingInstrument(state)}${renderReadingEntry(state)}${renderLessonCollection(state.route)}${renderFieldGuide(state.route)}${renderLearning(state)}${renderNextChapter(state.route)}</main>` +
    renderControls(state) + renderFooter(state) + previewBar +
    `<div class="dialog-host ${state.dialog ? '' : 'hidden'}">${renderDialog(state)}</div>`;
  const enableLink = app.querySelector('[data-enable-3d]');
  if (enableLink) enableLink.href = enable3d.href;
  restoreReadingDetails(expanded);
  controller.afterRender();
  lessonReader.afterRender(state.route);
  experience.afterRender(state);
  cinema.afterRender(state);
  odyssey.afterRender(state);
  filmPlayer.afterRender(state);
  visuals.afterRender(state);
  shipboard.afterRender();
  cosmos.afterRender(state);
  expedition.afterRender(state);
  interfaceExperience.afterRender();
}

controller.subscribe(render);
const preview = document.querySelector('.launch-preview');
const site = document.querySelector('#space-site');
try {
  if (site) site.hidden = false;
  render();
} catch (error) {
  if (site) site.hidden = true;
  throw error;
}
preview?.remove();

const sceneCommands = new Map();
function rememberSceneCommand(event) {
  const action = event.detail?.action;
  if (!['select','quality','bridge','observation','ship-mode','dialog','tour'].includes(action)) return;
  sceneCommands.delete(action);
  sceneCommands.set(action, event.detail);
}
if (!fastPreview) document.addEventListener('space-odyssey-command', rememberSceneCommand);

async function loadScene() {
  try {
    const {createUniverse} = await import('./universe.js');
    document.removeEventListener('space-odyssey-command', rememberSceneCommand);
    controller.attachEngine(createUniverse(canvas, {
      onPlanet:controller.selectPlanet,
      onWorld:controller.selectWorld,
      onPause:controller.togglePause,
      initialState:controller.state,
    }));
    canvas.inert = document.body.dataset.portalRenderer !== 'webgl';
    if (!canvas.inert && controller.state.route === 'universe') {
      for (const detail of sceneCommands.values()) {
        document.dispatchEvent(new CustomEvent('space-odyssey-command', {detail}));
      }
    }
  } catch (error) {
    console.warn('三维场景加载失败', error);
    document.body.dataset.portalRenderer = 'fallback';
    document.body.dataset.spaceBackdrop = 'static';
const canvas = document.querySelector('#universe');
canvas.inert = true;
    canvas.hidden = true;
  }
  document.removeEventListener('space-odyssey-command', rememberSceneCommand);
  sceneCommands.clear();
  odyssey.afterRender(controller.state);
  filmPlayer.afterRender(controller.state);
  shipboard.afterRender();
}
// Allow the interactive content to paint before downloading the 3D module.
if (!fastPreview) requestAnimationFrame(() => requestAnimationFrame(loadScene));
