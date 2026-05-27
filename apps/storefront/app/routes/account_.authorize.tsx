import type {Route} from './+types/account_.authorize';
import {setCustomerAccountNoStore} from '~/lib/customerAccountRoutes';

export async function loader({context}: Route.LoaderArgs) {
  return setCustomerAccountNoStore(await context.customerAccount.authorize());
}
