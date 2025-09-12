//All Users page (only accesssible by owner)

import {useTranslations} from 'next-intl';
 
export default function AllUsersPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}