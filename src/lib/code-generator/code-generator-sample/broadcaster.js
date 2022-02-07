class Broadcaster {
    constructor () {
        this.targets = {};
    }

    broadcast(message) {
        Object.keys(this.targets).forEach(targetName => {
            this.targets[targetName].event_whenbroadcastreceived(message);
        })
    }

    setTargets(targets) {
        this.targets = targets;
    }
}

export default Broadcaster;