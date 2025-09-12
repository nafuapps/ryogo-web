//Drivers/id/modify page (only accessible by owner)

import {useTranslations} from 'next-intl';
 
export default function ModifyDriverPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}