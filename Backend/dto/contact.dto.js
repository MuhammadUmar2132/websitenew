class ContactDTO {
  constructor(contact) {
    this.id = contact._id;
    this._id = contact._id;
    this.name = contact.name;
    this.email = contact.email;
    this.phone = contact.phone || '';
    this.message = contact.message;
    this.status = contact.status || 'pending';
    this.notes = contact.notes || '';
    this.createdAt = contact.createdAt;
  }
}

module.exports = ContactDTO;
