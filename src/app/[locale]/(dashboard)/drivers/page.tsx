//All Drivers page

import {useTranslations} from 'next-intl';
 
export default function AllDriversPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}