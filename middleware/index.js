function loggedOut(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/myNotes');
    }
    next();
}

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        var err = new Error('You need to be logged in to access this page');
        err.status = 403;
        return next(err);
        
    }
}

module.exports = { loggedOut, requiresLogin };