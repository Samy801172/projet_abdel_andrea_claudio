export const environment = {
  production: false,
  apiUrl: 'YOUR_API_URL',
  paypalClientId: 'YOUR_PAYPAL_CLIENT_ID',
  paypalMode: 'sandbox',
  endpoints: {
    products: '/products',
    stock: '/stock',
    payments: '/payments',
    orders: '/orders',
    auth: '/auth',
    users: '/users',
    promotions:'/promotions'
  },
  googleAuth: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: 'YOUR_REDIRECT_URI'
  }
}; 