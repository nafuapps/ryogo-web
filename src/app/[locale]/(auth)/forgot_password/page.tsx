//Forgot password page

import {useTranslations} from 'next-intl';
 
export default function ForgotPasswordPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}
