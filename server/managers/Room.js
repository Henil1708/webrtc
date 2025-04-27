class Room {
  constructor(roomId) {
    this.id = roomId;
    this.participants = [];
  }

  addParticipant(email, socketId) {
    const participant = this.participants.find(
      (participant) => participant?.email === email
    );
    if (!participant) {
      this.participants.push({ email, socketId });
    }
  }
  removeParticipant(email) {
    this.participants = this.participants.filter(
      (participant) => participant?.email !== email
    );
  }
  getParticipants() {
    return this.participants;
  }
  getId() {
    return this.id;
  }
  getParticipantsCount() {
    return this.participants.length;
  }
  getParticipantsList() {
    console.log("@@ participants", this.participants);

    return this.participants.map((participant) => participant);
  }

  getDetailsByEmail(email) {
    return this.participants.find((participant) => participant.email === email);
  }

  getRoomInfo() {
    return {
      id: this.id,
      participants: this.getParticipantsList(),
    };
  }
}

export default Room;
