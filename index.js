require('dotenv').config()
const express = require('express')
const app = express()
const expressLayouts = require("express-ejs-layouts");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.set("layout", "components/layout");
const { auth, requiresAuth } = require('express-openid-connect');
const UserController = require('./controllers/UserController');
const jwt = require('jsonwebtoken');
const { auth: jwtCheck } = require('express-oauth2-jwt-bearer');
const RoundController = require('./controllers/RoundController');
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.OIDC_SECRET,
  baseURL: externalUrl || `http://localhost:${port}`,
  clientID: process.env.OIDC_CLIENT_ID || '',
  issuerBaseURL: process.env.OIDC_ISSUER_BASE_URL || '',
 afterCallback: async (req, res, session) => {
  try {
    const decoded = jwt.decode(session.id_token);
    if (!decoded) return session;
    const { sub, email, name, picture, nickname, email_verified, updated_at } = decoded;
    await UserController.createUser( sub, email, name, picture, nickname, email_verified, updated_at );
  } catch (err) {
    console.error('Error saving user after login:', err);
  }
  return session;
}
};
app.use(auth(config));

const checkJwt = jwtCheck({
  audience: process.env.API_AUDIENCE,
  issuerBaseURL: process.env.OIDC_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});
app.get('/', (req, res) => {
  res.redirect('/app');
});
app.get('/app', RoundController.getHome);
app.use('/app/ticket', requiresAuth(), require('./routes/ticketRoutes'));
app.use('/app', checkJwt, require('./routes/roundRoutes'));
if (externalUrl) {
  const hostname = '0.0.0.0';
  app.listen(port, hostname, () => {
    console.log(`Server locally running on http://${hostname}:${port}/ and externally on ${externalUrl}`)
  })
}
else {
  app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  })
}