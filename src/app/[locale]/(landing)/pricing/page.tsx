//(Landing) Pricing page

import {useTranslations} from 'next-intl';
 
export default function PricingPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}