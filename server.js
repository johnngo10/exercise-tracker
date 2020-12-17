const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Setup Mongodb connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(result => console.log('connected to db'))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.urlencoded({ extended: false }));

// Create a new user
app.post('/api/exercise/new-user', (req, res) => {
  const user = req.body.username;

  User.findOne({ username: user }, function (err, data) {
    if (data) {
      res.json({
        error: 'Username already taken',
      });
    } else {
      const record = new User({
        username: user,
      });

      record
        .save()
        .then(result => {
          res.json({
            username: user,
            _id: result._id,
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

// Get all users
app.get('/api/exercise/users', (req, res) => {
  User.find({}, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

// Add an exercise log
app.post('/api/exercise/add', (req, res) => {
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let username;
  const splitDate = req.body.date.split('-');
  const date = !req.body.date
    ? new Date().toDateString()
    : new Date(splitDate[0], splitDate[1] - 1, splitDate[2]).toDateString();
  let exercise = {
    description: description,
    duration: duration,
    date: date,
  };

  User.findOne({ _id: userId }, function (err, data) {
    if (!data) {
      res.json({ error: 'User Id does not exist' });
    } else {
      username = data.username;

      data.log.push(exercise);
      data
        .save()
        .then(result => {
          res.json({
            _id: userId,
            username: username,
            description: description,
            duration: duration,
            date: date,
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

// Get a user's exercise log
app.get('/api/exercise/log', (req, res) => {
  const userId = req.query.userId;
  let username;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  User.findOne({ _id: userId }, function (err, data) {
    if (!data) {
      res.json({ error: 'User Id does not exist' });
    } else {
      username = data.username;
      log = data.log;
      // Check date range
      if (from && to) {
        const fromDate = Math.floor(new Date(from).getTime() / 1000);
        const toDate = Math.floor(new Date(to).getTime() / 1000);

        log = log.filter(
          d =>
            new Date(d.date).getTime() / 1000 >= fromDate &&
            new Date(d.date).getTime() / 1000 <= toDate
        );
      }
      // Check limit
      if (limit) {
        log = log.filter((d, i) => i < limit);
      }
      res.json({
        _id: data._id,
        username: username,
        count: log.length,
        log: log,
      });
    }
  });
});

// Basic Configuration
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
