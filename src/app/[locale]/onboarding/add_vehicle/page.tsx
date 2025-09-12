//(Onboarding) Add vehicle page

import {useTranslations} from 'next-intl';
 
export default function AddVehiclePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}