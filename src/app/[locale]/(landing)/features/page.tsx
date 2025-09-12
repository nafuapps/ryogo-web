//(Landing) Features page

import {useTranslations} from 'next-intl';
 
export default function FeaturesPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}