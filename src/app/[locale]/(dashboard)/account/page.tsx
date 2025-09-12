//Account page

import {useTranslations} from 'next-intl';
 
export default function AccountPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}