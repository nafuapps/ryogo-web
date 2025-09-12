//Onboarding success page - redirect to dashboard

import {useTranslations} from 'next-intl';
 
export default function OnboardingSuccessPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}