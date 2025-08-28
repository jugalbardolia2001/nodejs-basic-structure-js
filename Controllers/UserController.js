const { models } = require('../DbConfig/config.js')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { AccessTokenGenarate, RefereshTokenGenarate } = require('../Helper/TokenGenarate.js')

const UserSignupController = async (req, res) => {
    try {
        const { email, password, phno } = req.body
        if (!(email || password)) {
            return res.status(400).send({ message: "email password required" })
        }

        //check for existing email
        const existingemailcheck = await models.Users.findOne({ where: { email: email } })
        if (existingemailcheck) {
            return res.status(400).send({ message: "email already exist" })
        } 
        const userId = uuidv4();
        //generate referesh and access token  
        const newUser = await models.Users.create(
            {
                user_id: userId,
                email,
                password,
                phno
            })

        return res.status(200).send({ message: "user created successfully" })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).send({ message: "email required" })
        }
        if (!password) {
            return res.status(400).send({ message: "password required" })
        }
        const user = await models.Users.findOne({ where: { email: email } })
        if (!user) {
            return res.status(400).send({ message: "invalid email" })
        }
        const checkpassword = await bcrypt.compare(password, user.password)
        if (!checkpassword) {
            return res.status(400).send({ message: "invalid password" })
        }
        //generate tokens
        const referesh_token = await RefereshTokenGenarate(user)
        const accesstoken = await AccessTokenGenarate(user)
        //update in db
        await models.Users.update({
            referesh_token,
            token_expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 7 days expiry
            token_revoked: 0
        },
            { where: { user_id: user.user_id } }
        )

        return res.status(200).send({ message: "user login successfully", user: { email: user.email, user_id: user.user_id, accesstoken, referesh_token } })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserLogoutController = async (req, res) => {
    try {
        //fetch from header
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(400).send({ message: "authorization header required" })
        }
        const referesh_token = authorizationHeader.split(" ")[1]
        if (!referesh_token) {
            return res.status(400).send({ message: "referesh token required" })
        }
        else {
            const user = await models.Users.findOne({ where: { referesh_token: referesh_token } })
            if (!user) {
                return res.status(400).send({ message: "invalid referesh token" })
            }
            //verify using jwt
            else {
                const decoded = jwt.verify(referesh_token, process.env.REFRESH_TOKEN_SECRET)
                if (!decoded) {
                    return res.status(400).send({ message: "invalid referesh token" })
                }
                //update in db
                await models.Users.update({
                    referesh_token: null,
                    token_expired_at: null,
                    token_revoked: 1
                },
                    { where: { referesh_token: referesh_token } }
                )
                return res.status(200).send({ message: "user logout successfully" })
            }
        }

    } catch (error) {
        console.log(error);
         res.status(400).send({ message: error.message })
    }
}

const UserphnoupdateController = async (req, res) => {
    try {
        const userId = req.user_id;
        const { phno } = req.body
        if(!phno){
            return res.status(400).send({ message: "phno required" })
        }
        //check and verify for access token before updating
        const user = await models.Users.findOne({ where: { user_id : userId } })
        if(!user){
            return res.status(400).send({ message: "invalid access token" })
        }
        //update in db
        await models.Users.update({ phno }, { where: { user_id: userId } })
        return res.status(200).send({ message: "user phno updated successfully" })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}

const UserRefereshTokenController = async (req, res) => {   
    try {
        const payload = {
            user_id: req.user_id,
            created_at: req.user.created_at,
            updated_at: req.user.updated_at,
          }; 
    const accesstoken = await AccessTokenGenarate(payload)
     const referesh_token = await RefereshTokenGenarate(payload) 
    return res.status(200).send({message : "token refereshed succesfully" , accessToken : accesstoken,
        refereshToken : referesh_token
    })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message })
    }
}   

// public async getUserCreditHistory(req: Request, res: Response) {
//         try {
//             let { search = '', sort_order = 'DESC', sort_field = 'created_date', page_no = 1, page_record = 10 } = req.body;
//             let rowLimit = parseInt(page_record);
//             let rowOffset = page_no ? ((page_no * rowLimit) - rowLimit) : 0;
//             let whereCondition: any = {};

//             if (search) {
//                 whereCondition = {
//                     [Op.or]: [
//                         { credits: { [Op.like]: `%${search}%` } },
//                         { reason: { [Op.like]: `%${search}%` } },
//                         { '$sycu_user.display_name$': { [Op.like]: `%${search}%` } },
//                         { '$sycu_user.email$': { [Op.like]: `%${search}%` } }
//                     ]
//                 };
//             }

//             let data = await dbReader.gmpUserCreditsHistory.findAndCountAll({
//                 attributes: ['user_credit_history_id', 'user_id', 'credits', 'type', 'reason', 'created_date'],
//                 include: [{
//                     model: dbReader.users,
//                     attributes: ['first_name', 'last_name', 'email', 'display_name'],
//                     where: { is_deleted: 0, status: 1 }
//                 }],
//                 where: whereCondition,
//                 order: [[sort_field, sort_order]],
//                 limit: rowLimit,
//                 offset: rowOffset
//             });
//             data = JSON.parse(JSON.stringify(data));
//             new SuccessResponse(EC.errorMessage(EC.success), {
//                 // @ts-ignore
//                 token: req.token,
//                 count: data.count,
//                 rows: data.rows
//             }).send(res);
//         } catch (e: any) {
//             ApiError.handle(new BadRequestError(e.message), res);
//         }
//     }


// public async listAllUserSubscriptions(req: Request, res: Response) {
//         try {
//             let { duration_filter, recurring_filter, status_filter, search = '', sort_order = 'DESC',
//                 sort_field = 'created_date', page_no = 1, page_record = 10 } = req.body;

//             let filterCondition: any = {};
//             let rowLimit = parseInt(page_record);
//             let rowOffset = page_no ? ((page_no * rowLimit) - rowLimit) : 0;
//             let whereCondition: any = {}; // Default condition

//             if (search) {
//                 whereCondition = {
//                     [Op.or]: [
//                         { gmp_user_subscription_id: { [Op.like]: `%${search}%` } },
//                         { '$gmp_subscription.title$': { [Op.like]: `%${search}%` } },
//                         { '$sycu_user.display_name$': { [Op.like]: `%${search}%` } },
//                         { '$sycu_user.email$': { [Op.like]: `%${search}%` } },
//                     ]
//                 };
//             }

//             if (sort_field == 'amount') sort_field = dbReader.Sequelize.literal('gmp_subscription.dollar_price');
//             if (sort_field == 'duration') sort_field = dbReader.Sequelize.literal('gmp_subscription.duration');
//             if (sort_field == 'is_recurring') sort_field = dbReader.Sequelize.literal('gmp_subscription.is_recurring');

//             if (duration_filter) {
//                 filterCondition.duration = duration_filter;
//             }
//             if (recurring_filter !== undefined) { //0 - one time purchase, 1- recurring
//                 filterCondition.is_recurring = recurring_filter;
//             }
//             if (status_filter) {
//                 whereCondition.status = status_filter;
//             }

//             let gmpUserSubscriptionData = await dbReader.gmpUserSubscriptions.findAndCountAll({
//                 attributes: ['gmp_user_subscription_id', 'subscription_id', 'user_id', 'status',
//                     'created_date', 'next_renewal_date','updated_renewal_date', 'subscription_price', 'pg_transaction_type'],
//                 include: [{
//                     model: dbReader.gmpSubscriptions,
//                     attributes: ['subscription_id', 'title', 'duration', 'is_recurring', 'dollar_price'],
//                     where: filterCondition,
//                 }, {
//                     model: dbReader.users,
//                     attributes: ['first_name', 'last_name', 'email', 'display_name'],
//                     where: { is_deleted: 0, status: 1 },
//                 }, {
//                     model: dbReader.gmpTransactionItems,
//                     attributes: ['transaction_item_id', 'item_type', 'item_type_id', 'amount', 'credits', 'created_date', 'transaction_id'],
//                     where: { is_deleted: 0, item_type: 1 },
//                     include: [{
//                         model: dbReader.gmpTransactions,
//                         where: { is_deleted: 0 },
//                         attributes: ['transaction_id', 'transaction_type', 'stripe_payment_invoice_id', 'pg_customer_card_id',
//                             'user_id', 'total_amount', 'sub_amount', 'discount_amount', 'total_used_credits', 'status',
//                             'is_renewal', 'pg_transaction_type', 'created_date', 'updated_date'],
//                     }],
//                     limit: 1,
//                     order: [['created_date', 'DESC']]
//                 }],
//                 where: whereCondition,
//                 order: [[sort_field, sort_order]],
//                 limit: rowLimit,
//                 offset: rowOffset,
//             });

//             gmpUserSubscriptionData = JSON.parse(JSON.stringify(gmpUserSubscriptionData));
//             new SuccessResponse(EC.errorMessage(EC.growMarketplaceUserSubscriptionListing), {
//                 // @ts-ignore
//                 token: req.token,
//                 count: gmpUserSubscriptionData.count,
//                 rows: gmpUserSubscriptionData.rows
//             }).send(res);
//         } catch (error: any) {
//             ApiError.handle(new BadRequestError(error.message), res);
//         }
//     }
module.exports = { UserSignupController, UserLoginController ,
    UserLogoutController,UserphnoupdateController,UserRefereshTokenController}