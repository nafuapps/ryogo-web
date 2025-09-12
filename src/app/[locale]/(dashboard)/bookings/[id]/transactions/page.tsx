//Bookings/id/transactions page

import {useTranslations} from 'next-intl';
 
export default function TransactionsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}