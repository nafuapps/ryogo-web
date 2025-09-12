//New agent loggin in for the first time or existing user resetting password

import {useTranslations} from 'next-intl';
 
export default function ChangePasswordPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}