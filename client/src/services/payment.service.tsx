import { AxiosResponse } from 'axios'
import { CheckoutResponse, PaymentMethod } from '../types/paymentType.ts'
import { UserData } from '../types/buyerType.ts'
import { authProvider, AxiosProvider } from '../config/axiosProvider.ts'
import {HTTPStatus, HTTPStatusCodes} from "../config/HTTPStatusCodes.ts";

class PaymentService {
  constructor(private readonly api: AxiosProvider, private readonly httpStatus: HTTPStatusCodes) {}

  setUpCheckout = async (
    user: UserData | null
  ): Promise<AxiosResponse<CheckoutResponse>> => {
    return await this.api.getApi().post('/api/payment/setup', { ...user })
  }

  getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    return await this.api.getApi().get('/api/payment/payment-methods').then(data=> {
      if (data.status === this.httpStatus.NO_CONTENT) return []
      return data.data
    })
  }

  detachPaymentMethod = async (
    payment_method_id: string,
    user_id: string
  ): Promise<AxiosResponse<PaymentMethod>> => {
    return await this.api
      .getApi()
      .post('/api/payment/detach/payment-method', { payment_method_id, user_id })
  }

  updateDefaultPaymentMethod = async (
    payment_method_id: string,
    user_id: string
  ): Promise<AxiosResponse<PaymentMethod>> => {
    return await this.api
      .getApi()
      .put('/api/payment/update/payment-method', { payment_method_id, user_id })
  }
}

// Create one instance (object) of the service
const paymentService = new PaymentService(authProvider, HTTPStatus)

export default paymentService
