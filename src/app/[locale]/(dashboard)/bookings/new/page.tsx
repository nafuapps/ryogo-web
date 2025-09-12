//Bookings/new page

import {useTranslations} from 'next-intl';
 
export default function NewBookingPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}