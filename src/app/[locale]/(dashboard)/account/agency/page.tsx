//Account/agency details page (only accessible by owner)
import {useTranslations} from 'next-intl';
 
export default function AgencyPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}