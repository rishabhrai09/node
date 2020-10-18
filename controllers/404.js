exports.notFoundControllers = (req, res, next) => {
  res
    .status(404)
    .render("404", { pageTitle: "Not Found", isAuthenticated: req.session.isLoggedIn });
};

exports.fixError= (req, res, next) => {
  res.status(500).render("500", { pageTitle: "500", isAuthenticated:req.session.isLoggedIn });
};
