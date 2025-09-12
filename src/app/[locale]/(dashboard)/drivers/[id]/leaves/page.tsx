//Driver Leaves page

import {useTranslations} from 'next-intl';
 
export default function DriverLeavesPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}