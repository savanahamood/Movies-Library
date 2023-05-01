'use strict';
const express = require("express");
const movieData = require('../demo/Movie Data/data.json')
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

let result=[];
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
    result.push(this);
}
app.get('/', (req, res) => {
    new Movie(movieData.title,movieData.poster_path,movieData.overview);
    res.send(result);
});


//app.get("*", (req, res) => {
//  res.status(404).send('page not found');
//});
app.get("/favorite", (req, res) => {

    res.send('Welcome to Favorite Page')

})

app.use(notFoundHandler);
function notFoundHandler(req, res) {
    res.status(404).send('page not found error');

}
app.use((req,res)=>{
    res.status(500).json({
      status: 500,
      responseText: 'Sorry, something went wrong'
    });
  })
app.listen(port, () => {

    console.log(`server is listing of port ${port} `);
})