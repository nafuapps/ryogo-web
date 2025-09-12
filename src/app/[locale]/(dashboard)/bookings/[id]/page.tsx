//Bookings/id (details) page

import {useTranslations} from 'next-intl';
 
export default function BookingDetailsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}