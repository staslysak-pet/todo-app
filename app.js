const express    = require('express');
const app        = express();
const db         = require('./db/db');
const bodyParser = require('body-parser');
const PORT       = process.env.PORT || 5000;

db.checkConnection();

app.set('views', 'views');
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', async function(req, res){
    const note = await db.getNotes();
	res.render('index', {title: 'Todo App', notes: note});
});
app.post('/', async function(req, res){
    await db.addNote(req.body);
    res.redirect('/');
});
app.put('/:id', async function(req, res){
    await db.updateNote(req.params.id, req.body);
    res.redirect('/');
});
app.delete('/:id', async function(req, res){
    await db.deleteNote(req.params.id);
    res.redirect('/');
});

app.listen(PORT);