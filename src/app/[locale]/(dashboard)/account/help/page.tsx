//Account/help page

import {useTranslations} from 'next-intl';
 
export default function AccountHelpPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}