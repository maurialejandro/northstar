import express, { Request, Response, Router } from 'express'
import PaymentService from '../services/paymentService'
import { injectable } from 'tsyringe'

@injectable()
export default class PaymentResource {

    private readonly router: Router
    constructor(
        private readonly paymentService: PaymentService,
    ) {
        this.router = express.Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {

        // Authenticated because it uses the customer id from authenticator
        this.router.get('/payment-methods', async (req: Request, res: Response) => {
            const { stripe_customer_id } = req.user!
            const response = await this.paymentService.getPaymentMethods(
                stripe_customer_id as string
            )
            if (response === null) return res.sendStatus(403)
            // adds a default property to the response (true if the payment method is the default one)
            response.forEach((paymentMethod) => {
              paymentMethod.default = paymentMethod.id === req.user!.stripe_payment_method_id
            })
            res.status(200).send(response)
        });

        //SetUp Intent
        this.router.post('/setup', async (req: Request, res: Response) => {
            const { email, stripe_customer_id , id } = req.user
            try {
                let cus_id = stripe_customer_id
                if (!stripe_customer_id) {
                    const customerUpdatedWithStripeCusID = await this.paymentService.createStripeCustomer(email, id)
                    cus_id = customerUpdatedWithStripeCusID.stripe_customer_id
                }
                const sessionUrl =
                    await this.paymentService.createCheckoutSetUpIntentSession(
                        email,
                        cus_id
                    )
                res.json(sessionUrl)
            } catch (error) {
                res.status(500).json({ message: 'Internal server error', error })
            }
        })
        
        // Authenticated because it has to match our authenticator user_id
        this.router.post('/detach/payment-method', async (req: Request, res: Response) => {
            const { id, stripe_payment_method_id } = req.user!
            const { payment_method_id , user_id } = req.body
            const response = await this.paymentService.detachPaymentMethod(payment_method_id, id, stripe_payment_method_id, user_id)
            if (response === null) return res.sendStatus(401)
            res.status(200).send(response)
        })

        // Authenticated because it has to match our authenticator user_id
        this.router.put('/update/payment-method', async (req: Request, res: Response) => {
            const { id } = req.user!
            const { payment_method_id, user_id } = req.body
            const response = await this.paymentService.updateDefaultPaymentMethod(
                payment_method_id,
                id,
                user_id
            )
            if (response === null) return res.sendStatus(401)
            res.status(200).send(response)
        })

    }

    public routes(): Router {
    return this.router;
    }
}
