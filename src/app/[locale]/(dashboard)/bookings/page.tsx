//All Bookings page

import {useTranslations} from 'next-intl';
 
export default function AllBookingsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}