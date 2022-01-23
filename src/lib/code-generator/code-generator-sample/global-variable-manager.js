class GlobalVariableManager {
    constructor () {
        this.variables = {};
    }

    addVariable(name) {
        this.variables[name] = 0;
    }

    setVariable(name, value) {
        this.variables[name] = value;
    }
}

export default GlobalVariableManager;