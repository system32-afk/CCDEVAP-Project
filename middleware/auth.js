function isAuthenticated(req, res, next) {
    if (req.session && req.session.isLoggedIn && req.session.userID) {
        return next(); // session is valid. proceed to next  route
    }
    
    // session is invalid or doesn't exist
    res.redirect('/login');
}

function isAdmin(req,res, next){
    if(req.session.role === "admin"){
        return next();
    }
    return res.redirect("/home");
}

function isUser(req,res, next){
    if(req.session.role === "customer"){
        return next();
    }
    return res.redirect("/admin");
}

module.exports = {isAuthenticated, isAdmin, isUser};