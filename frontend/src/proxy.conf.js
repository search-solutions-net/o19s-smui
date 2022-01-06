const PROXY_CONFIG = {
  "**": {
    "target": "http://localhost:9000",
    "secure": false,
    "bypass": function (req) {
      if (req
        && req.headers
        && req.headers.accept
        && req.headers.accept.indexOf("html") !== -1
        && req.path
        && req.path !== '/'
      ) {
        console.log("Skipping proxy for browser request.");
        return "/";
      }
    }
  }
};

module.exports = PROXY_CONFIG;
