import Broadcaster from './broadcaster.js';
import Sprite1 from './sprite1.js';
import Abby from './abby.js';

const broadcaster = new Broadcaster();

const targets = {sprite1: new Sprite1(broadcaster), abby: new Abby(broadcaster)};

broadcaster.setTargets(targets);

Object.keys(targets).forEach(targetName => {
    targets[targetName].event_whenflagclicked();
});
