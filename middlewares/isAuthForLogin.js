export default function isAuthForLogin(req, res, next) {
  if (req.session.isAuthenticated) {
    res.redirect("/home"); // Redirect to home if already authenticated
    return;
  }
  next(); // Proceed to the next middleware or route handler
}
