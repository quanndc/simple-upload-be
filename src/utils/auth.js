function parseAuthHeader(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  return {
    scheme: scheme || '',
    token: token || '',
  };
}

module.exports = {
  parseAuthHeader,
};


