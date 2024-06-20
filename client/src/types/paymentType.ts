export type CheckoutResponse = {
  url: string
}
export type Card = {
  type: 'card',
  card: {
    number: string,
    exp_month: number,
    exp_year: number,
    cvc: string,
  },
}

export type PaymentMethod = {
  id: string,
  last4: string,
  brand: string,
  customer: string
  default: boolean
}