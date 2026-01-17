const express = require('express');
const {
  getCategories,
  getCategory,
  vote,
  getMyVotes
} = require('../controllers/voteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Todas las rutas requieren autenticación

router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories/:id/vote', vote);
router.get('/my-votes', getMyVotes);

module.exports = router;
