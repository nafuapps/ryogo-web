//(Onboarding) Add user page

import {useTranslations} from 'next-intl';
 
export default function AddUserPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}