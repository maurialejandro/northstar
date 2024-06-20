import express, { Request, Response, Router } from 'express'
import PaymentService from '../services/paymentService'
import { injectable } from 'tsyringe'

@injectable()
export default class WebHookResource {
    private readonly router: Router

    constructor(
        private readonly paymentService: PaymentService,
    ) {
        this.router = express.Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {

        // Stripe WebHook
        this.router.post('/stripe-webhook', async (req: Request, res: Response) => {
            const event = req.body.type
            const { id, amount, customer, status } = req.body.data.object
            if (event === 'payment_intent.succeeded') {
                // Post the transaction
                const transactionConfirmation =
                    await this.paymentService.postTransaction(
                        id,
                        customer,
                        amount,
                        status
                    )
                // Update the User's Stripe customer_id and payment_method if necessary
                const userCustomerIdUpdated =
                    await this.paymentService.updateUserIfNecessary(customer)
                if (!transactionConfirmation.error) {
                    res.status(200).send({
                        customerUpdated: userCustomerIdUpdated,
                    })
                    //// TODO Temporary Duplicate hook calls fix
                } else if (
                    transactionConfirmation.error?.message.includes('duplicate key value')
                ) {
                    res.status(200).send({
                        customerUpdated: userCustomerIdUpdated,
                        error: transactionConfirmation.error,
                    })
                } else {
                    res.status(404).send({
                        customerUpdated: userCustomerIdUpdated,
                        error: transactionConfirmation.error,
                    })
                }
            } else {
                res.status(404).send({ message: `Unhandled event type ${event}` })
            }
        })

    }

    public routes(): Router {
        return this.router
    }
}
