const router = require('express').Router();
const auth_Model = require('../controllers/auth_controller');
const validatorMiddleware =require('../middleware/validation_middleware');
const authMiddleware=require('../middleware/auth_middleware');

router.get('/login',authMiddleware.oturumAcilmamis,auth_Model.loginPage);
router.post('/login',authMiddleware.oturumAcilmamis,validatorMiddleware.validateLogin(),auth_Model.loginPOST)
router.get('/register',authMiddleware.oturumAcilmamis,auth_Model.registerPage);
router.post('/register',authMiddleware.oturumAcilmamis,validatorMiddleware.validateNewUser(),auth_Model.registerPOST)
router.get('/forget_password',authMiddleware.oturumAcilmamis,auth_Model.forget_pass);
router.post('/forget_password',authMiddleware.oturumAcilmamis,validatorMiddleware.validateEmail(),auth_Model.forgetPassPOST);
router.get('/logout',authMiddleware.oturumAcilmis,auth_Model.logOut);
router.get('/verify',auth_Model.verifyMail);
router.get('/reset-password/:id/:token',auth_Model.newPasswordForm);
router.get('/reset-password/',auth_Model.newPasswordForm);
router.post('/reset-password/',validatorMiddleware.validateNewPassword(),auth_Model.newPasswordSave);

module.exports = router;