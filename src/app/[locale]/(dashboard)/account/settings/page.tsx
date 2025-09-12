//Settings for user account

import {useTranslations} from 'next-intl';
 
export default function AccountSettingsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}