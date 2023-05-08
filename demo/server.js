'use strict';
require("dotenv").config();
const express = require("express");
const cors = require('cors');
const axios = require("axios");
const app = express();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());
app.use(express.json());
const movieKey = process.env.API_KEY;
const port = process.env.PORT;
const movieData = require('../demo/MovieData/data.json')

function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}
app.get("/", handleMoviesFromJSON);
app.get("/favorite", handleFavorite);
app.get("/trending", handleMovies);
app.get("/search", handleMoviesSearch);
app.get("/genre", handleMoviesGenre);
app.get('/discover', handleMoviesDiscover);
app.get('/getMovies', handleGetMovies);
app.post('/getMovies', handleAddMovies);
app.delete('/getMovies/:id', handleDeleteMovies);
app.put('/getMovies/:id', handleUpdateMovies);
app.get('/getMovies/:id', handleGetidMovies);


function handleGetidMovies(req, res) {
    const moid=req.params.id;

    const sql = `select * from favmovie where id=${moid};`;
    client.query(sql).then((data) => {
        //res.send(data.rows);
        let dataFromDB = data.rows.map((item) => {
            let singlemovie = new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview)
            return singlemovie;
        });
        res.send(dataFromDB);
    })
}
function handleUpdateMovies(req,res){
    const moid=req.params.id;
    const sql = `update favmovie set title=$1,release_date=$2,poster_path=$3,overview=$4 where id=${moid} returning*;`
    const values = [req.body.title, req.body.release_date, req.body.poster_path, req.body.overview];
    client.query(sql, values)
        .then((data) => {
            res.send(data.rows);
        })
}

function handleDeleteMovies(req, res) {

    const moid = req.params.id;
    const sql = `delete from favmovie where id=${moid};`
    client.query(sql)
        .then((data) => {

            res.status(202).json('deleted')

        })
} 
function handleAddMovies(req, res) {
    const movie = req.body;
    //console.log(movie);
    const sql = `INSERT into favmovie(id,title,release_date,poster_path,overview) values('${movie.id}','${movie.title}','${movie.release_date}','${movie.poster_path}','${movie.overview}');`;
    client.query(sql).then(() => {
        res.send('added');
    })
}

function handleGetMovies(req, res) {
    const sql = 'select * from favmovie;';
    client.query(sql).then((data) => {
        //res.send(data.rows);
        let dataFromDB = data.rows.map((item) => {
            let singlemovie = new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview)
            return singlemovie;
        });
        res.send(dataFromDB);
    })
}

function handleMoviesFromJSON(req, res) {
    let moviesJSON = movieData.data.map((el) => {
        return new Movie(el.id, el.title, el.release_date, el.poster_path, el.overview)
    })
    res.send(moviesJSON);
};


function handleFavorite(req, res) {
    res.send('Welcome to Favorite Page')
};

async function handleMovies(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${movieKey}&/discover/movie/?certification_country=US&certification=R&sort_by=vote_average.desc`
    let moviesFromAPI = await axios.get(url);
    let movies = moviesFromAPI.data.results.map((item) => {
        return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview)
    })
    res.send(movies);
};

async function handleMoviesSearch(req, res) {
    const searchWord = req.query.movieName;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&language=en-US&query=${searchWord}&page=1&include_adult=false`;
    let result = await axios.get(url);
    let movies = result.data.results.map((item) => {
        return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview)
    })
    res.send(movies);
}

async function handleMoviesGenre(req, res) {
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${movieKey}`
    let movieFromAPI = await axios.get(url);
    const genres = movieFromAPI.data.genres;
    res.send(genres);

};

async function handleMoviesDiscover(req, res) {

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${movieKey}`;

    let result = await axios.get(url);
    let movies = result.data.results.map((item) => {
        return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview)
    })
    // res.json({name:newmovie.name, image :newmovie.image})
    res.send(movies);

}


app.use(notFoundHandler);
function notFoundHandler(req, res) {
    res.status(404).send('page not found error');

}
app.use((req, res) => {
    res.status(500).json({
        status: 500,
        responseText: 'Sorry, something went wrong'
    });
})
client.connect().then(() => {
    app.listen(port, () => {
        console.log(`server is listing of port ${port} `);
    })
})
