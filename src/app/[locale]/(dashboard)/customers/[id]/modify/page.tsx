//Customers/id/modify page

import {useTranslations} from 'next-intl';
 
export default function ModifyCustomerPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}