module.exports = function parseValidationErr(error, req) {
  const errors = [];
  for (let field in error.errors) {
    if (error.errors.hasOwnProperty(field)) {
      errors.push(error.errors[field].message);
    }
  }
  req.flash("errors", errors);
};
