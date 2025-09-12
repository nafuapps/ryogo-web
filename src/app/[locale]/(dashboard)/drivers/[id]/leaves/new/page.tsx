//New Driver Leave Page

import {useTranslations} from 'next-intl';
 
export default function NewDriverLeavePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}