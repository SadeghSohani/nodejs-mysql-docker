import User from '#root/models/user.model';
import log from '#root/utils/logger';
import jwt from 'jsonwebtoken';
import app from '#root/app';
import response from '#root/utils/response';

export async function registerUser(req,res) {
    const user = await User.create({ 
        email: req.body.email,
        password: req.body.password, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
    }).then(user => {
        res.json(response.success("User registered successfully.", user));
    }).catch(err => {
        res.json(response.failure(500, "User registration failed.", err));
    });
}

export function loginUser(req,res) {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({where: {email: email}}).then(user => {

        if (user.password === password) {
            const expireTime = 36000;
            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + parseInt(expireTime),
                email: email
            }, app.get('secret'));
            log.debug(`user login successfully with email: ${email}`);
            res.json(response.success("User logged in successfully.", {token: token}));
        } else {
            log.warn(`user not login successfully with email: ${email}, invalid email or password.`);
            res.json(response.failure(401, "User not logged in successfully.", "Invalid email or password."));
        }

    })
    .catch(err => {
        log.error(err);
        res.json(response.failure(401, "User not found with this email.", err));
    });
}