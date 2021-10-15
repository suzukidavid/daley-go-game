import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'
import Header from '../../containers/section/Header'
import Content from '../../containers/section/Content';
import NavBox from '../../containers/section/NavBox';
import BattleRun from '../../containers/section/BattleRun';
import { getRace } from '../../libs/api';

// Import Application class that is the main part of our PIXI project
// import { Application } from '@pixi/app'

// In order that PIXI could render things we need to register appropriate plugins
// import { Renderer } from '@pixi/core' // Renderer is the class that is going to register plugins

// import { BatchRenderer } from '@pixi/core' // BatchRenderer is the "plugin" for drawing sprites

// import { TilingSpriteRenderer } from '@pixi/sprite-tiling' // TilingSpriteRenderer is the plugin for drawing tiling sprites, which is the key solution for our "endless sprites" task

// import { TickerPlugin } from '@pixi/ticker' // TickerPlugin is the plugin for running an update loop (it's for the application class)

// import { InteractionManager } from '@pixi/interaction';

// And just for convenience let's register Loader plugin in order to use it right from Application instance like app.loader.add(..) etc.
//import { AppLoaderPlugin } from '@pixi/loaders'

//import PixiApp from '../../pixi/PixiApp'

//if ( !window['pixiPluginRegistered'] ) {
  // window.pixiPluginRegistered = true;
  // Renderer.registerPlugin('batch', BatchRenderer)
  // Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer)
  // Renderer.registerPlugin('interaction', InteractionManager);
  // Application.registerPlugin(TickerPlugin)
  // Application.registerPlugin(AppLoaderPlugin)
//}


export default function BattlePage({race}) {
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
        <BattleRun race={race}/>
      </Content>
    </div>
  )
}

export async function getStaticPaths() {

  return {
      paths: [], //indicates that no page needs be created at build time
      fallback: 'blocking' //indicates the type of fallback
  }
}

export async function getStaticProps({locale, params:{id}}) {
  var race = await getRace(id)
  //console.log ( 'race', race );
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
      // Will be passed to the page component as props
      race,
    },
    revalidate: 30
  };
}
