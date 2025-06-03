const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./cinema.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT, image TEXT, date TEXT, times TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, movie_id INTEGER, seat TEXT, time TEXT)");

  const movies = [[1, 'Дюна 2', 'dune2.jpg', 'сегодня', '13:00,16:00,19:00'], [2, 'Оппенгеймер', 'oppenheimer.jpg', 'сегодня', '12:00,15:30,19:15'], [3, 'Барби', 'barbie.jpg', 'завтра', '11:00,14:00,18:00'], [4, 'Миссия невыполнима', 'mission.jpg', 'послезавтра', '10:00,13:00,17:30'], [5, 'Побег из Шоушенка', 'shawshank.jpg', 'завтра', '09:00,12:30,16:00']];
  movies.forEach(([id, title, image, date, times]) => {
    db.run("INSERT OR IGNORE INTO movies (id, title, image, date, times) VALUES (?, ?, ?, ?, ?)", [id, title, image, date, times]);
  });
});

app.get('/', (req, res) => {
  const date = req.query.date || 'сегодня';
  db.all("SELECT * FROM movies WHERE date = ?", [date], (err, rows) => {
    const movies = rows.map(m => ({ ...m, times: m.times.split(',') }));
    res.render('index', { movies });
  });
});

app.get('/book/:id', (req, res) => {
  const time = req.query.time;
  db.get("SELECT * FROM movies WHERE id = ?", [req.params.id], (err, movie) => {
    res.render('book', { movie, time });
  });
});

app.post('/book', (req, res) => {
  const { movie_id, seat, time } = req.body;
  db.run("INSERT INTO bookings (movie_id, seat, time) VALUES (?, ?, ?)", [movie_id, seat, time], () => {
    res.send("Бронирование успешно!");
  });
});

const date = req.query.date || 'сегодня';
db.all("SELECT * FROM movies WHERE date = ?", [date], (err, rows) => {
  const movies = rows.map(m => ({ ...m, times: m.times.split(',') }));
  res.render('index', { movies, selectedDate: date });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));