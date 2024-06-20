import { TestDBSetup } from "../db_tests.ts";
import { SupabaseWrapper } from "../../main/config/supabaseProvider.ts";
import UserDAO from "../../main/data/userDAO.ts";
import {EnvConfig} from "../../main/config/envConfig.ts";
describe('PaymentDAO tests', () => {
    const setup = new TestDBSetup();
    const supabase = new SupabaseWrapper(setup.supabase());

    const dao = new UserDAO(supabase, new EnvConfig());

    describe('store data payment workflow', () => {

        it('should update data of costumer', async () => {

            const paymentMethodsID = '4345591282480197';
            const userEmail = 'zequi@sellmethehouse.com';
            const paymentMethodsID2 = '4345591282480198';

            const getStripeUser = await dao.getUserByEmail(userEmail);
            // Update only card
            const customer_id = getStripeUser.stripe_customer_id
            const updateUserPaymentMethod = await dao.updateBuyerByEmail({stripe_payment_method_id:paymentMethodsID}, userEmail);
            expect(updateUserPaymentMethod.stripe_payment_method_id).toBe(paymentMethodsID);
            const getUser = await dao.getUserByEmail(userEmail);
            expect(getUser.stripe_payment_method_id).toBe(paymentMethodsID)
            // Update customer_id and card
            const updateUserPaymentMethod2 = await dao.updateBuyerByEmail({stripe_customer_id: customer_id, stripe_payment_method_id: paymentMethodsID2}, userEmail);
            // get user to check update
            const getStripeUser2 = await dao.getUserByEmail(updateUserPaymentMethod2.email);
            expect(updateUserPaymentMethod2).toStrictEqual(getStripeUser2);
        })
    })
});