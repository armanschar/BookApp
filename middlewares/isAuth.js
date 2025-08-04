export default function isAuth(req, res, next) {
  if (req.session.isAuthenticated && req.session.user) {
    return next();
  }
  req.flash("errors", "Debes iniciar sesión para acceder a esta página.");
  return res.redirect("/");
}
