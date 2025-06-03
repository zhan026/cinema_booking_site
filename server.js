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
  db.run("CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, movie_id INTEGER, seat TEXT)");
  db.run("INSERT OR IGNORE INTO movies (id, title) VALUES (1, 'Фильм 1'), (2, 'Фильм 2')");
});

app.get('/', (req, res) => {
  db.all("SELECT * FROM movies", (err, rows) => {
    res.render('index', { movies: rows });
  });
});

app.get('/book/:id', (req, res) => {
  db.get("SELECT * FROM movies WHERE id = ?", [req.params.id], (err, movie) => {
    res.render('book', { movie });
  });
});

app.post('/book', (req, res) => {
  const { movie_id, seat } = req.body;
  db.run("INSERT INTO bookings (movie_id, seat) VALUES (?, ?)", [movie_id, seat], () => {
    res.send("Бронирование успешно!");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});