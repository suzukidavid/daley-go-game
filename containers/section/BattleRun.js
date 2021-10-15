import { useCallback, useEffect, useState } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link'
import moment from 'moment';
import styles from '../../styles/BattleRun.module.css'

function useStyle(s) {
  return (...args) => {
    return args.map(arg=>s[arg]).join(' ');
  }
}

function formatDiff(t) {
  var d = moment(t).diff(moment(),'seconds');
  if ( d < -60 ) {
    return 'OVER'
  }
  if ( d < 0 ) {
    return 'LIVE'
  }
  var m = Math.floor(d/60);
  var s = d%60;
  if ( m > 60 ) {
    return 'Scheduling'
  }
  if ( m > 0 ) {
    return `${m}m ${s}s`
  }
  return `${s}s`
}

let dt = Date.now();
function dateNext() {
  var dn = dt;
  dt += Math.floor(Math.random()*100000);
  return dn;
}

const battles = [
  {id: '1', title: 'Venus Angels', location:'Venus', level: 6, distance: 1000, entryFee: 0, pricePoll: 54.0, date: dateNext()},
  {id: '2', title: 'Guardian of Venus', location:'Venus', level: 0, distance: 1000, entryFee: 0, pricePoll: 54.0, date: dateNext()},
  {id: '3', title: 'Jupiter Throne', location:'Jupiter', level: 3, distance: 1000, entryFee: 4.0, pricePoll: 43.2, date: dateNext()},
  {id: '4', title: 'Ten Rings', location:'Pluto', level: 1, distance: 1000, entryFee: 6.0, pricePoll: 64.8, date: dateNext()},
  {id: '5', title: 'Throne of Saturn', location:'Saturn', level: 2, distance: 1000, entryFee: 10.0, pricePoll: 108.0, date: dateNext()},
  {id: '6', title: 'Guardian of Pluto', location:'Pluto', level: 0, distance: 1000, entryFee: 5.0, pricePoll: 54.0, date: dateNext()},
  {id: '7', title: 'Rings of Jupiter', location:'Jupiter', level: 0, distance: 1000, entryFee: 5.0, pricePoll: 54.0, date: dateNext()},
  {id: '8', title: 'Venus Throne', location:'Venus', level: 4, distance: 1000, entryFee: 12.0, pricePoll: 129.6, date: dateNext()},
  {id: '9', title: 'Saturn Angels', location:'Saturn', level: 5, distance: 1000, entryFee: 43.2, pricePoll: 43.2, date: dateNext()},
  {id: '10', title: 'Saturn Throne', location:'Saturn', level: 0, distance: 1000, entryFee: 43.2, pricePoll: 43.2, date: dateNext()},
];

const players = [
  {id: '1', name: 'Horse'},
  {id: '2', name: 'Horse'},
  {id: '3', name: 'Horse'},
  {id: '4', name: 'Horse'},
  {id: '5', name: 'Horse'},
  {id: '6', name: 'Horse'},
  {id: '7', name: 'Horse'},
  {id: '8', name: 'Horse'},
  {id: '9', name: 'Horse'},
  {id: '10', name: 'Horse'},
  {id: '11', name: 'Horse'},
  {id: '12', name: 'Horse'},
];
export default function BattleRun({race}) {
  const router = useRouter();
  const css = useStyle(styles);
  const [status, setStatus] = useState(race && race.date > Date.now() ? 'Scheduling...' : 'Completed');
  const [canPlayBack, setCanPlayBack] = useState(false)

  const onUpdate = useCallback(async (players)=>{
    var sorted = players.sort((a,b)=>{
      if ( b.object.place != a.object.place ) {
        return a.object.place - b.object.place;
      }
      return (b.object.x-a.object.x)
    });
    //console.log(sorted.map(a=>a.slot+1).join(' '))
    for(var i=0; i<sorted.length; i++) {
      var player = sorted[i];
      var info = document.getElementById('slot'+player.slot);
      if ( info ) {
        info.className = styles.rankInfo + ' ' + styles['rank'+i];
      }
    }
  },[])

  const startRace = useCallback(()=>{
    window.pixiApp.startRace();
  },[])

  const resetRace = useCallback(()=>{
    for(var i=0; i<12; i++) {
      var info = document.getElementById('slot'+i);
      if ( info ) {
        info.className = styles.rankInfo
      }
    }
    window.pixiApp.resetRace();
    window.pixiApp.startRace();
  },[])

  const initPixiApp = useCallback(async (data)=>{
      // console.log('Data', data);
    
    //if (typeof window !== 'undefined') {
      // Import Application class that is the main part of our PIXI project
      const { Application } = await import('@pixi/app')

      // In order that PIXI could render things we need to register appropriate plugins
      const { Renderer } = await import('@pixi/core') // Renderer is the class that is going to register plugins

      const { BatchRenderer } = await import('@pixi/core') // BatchRenderer is the "plugin" for drawing sprites

      const { TilingSpriteRenderer } = await import('@pixi/sprite-tiling') // TilingSpriteRenderer is the plugin for drawing tiling sprites, which is the key solution for our "endless sprites" task

      const { TickerPlugin } = await import('@pixi/ticker') // TickerPlugin is the plugin for running an update loop (it's for the application class)

      const { InteractionManager } = await import('@pixi/interaction');

      // And just for convenience let's register Loader plugin in order to use it right from Application instance like app.loader.add(..) etc.
      const { AppLoaderPlugin } = await import('@pixi/loaders');

      const PixiApp = window.PixiApp = (await import('../../pixi/PixiApp')).default;
      //console.log( PixiApp )
      if ( !window.pixiPluginRegistered ) {
        window.pixiPluginRegistered = true;
        Renderer.registerPlugin('batch', BatchRenderer)
        Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer)
        Renderer.registerPlugin('interaction', InteractionManager);
        Application.registerPlugin(TickerPlugin)
        Application.registerPlugin(AppLoaderPlugin)
      }

      var dom = document.getElementById('pixiRun');
      //console.log('pixiRun', dom);
      dom.innerHTML = '';
      window.pixiApp = new PixiApp(dom, {race,events:{onUpdate}});
    //}
  },[])

  useEffect(()=>{
    // console.log( 'Race', race, race.date, Date.now(), race.date<Date.now() );
    // console.log('Router', router)
    for(var i=0; i<12; i++) {
      var info = document.getElementById('slot'+i);
      if ( info ) {
        info.className = styles.rankInfo
      }
    }
    var now = Date.now();
    if ( race.date < now ) {
      //fetch(`/data/`)
      var {query:{id}} = router;
      fetch(`/data/${id}.json`)
      .then(response=>response.json())
      .then(data=>{
        if ( data.format ) {
          race.format = data.format;
        }
        race.place = data.place;
        race.steps = data.steps;
        setCanPlayBack(true);
        race.isLive = false;
        if ( race.place ) {
          var end = race.date + race.place[race.place.length-1][1];
          // console.log('End', end, new Date(end));
          if ( now < end ) {
            console.log('LIVE now!');
            document.getElementById('statusText').innerHTML = 'LIVE';
            race.isLive = true;
          }
        }
        initPixiApp(data);
      }).catch((err)=>{
        console.log(err);
      })
    }
    return () => {
      if ( window.pixiApp ) {
        window.pixiApp.kill();
        delete window.pixiApp;
      }
    }
  },[])

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navLink} onClick={()=>{router.back()}}>
          <img src='/img/arrow-left.png'/>
          <span>Back</span>
        </div>
      </div>
      <div className={styles.battleInfo}>
        <div className={styles.title}>{race.name}</div>
        <div className={styles.location}>{race.location}</div>
        <div className={styles.pricePoll}>
          <label>Prizepool</label>
          <span>{(race.prize_pool/1000).toFixed(2)} SOL</span>
        </div>
      </div>
      <div className={styles.battleInfo}>
        <div className={styles.level}>
          <label>Level</label>
          <img src={`/level${race.level}.png`}/>
        </div>
        <div className={styles.distance}>
          <label>Distance</label>
          <span>{race.distance}m</span>
        </div>
        <div className={styles.status}>
          <label>Status</label>
          <span id="statusText">{status}</span>
        </div>
        <div className={styles.control}>
          {canPlayBack && (
          //<button onClick={startRace}>Start</button>
          <button onClick={resetRace}>Replay</button>
          )}
        </div>
      </div>
      <div className={styles.bar}></div>
      <div className={styles.runContainer}>
        <div className={styles.slot}>
          {players.map((p,i)=>(
          <div key={i} className={styles.slotItem}>
            <div className={css('slotNumber',i<4?`slotNumberBg${i+1}`:'slotNumberBg4')}>
              {i+1}
            </div>
            <div className={styles.slotInfo}>
              <img src={`/img/HorseIcon${i+1}.png`}/>
              <label>{p.name}</label>
            </div>
          </div>
          ))}
        </div>
        <div id="pixiRun" className={styles.run}>
        </div>
        <div className={styles.rank}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((i,j)=>(
          <div id={`slot${j}`} key={i} className={styles.rankInfo}>
            <div className={css('rankNumber')}>
              {i}
            </div>
            <img src={`/img/HorseIcon${j+1}.png`}/>
          </div>
          ))}
        </div>
      </div>
      <div className={styles.nextBalletContainer}>
        <label>Next BATTLE</label>
        <div className={styles.nextBalletBox}>
          {[1,2,3,4].map(g=>(
          <div key={g} className={styles.nextGame}>
          </div>
          ))}
        </div>
      </div>
    </div>
  )
}