const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Log = require('./models/Log');
const nanoid = require('nanoid');

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

app.post('/api/exercise/new-user', (req, res) => {
  const user = req.body.username;
  const id = nanoid.nanoid(10);

  const findUser = User.findOne({ username: user }, function (err, data) {
    if (data) {
      res.json({
        error: 'Username already taken',
      });
    } else {
      const record = new User({
        username: user,
        _id: id,
      });

      record
        .save()
        .then(result => {
          res.json({
            username: user,
            _id: id,
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

// Basic Configuration
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
