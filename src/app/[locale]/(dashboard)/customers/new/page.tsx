//Customers/new page

import {useTranslations} from 'next-intl';
 
export default function NewCustomerPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}