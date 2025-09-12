//Bookings/id/transactions/new page

import {useTranslations} from 'next-intl';
 
export default function NewTransactionPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}