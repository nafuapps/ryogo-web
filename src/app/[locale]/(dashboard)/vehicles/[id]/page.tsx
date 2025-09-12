//Vehicles/id (details) page

import {useTranslations} from 'next-intl';
 
export default function VehicleDetailsPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}