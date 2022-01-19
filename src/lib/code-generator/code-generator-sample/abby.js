import Sprite from './sprite.js';

class Abby extends Sprite {
    constructor (broadcaster) {
        super(broadcaster);
    }

    event_whenflagclicked() {
        
    }

    event_whenbroadcastreceived(message) {
        if (message == 'message1') {
            this.motion_movesteps(10);
        }
    }

}

export default Abby;