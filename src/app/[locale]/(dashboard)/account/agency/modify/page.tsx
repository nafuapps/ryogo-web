//Account/agency/modify page (only accessible by owner)

import {useTranslations} from 'next-intl';
 
export default function ModifyAgencyPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}