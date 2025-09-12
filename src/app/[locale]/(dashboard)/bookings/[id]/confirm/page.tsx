//bookings/id/confirm page

import {useTranslations} from 'next-intl';
 
export default function ConfirmBookingPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}