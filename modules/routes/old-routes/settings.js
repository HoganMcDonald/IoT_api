const router = require('express').Router();
const Setting = require('../models/setting');

router.get('/', (req, res, next) => {
  Setting.find({}).then(settings => res.json(settings)).catch(err => next(err));
});

router.post('/', (req, res, next) => {
  new Setting(req.body)
    .save()
    .then(setting => res.status(201).json(setting))
    .catch(err => next(err));
});

router.get('/:name', (req, res, next) => {
  Setting.findOne({ name: req.params.name })
    .then(setting => {
      if (setting) {
        res.json(setting);
      } else
        res.sendStatus(404);
    })
    .catch(err => next(err));
});

router.delete('/:name', (req, res, next) => {
  Setting.findOneAndRemove({ name: req.params.name })
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

router.put('/:name', (req, res, next) => {
  Setting.findOneAndUpdate(
    { name: req.params.name },
    { value: req.body.value },
    { new: true, upsert: true }
  )
    .then(setting => res.json(setting))
    .catch(err => next(err));
});

module.exports = router;
