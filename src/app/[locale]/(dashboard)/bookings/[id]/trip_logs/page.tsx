//Booking/id/trip_logs page

import {useTranslations} from 'next-intl';
 
export default function TripLogsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}