import Stripe from "stripe";
import { anyNumber, anyString, instance, mock, when } from "ts-mockito";
import StripeIAO from "../main/data/stripeIAO.ts";
import { ApiTests } from "./resource_tests.ts";
import SubscriptionsDAO from "../main/data/subscriptionsDAO.ts";
import PaymentDAO from "../main/data/paymentDAO.ts";
import UserDAO from "../main/data/userDAO.ts";
import PaymentService from "../main/services/paymentService.ts";
import TransactionsDAO from "../main/data/transactionsDAO.ts";
import TransactionsService from "../main/services/transactionsService.ts";
import SubscriptionsService from "../main/services/subscriptionService.ts";
import SubscriptionsCalculator from "../main/controllers/subscriptionCalculator.ts";
import { TestDBSetup } from "./db_tests.ts";
import { SupabaseWrapper } from "../main/config/supabaseProvider.ts";

export default class MockDataGenerator {
    mockPaymentMethods = (n: number, prefix:string): Stripe.PaymentMethod[] => {
        const stripeCard = mock<Stripe.PaymentMethod.Card>()
        const mockPaymentMethods: Stripe.PaymentMethod[] = [];
        for (let i = 0; i < n; i++) {
            const stripePaymentMethod = mock<Stripe.PaymentMethod>()
            const pm = instance(stripePaymentMethod)
            pm.id = `pm_${prefix}${i + 1}`
            pm.card = instance(stripeCard);
            pm.card.brand = "visa";
            pm.card.country = "US";
            pm.card.exp_month = 1;
            pm.card.exp_year = 2022;
            pm.card.last4 = "4242";

            mockPaymentMethods.push(pm);
        }
        return mockPaymentMethods;
    }

    mockSinglePaymentMethod = (): { id: string, card: Stripe.PaymentMethod.Card } => {
        const stripeCard = mock<Stripe.PaymentMethod.Card>()
        const id = `pm_1`
        const card = instance(stripeCard);
        card.brand = "visa";
        card.country = "US";
        card.exp_month = 1;
        card.exp_year = 2022;
        card.last4 = "4242";
        return { id, card }
    }

    mockedApiTestWithStripeIAOMockedPaymentMethods = () =>{
        const stripeMock = mock(StripeIAO)
        const mockDataGenerator = new MockDataGenerator()
        const userStripeCustomerId = 'cus_OpyG9tsN8TLqY2'
        const zequiAdminID = "123e4567-e89a-12d3-b456-226600000102";
        when(stripeMock.getPaymentMethodsByCustomerId(userStripeCustomerId)).thenResolve(mockDataGenerator.mockPaymentMethods(3,''))
        when(stripeMock.getPaymentMethodsByCustomerId(zequiAdminID)).thenResolve(mockDataGenerator.mockPaymentMethods(1,'other_buyer'))
        when(stripeMock.detachPaymentMethod("pm_1")).thenResolve(mockDataGenerator.mockSinglePaymentMethod())
        const stripeInstance = instance(stripeMock)
        return new ApiTests(stripeInstance);
    }

    mockedStripeIAOWithChargeResponseIncludingFailed = () => {
        const stripeMock = mock(StripeIAO);
        const chargeResponse = mock<Stripe.Response<Stripe.PaymentIntent>>();
        const responseInstance = instance(chargeResponse)
        when(stripeMock.chargeCustomerByIdAndPaymentMethod(anyString(), anyString(), anyNumber())).thenResolve(
            { ...responseInstance, id: 'StripeMockPaymentID' + 1, status: 'succeeded' },
            { ...responseInstance, id: 'StripeMockPaymentID' + '1b', status: 'canceled' },
            { ...responseInstance, id: 'StripeMockPaymentID' + 2, status: 'succeeded' },
            { ...responseInstance, id: 'StripeMockPaymentID' + 3, status: 'succeeded' }
        )
        return instance(stripeMock)
    }

    mockedStripeIAOWithChargeResponse = () => {
        const stripeMock = mock(StripeIAO);
        const chargeResponse = mock<Stripe.Response<Stripe.PaymentIntent>>();
        const responseInstance = instance(chargeResponse)
        when(stripeMock.chargeCustomerByIdAndPaymentMethod(anyString(), anyString(), anyNumber())).thenResolve(
            { ...responseInstance, id: 'StripeMockPaymentID' + 1, status: 'succeeded' },
            { ...responseInstance, id: 'StripeMockPaymentID' + 2, status: 'succeeded' },
            { ...responseInstance, id: 'StripeMockPaymentID' + 3, status: 'succeeded' }
        )
        return instance(stripeMock)
    }

    subscriptionServiceWithCustomStripeIAO = (stripeMock:StripeIAO) => {
        const setup = new TestDBSetup();
        const supabase = new SupabaseWrapper(setup.supabase());

        const subscriptionsDao = new SubscriptionsDAO(supabase);
        const paymentDao = new PaymentDAO(setup.supabase(),supabase)
        const userDao = new UserDAO(supabase, setup.envConfig())
        const paymentService = new PaymentService(userDao, stripeMock, paymentDao);
        const transactionsDao = new TransactionsDAO(supabase)
        const transactionsService = new TransactionsService(transactionsDao)
        return new SubscriptionsService(subscriptionsDao, paymentService, transactionsService, new SubscriptionsCalculator());
    }

    paymentServiceWithCustomStripeIAO = (stripeMock:StripeIAO) => {
        const setup = new TestDBSetup();
        const supabase = new SupabaseWrapper(setup.supabase());

        const paymentDao = new PaymentDAO(setup.supabase(),supabase)
        const userDao = new UserDAO(supabase, setup.envConfig())
        return new PaymentService(userDao, stripeMock, paymentDao);
    }

    mockedApiTestWithStripeIAOMockedSetUpIntent = ( data : { possibleCustomerIdCreation: string, urlReturned:string }) =>{
        const stripeMock = mock(StripeIAO)
        const stripeCustomer = mock<Stripe.Response<Stripe.Customer>>()
        when(stripeMock.createCustomer(anyString())).thenResolve({ ...stripeCustomer, id: data.possibleCustomerIdCreation })
        when(stripeMock.createStripeCheckoutSetUpIntentSession(anyString(), anyString())).thenResolve({ url: data.urlReturned })
        const stripeInstance = instance(stripeMock)
        return new ApiTests(stripeInstance);
    }

}