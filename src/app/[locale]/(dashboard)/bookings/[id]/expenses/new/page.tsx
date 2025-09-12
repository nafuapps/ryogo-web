//Bookings/id/expenses/new page

import {useTranslations} from 'next-intl';
 
export default function NewExpensePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}