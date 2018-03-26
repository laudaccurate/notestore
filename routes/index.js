const mongoose = require('mongoose');
const models = require('../models');
const middleware = require('../middleware');
const Util = require('../util');

module.exports = function (app) {
    app.param('id', async (req, res, next, id) => {
        try {
            const note = await models.Note.findById(id);
            req.note = note;
            next();
        } catch (error) {
            return next(error);
        }
    });

    app.get('/', (req, res, next) => {
        res.render('home', { title: 'Home' });
    });

    app.get('/register', middleware.loggedOut, (req, res, next) => {
        res.render('register', { title: 'Sign Up' });
    });

    app.post('/register', async (req, res, next) => {
        const { username, password, confirmPassword } = req.body;
        if (username && password && confirmPassword) {
            if (password !== confirmPassword) {
                return Util.error('Passwords do not match', next, '401');
            }
            const userData = { username, password };
            try {
                const user = await models.User.create(userData);
                req.session.userId = user._id;
                res.redirect('/myNotes');
            } catch (error) {
                return next(error);
            }
        } else {
            return Util.error('All fields required', next, '401');
        }
    });

    app.get('/login', middleware.loggedOut, (req, res, next) => {
        res.render('login', { title: 'Log In' });
    });

    app.post('/login', function(req, res, next) {
        const { username, password } = req.body;
        if (username && password) {
            models.User.authenticate(username, password, function(err, user) {
                if (err || !user) {
                    return Util.error('User not found', next);
                }
                req.session.userId = user._id;
                return res.redirect('/myNotes');
            });
        } else {
            return Util.error('All fields required', next, '401');
        }
    });

    app.get('/logout', (req, res, next) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/');
                }
            });
        }
    });

    app.get('/myNotes', middleware.requiresLogin, async (req, res, next) => {
        try {
            const notes = await models.Note.find({_author: req.session.userId});
            notes.sort(Util.sortItems);
            return res.render('myNotes', { title: 'My Notes', notes});
        } catch (error) {
            return next(error);
        }
    });

    app.post('/myNotes', async (req, res, next) => {
        const { text } = req.body;
        const _author = req.session.userId;
        const noteData = {text, _author};
        try {
            const note = await models.Note.create(noteData);
            return res.redirect('/myNotes');
        } catch (error) {
            return next(error);
        }
    });

    app.get('/editMyNotes/:id', (req, res, next) => {
        const note = req.note;
        return res.render('editNote', { note });
    });

    app.post('/editMyNotes/:id', async (req, res, next) => {
        try {
            Object.assign(req.note, req.body);
            const note = await req.note.save();
            return res.redirect('/myNotes');
        } catch (error) {
            return next(error);
        }
    })

    app.get('/deleteMyNotes/:id', async (req, res, next) => {
        try {
            const notes = await models.Note.remove(req.note);
            res.redirect('/myNotes');
        } catch (error) {
            return next(error);
        }
    });

    app.get('/profile', async (req, res, next) => {
        try {
            const user = await models.User.findById(req.session.userId);
            return res.render('profile', { user });
        } catch (error) {
            return next(error);
        }
    });
}
