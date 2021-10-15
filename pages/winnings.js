import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Header from '../containers/section/Header'
import Content from '../containers/section/Content';
import NavBox from '../containers/section/NavBox';

export default function Home() {
  const { t } = useTranslation('common');
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{t('appName')}</title>
        <meta name="description" content={t('appDescription')} />
      </Head>

      <Header/>
      <Content>
        <NavBox/>
      </Content>

    </div>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
      // Will be passed to the page component as props
    },
    revalidate: 30
  };
}
