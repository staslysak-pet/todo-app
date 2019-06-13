const express    = require('express');
const app        = express();
const db         = require('./test_db');
const bodyParser = require('body-parser');
const assert     = require('assert');


const tests = async () => {
    assert(await db.checkConnection(), 'NETWORK ERROR');
};
tests();


app.set('views', 'views');
app.set('view engine', 'pug');
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', async function(req, res){
    const note = await db.getNotes();
    assert(note, 'CANNOT GET DATA')
	res.render('index', {title: 'NOTE APP', notes: note});
});
app.post('/', async function(req, res){
    const addData = await db.addNote(req.body);
    assert(addData, 'CANNOT POST DATA')
    res.redirect('/');
});
app.put('/:id', async function(req, res){
    const putData = await db.updateNote(req.params.id, req.body);
    assert(putData, 'CANNOT PUT DATA')
    res.redirect('/');
});
app.delete('/:id', async function(req, res){
    const delData = await db.deleteNote(req.params.id);
    assert(delData, 'CANNOT DELETE DATA')
    res.redirect('/');
});

app.listen(3000);