const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const validate = require('../middleware/validate');
const { saveNoteSchema } = require('../validators/noteValidator');
const { protect } = require('../middleware/auth');

router.use(protect); // Guard all note routes

router.route('/')
  .get(noteController.getNote)
  .post(validate(saveNoteSchema), noteController.saveNote);

router.route('/:id')
  .put(validate(saveNoteSchema), noteController.updateNote);

module.exports = router;
