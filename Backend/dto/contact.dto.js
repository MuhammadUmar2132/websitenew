class ContactDTO {
  constructor(contact) {
    this.id = contact._id;
    this.name = contact.name;
    this.email = contact.email;
    this.message = contact.message;
  }
}

module.exports = ContactDTO;
