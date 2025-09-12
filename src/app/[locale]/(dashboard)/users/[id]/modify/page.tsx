//Users/id/modify page (only accessible to owner)

import {useTranslations} from 'next-intl';
 
export default function ModifyUserPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}