//Users/id (details) page (only accesssible by owner)

import {useTranslations} from 'next-intl';
 
export default function UserDetailsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}