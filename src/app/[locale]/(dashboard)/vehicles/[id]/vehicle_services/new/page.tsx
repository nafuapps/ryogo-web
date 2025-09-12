//Add a new vehicle service record page

import {useTranslations} from 'next-intl';
 
export default function NewVehicleServicePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}