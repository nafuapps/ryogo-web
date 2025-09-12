//Action_center page

import {useTranslations} from 'next-intl';
 
export default function ActionCenterPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}