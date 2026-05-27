import type {Route} from './+types/account_.login';
import {setCustomerAccountNoStore} from '~/lib/customerAccountRoutes';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Context Home | Sign in'}];
};

export async function loader({context}: Route.LoaderArgs) {
  return setCustomerAccountNoStore(await context.customerAccount.login());
}
