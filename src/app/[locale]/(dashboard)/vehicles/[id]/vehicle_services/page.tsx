//Vehicle Services page

import {useTranslations} from 'next-intl';
 
export default function VehicleServicesPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}