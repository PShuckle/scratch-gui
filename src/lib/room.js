class Room {
    constructor (teacherSocketID) {
        this.teacher = teacherSocketID;
        this.users = {};
    }

    /**
     * add a student to the room
     */
    addUser(userSocketID, name) {
        this.users[name] = userSocketID;
    }

    /**
     * 
     * @returns socket ID of teacher
     */
    getTeacher() {
        return this.teacher;
    }
}

module.exports = Room;