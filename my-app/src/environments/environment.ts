// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:2024/api',
  paypalClientId: 'AYu0FhU6VKkIsk_x3DYp3ZDBn57Z0JnrYQJShGFcg3DRIquZzZIv0kBEiHw1dNKx2-enGPHWzyfUEtwM',
  paypalMode: 'sandbox',
  endpoints: {
    products: '/products',
    stock: '/stock',
    payments: '/payments',
    orders: '/orders',
    auth: '/auth',
    users: '/users',
    promotions:'/promotions'
  }
};
