const express = require('express');
const Route = require('../models/Route');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const routes = await Route.find();
  res.json(routes);
});

router.post('/', authMiddleware, async (req, res) => {
  const route = await Route.create(req.body);
  res.status(201).json(route);
});

module.exports = router;
