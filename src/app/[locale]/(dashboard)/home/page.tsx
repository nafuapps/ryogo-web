//Dashboard home page

import {useTranslations} from 'next-intl';
 
export default function DashboardHomePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}