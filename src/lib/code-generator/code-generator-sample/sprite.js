class Sprite {
    constructor(broadcaster) {
        this.x = 0;
        this.y = 0;
        this.direction = 90;

        this.broadcaster = broadcaster;
    }

    motion_movesteps(steps) {
        // change this.x and this.y accordingly
    }

}

export default Sprite;