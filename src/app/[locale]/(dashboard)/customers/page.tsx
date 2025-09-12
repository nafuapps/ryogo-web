//All Customers page

import {useTranslations} from 'next-intl';
 
export default function AllCustomersPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}