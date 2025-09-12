//(Onboarding) Add agency and owner page

import {useTranslations} from 'next-intl';
 
export default function CreateAgencyPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}