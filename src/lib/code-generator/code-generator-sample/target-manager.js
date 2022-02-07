class TargetManager {
    constructor() {
        this.targets = {};
    }

    addTarget(name, target) {
        this.targets[name] = target;
    }

    addTargetsObject(targets) {
        Object.assign(this.targets, targets);
    }

    getTargetByName(name) {
        return this.targets[name];
    }

    deleteTarget(name) {
        delete this.targets[name];
    }
}

export default TargetManager;