//(Landing) About page

import {useTranslations} from 'next-intl';
 
export default function AboutPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}