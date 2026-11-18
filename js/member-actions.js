import {handleAction as planets} from '../陈冠伟/interaction.js';
import {handleAction as solar} from '../邹海鹏/interaction.js';
import {handleAction as atlas} from '../朱雷/interaction.js';
import {handleAction as theories} from '../滕紫涵/interaction.js';
import {handleAction as observatory} from '../訾舒然/interaction.js';
const handlers=[planets,solar,atlas,theories,observatory];
export const handleMemberAction=(action,value,context)=>handlers.some(handle=>handle(action,value,context));
