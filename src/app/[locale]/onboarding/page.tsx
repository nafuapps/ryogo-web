//Onboarding (intro) page

import {useTranslations} from 'next-intl';
 
export default function OnboardingHomePage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}