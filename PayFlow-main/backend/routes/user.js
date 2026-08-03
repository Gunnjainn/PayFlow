const { Router } = require("express");
const z = require('zod');
const bcrypt = require('bcrypt');
const { User, Account } = require("../db");
const userRouter = Router();

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");
const { AuthorizedUser } = require("../middleware");



const signUpBodySchema= z.object({
    username : z.string().email(),
    password : z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName : z.string().min(1, 'First name is required'),
    lastName : z.string().min(1, 'Last name is required')

})


const signInBodySchema= z.object({
    username : z.string().email(),
    password : z.string()
})


const updateBodySchema = z.object({
    firstName : z.string().optional(),
    lastName : z.string().optional(),
    password : z.string().optional(),
}).strict()



userRouter.post('/signup' , async(req ,res)=>{
    try {
        const {body} = req;
        const {success, error} = signUpBodySchema.safeParse(body);

        if(!success){
            return res.status(400).json({
                message : 'Invalid Inputs',
                errors: error.errors
            }); 
        }

        const existingUser = await User.findOne({username : body.username});
        if(existingUser?._id){
            return res.status(409).json({
                message : 'Email already taken'
            })
        }
        
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(body.password, 10);
        
        const UserCreated = await User.create({
            ...body,
            password: hashedPassword
        });

        await Account.create({
            userId : UserCreated._id,
            balance : 1 + Math.random()*1000
        })
        
        // Create token with expiration
        const token = jwt.sign({
            userId : UserCreated._id
        } , JWT_SECRET, { expiresIn: '24h' });

        return res.status(201).json({
            message : "User Created Successfully",
            token : token
        })
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
})



userRouter.post('/signin' , async(req ,res)=>{
    try {
        const {success} = signInBodySchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
                message : 'Invalid Request Body'
            })
        }

        const user = await User.findOne({
            username : req.body.username
        })

        if(!user){
            return res.status(401).json({
                message : 'Invalid credentials'
            })
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if(!isPasswordValid){
            return res.status(401).json({
                message : 'Invalid credentials'
            })
        }

        // Create token with expiration
        const token = jwt.sign({
            userId : user._id
        }, JWT_SECRET, { expiresIn: '24h' })

        return res.json({
            token : token
        })
    } catch (error) {
        console.error('Signin error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
})

userRouter.get('/auth' , AuthorizedUser ,async(req ,res)=>{
    const user = await User.findById(req.userId);
    const {firstName} = user;
    
    return res.json({
      firstName
    });
})

userRouter.put('/' , AuthorizedUser , async(req ,res , next)=>{
    
    const {success} = updateBodySchema.safeParse(req.body);
    
    if(!success){
        return res.json({
            message : 'Invalid Update Body'
        }).status(411);
    }
    // Never write req.body straight through: a password arriving here has to
    // be hashed with the same cost factor signup uses, or sign-in can never
    // match it again and the account is locked out with the plaintext stored.
    const update = { ...req.body };
    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }

    await User.findByIdAndUpdate(req.userId, update);

    return res.json({
        message : 'Updated Successfully'
    })


})

userRouter.get('/bulk' ,AuthorizedUser, async (req , res)=>{
    const filter = req.query.filter || '';

    const users = await User.find({
    $or: [
        { firstName: { $regex: filter, $options: 'i' } },
        { lastName: { $regex: filter, $options: 'i' } }
    ]
    });

    return res.json({
        users: users.map((user)=> ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })

})




module.exports={
    userRouter
}