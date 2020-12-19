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
            _id: result._id,
            username: result.username,
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
  const utcDate = new Date(req.body.date);
  const date = !req.body.date
    ? new Date()
    : new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
  let exercise = {
    description: description,
    duration: duration,
    date: date,
  };

  User.findOneAndUpdate(
    { _id: userId },
    { $push: { log: exercise } },
    function (err, data) {
      if (!data) {
        res.json({ error: 'User Id does not exist' });
      } else {
        res.json({
          _id: data._id,
          username: data.username,
          description: description,
          duration: duration,
          date: date.toDateString(),
        });
      }
    }
  );
});

// Get a user's exercise log
app.get('/api/exercise/log', (req, res) => {
  const { userId: _id, from, to, limit } = req.query;

  User.findOne({ _id: _id }, function (err, data) {
    if (!data) {
      res.json({ error: 'User Id does not exist' });
    } else {
      let username = data.username;
      let log = data.log;
      // Check date range and filter
      if (from && to) {
        const fromDate = Math.floor(new Date(from).getTime() / 1000);
        const toDate = Math.floor(new Date(to).getTime() / 1000);

        log = log.filter(
          d =>
            new Date(d.date).getTime() / 1000 >= fromDate &&
            new Date(d.date).getTime() / 1000 <= toDate
        );
      }
      // Check limit and filter
      if (limit) {
        log = log.filter((d, i) => i < limit);
      }

      // Format the exercise date
      const formatLog = log.map(d => ({
        description: d.description,
        duration: d.duration,
        date: d.date.toDateString(),
      }));

      // Return json object
      res.json({
        _id,
        username,
        count: log.length,
        log: formatLog,
      });
    }
  });
});

// Basic Configuration
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
