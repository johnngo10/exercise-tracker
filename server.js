const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Log = require('./models/Log');

// Setup Mongodb connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
  User.find({}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

// Add an exercise log
app.post('/api/exercise/add', (req, res) => {
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = !req.body.date ? new Date() : new Date(req.body.date);

  User.findOne({ _id: userId }, function (err, data) {
    if (!data) {
      res.json({
        error: 'User Id does not exist',
      });
    } else {
      const record = new Log({
        userId: userId,
        description: description,
        duration: duration,
        date: date,
      });

      record
        .save()
        .then(result => {
          res.json({
            _id: userId,
            username: data.username,
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
app.get('/api/exercise/log?userId=:id', (req, res) => {});

// Basic Configuration
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
