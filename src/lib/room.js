class Room {
    constructor (teacherSocketID) {
        this.teacher = teacherSocketID;
        this.users = {};
    }

    addUser(userSocketID, name) {
        this.users[name] = userSocketID;
    }

    getTeacher() {
        return this.teacher;
    }
}

module.exports = Room;