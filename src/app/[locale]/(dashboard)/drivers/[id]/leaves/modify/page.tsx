//Modify Driver Leave page

import {useTranslations} from 'next-intl';
 
export default function ModifyDriverLeavePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}