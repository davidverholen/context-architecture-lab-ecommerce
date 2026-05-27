export const CUSTOMER_ACCOUNT_NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

export function setCustomerAccountNoStore(response: Response) {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export function rethrowCustomerAccountNoStore(error: unknown): never {
  if (error instanceof Response) {
    setCustomerAccountNoStore(error);
  }

  throw error;
}
