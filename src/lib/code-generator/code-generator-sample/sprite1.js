import Sprite from './sprite.js';

class Sprite1 extends Sprite {
    constructor (broadcaster) {
        super(broadcaster);
    }

    event_whenflagclicked() {
        this.motion_movesteps(10);
        this.broadcaster.broadcast('message1');
    }

    event_whenbroadcastreceived(message) {

    }

}

export default Sprite1;