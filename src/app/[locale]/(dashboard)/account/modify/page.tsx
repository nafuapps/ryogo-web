//Account/modify page (any user can edit their basic account details)
//Change password flow - new page or modal?

import {useTranslations} from 'next-intl';
 
export default function ModifyAccountPage() {
  const t = useTranslations('Landing');
  return <h1>{t('title')}</h1>;
}