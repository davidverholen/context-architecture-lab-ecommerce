import {redirect} from 'react-router';
import type {Route} from './+types/account_.logout';
import {setCustomerAccountNoStore} from '~/lib/customerAccountRoutes';

export async function loader() {
  return redirect('/account');
}

export async function action({context}: Route.ActionArgs) {
  return setCustomerAccountNoStore(
    await context.customerAccount.logout({
      postLogoutRedirectUri: '/',
    }),
  );
}
