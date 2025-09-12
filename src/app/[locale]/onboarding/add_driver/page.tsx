//(Onboarding) Add driver page

import {useTranslations} from 'next-intl';
 
export default function AddDriverPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}