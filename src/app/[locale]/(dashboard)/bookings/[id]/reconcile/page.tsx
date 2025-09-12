//Bookings/id/reconcile page (only accessible to owner)

import {useTranslations} from 'next-intl';
 
export default function ReconcileBookingPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}