const csrf = require('csurf');


const csrf_middleware = (csrf_development_mode) => {
  return csrf({
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
  });
};

module.exports = csrf_middleware;