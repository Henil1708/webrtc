const { default: Room } = require("./Room");

class RoomManger {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomId) {
    if (!this.getRoom(roomId)) {
      const room = new Room(roomId);
      this.rooms[roomId] = room;
      return true;
    }
    return false;
  }

  getRoom(roomId) {
    return this.rooms[roomId] || null;
  }
}

const roomManager = new RoomManger();

module.exports = roomManager;
