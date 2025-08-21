class PhotoDTO {
  constructor(photo) {
    this.id = photo._id;
    this.title = photo.title;
    this.description = photo.description;
    this.link = photo.link;
    this.imageUrl = photo.imageUrl;
  }
}

module.exports = PhotoDTO;
