//Modify Vehicle service record page

import {useTranslations} from 'next-intl';
 
export default function ModifyVehicleServicePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}