const express = require('express');
const passport = require('passport');
const passportSvc = require('./../config/passport');
const authController = require ('./../controllers/auth.controller');

const router = express.Router();

const requireAuth = passport.authenticate('jwt',  {session: false});
const requireLogin = passport.authenticate('local', {session: false});

// auth routes
router.post('/auth/login', requireLogin, authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/recover-password', authController.recoverPassword);
router.get('/auth/reset-password', authController.resetPassword);
router.post('/auth/reset-password', authController.resetPassword);
// to avoid search three times, the auth is done inside the logout route
router.post('/auth/logout', authController.logout);
router.get('/auth/protected', requireAuth, function(req, res) {
  res.send({content: 'Success'});
});

// todoRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['reader','creator','editor']), TodoController.getTodos);
// todoRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['creator','editor']), TodoController.createTodo);
// todoRoutes.delete('/:todo_id', requireAuth, AuthenticationController.roleAuthorization(['editor']), TodoController.deleteTodo);

module.exports = router;