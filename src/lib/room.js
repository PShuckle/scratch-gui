class Room {
    constructor (teacherSocketID) {
        this.teacher = teacherSocketID;
        this.users = {};
    }

    addUser(userSocketID, name) {
        this.users[userSocketID] = name;
    }

    getTeacher() {
        return this.teacher;
    }
}

module.exports = Room;