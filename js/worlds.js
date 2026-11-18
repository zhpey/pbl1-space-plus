import {renderOdysseyHome} from './odyssey.js';
import { localArticles } from "./library.js";

// Five destinations correspond to the five peer member folders.
import { world as world1 } from "../陈冠伟/world.js";
import { world as world2 } from "../邹海鹏/world.js";
import { world as world3 } from "../朱雷/world.js";
import { world as world4 } from "../滕紫涵/world.js";
import { world as world5 } from "../訾舒然/world.js";
export const worlds = [world1, world2, world3, world4, world5];

export function renderStarMap(){return renderOdysseyHome(worlds);}

export function renderWorldIntro(s) {
  const w =
    worlds.find((w) => w.id === s.route) ||
    (s.route === "story" ? worlds[4] : null);
  if (!w) return "";
  return `<section class="world-intro" style="--world-color:${w.color}" aria-label="主题世界介绍"><div><span class="eyebrow">WORLD 0${w.member} / ${w.theme}</span><h2>${w.question}</h2><p>${w.intro}</p><button class="local-source-link world-intro-reading" data-action="library-jump">浏览 ${localArticles.filter((a) => a.module === w.module).length} 篇图文专题 ↓</button></div><a href="#universe">返回星空地图 ↗</a></section>`;
}
