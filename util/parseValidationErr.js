module.exports = function parseValidationErr(error, req) {
  if (!req || !req.flash) {
    console.error("req.flash is not available.");
    return;
  }
  const errors = [];
  for (let field in error.errors) {
    if (error.errors.hasOwnProperty(field)) {
      errors.push(error.errors[field].message);
    }
  }
  req.flash("errors", errors);
};
