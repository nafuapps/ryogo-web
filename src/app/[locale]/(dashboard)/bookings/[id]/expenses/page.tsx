//Bookings/id/expenses page

import {useTranslations} from 'next-intl';
 
export default function ExpensesPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}