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
        && req.path !== '/session_reset'
      ) {
        console.log("Skipping proxy for browser request (path: " + req.path + " accept: " + req.headers.accept + ")");
        return "/";
      }
    }
  }
};

module.exports = PROXY_CONFIG;
