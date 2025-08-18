import { validationResult } from "express-validator";

export function handleValidationErrors(redirectTo = null) {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("errors", errors.array().map(err => err.msg));
      
      // If redirectTo is a function, call it with req to get dynamic path
      if (typeof redirectTo === 'function') {
        return res.redirect(redirectTo(req));
      }
      
      return res.redirect(redirectTo || req.originalUrl);
    }
    next();
  };
}
