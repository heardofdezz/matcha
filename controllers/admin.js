exports.getAdminIndex = (req, res, next) => {
    User.fetchAll().then(([rows, fieldData]) => {
        res.render('admin/adminindex', {
            users: rows,
            pageTitle: 'Admin Index',
            path: '/admin/index'
        });
    }).catch((err) => {
        
    });
}