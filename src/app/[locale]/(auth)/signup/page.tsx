//Signup page

import {useTranslations} from 'next-intl';
 
export default function SignupPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}
