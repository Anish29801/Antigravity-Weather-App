const Note = require('../models/Note');

const getNote = async (userId) => {
  let note = await Note.findOne({ user: userId });
  if (!note) {
    note = await Note.create({ user: userId, text: '' });
  }
  return note;
};

const saveNote = async (userId, text) => {
  let note = await Note.findOne({ user: userId });
  if (!note) {
    note = new Note({ user: userId });
  }
  note.text = text;
  await note.save();
  return note;
};

module.exports = {
  getNote,
  saveNote
};
