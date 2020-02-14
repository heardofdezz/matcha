var User = require('../models/users');
const db = require('../db/database');

exports.getIndex = (req, res, next) => {
    if (req.session.username == null || req.session.username != 'ROOT')
        return res.redirect('/login');
    res.render('admin/index', {
        notifs:req.session.notifs,
        pageTitle: 'Admin home page',
        path: '/index'
    });
}

exports.postSearch = (req, res, next) => {
    if (req.session.username == null || req.session.username != 'ROOT')
        return res.redirect('/login');
     User.fetchAllbyusername(req.body.user).then((results) =>{
            res.render('admin/result', {
                notifs:req.session.notifs,
                pageTitle: 'Admin home page',
                user: results[0],
                path: '/result'
            });
    });
}

exports.getDel = (req, res, next) => {
    if (req.session.username == null || req.session.username != 'ROOT')
        return res.redirect('/login');
        db.query('SELECT * FROM users WHERE user_id = ?',
        [req.params.id]).then((result) =>{
            if (result[0].length)
            {
                db.query('DELETE FROM `likes` WHERE liker_id = ? OR liked_id = ?', [req.params.id,req.params.id]);
                db.query('DELETE FROM `reports` WHERE reporter_id = ? OR reported_id = ?', [req.params.id, req.params.id]);
                db.query('DELETE FROM `blocks` WHERE blocker_id = ? OR blocked_id = ?', [req.params.id, req.params.id]);
                db.query('DELETE FROM `details` WHERE user_id = ?', [req.params.id]);
                db.query('DELETE FROM `users` WHERE user_id = ?', [req.params.id]);
            }
        });
    res.redirect('/admin');
}