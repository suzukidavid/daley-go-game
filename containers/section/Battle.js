import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import moment from 'moment';
import styles from '../../styles/NextBattle.module.css'
import { CloseButton, Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function useStyle(s) {
  return (...args) => {
    return args.map(arg=>s[arg]).join(' ');
  }
}

function formatDiff(t) {
  //return moment(t).locale(lang == 'b5' ? 'zh-hk' :  'en' ).fromNow()
  return moment(t).format("MM/DD");
}

const levels = [
  {title:'Entry', icon:'/icon-man.png'},
  {title:'Level I', icon:'/icon-arrow-1.png'},
  {title:'Level II', icon:'/icon-arrow-2.png'},
  {title:'Level III', icon:'/icon-star.png'},
  {title:'Level IV', icon:'/icon-star-2.png'},
  {title:'Level V', icon:'/icon-star-3.png'},
  {title:'Master', icon:'/icon-star-4.png'},
]
function FilterBox(props) {
  const router = useRouter();
  const {query:{lv}} = router;
  return (
    <div className={styles.filter}>
  
    <div className={!lv ? styles.filterBoxActive : styles.filterBox} onClick={()=>{
      if ( lv ) {
        router.push('');
      }
    }}>
      ALL  
    </div>
    {levels.map((l,i)=>(
    <div key={i} className={lv == i ? styles.filterBoxActive : styles.filterBox} onClick={()=>{
      if ( lv != i ) {
        router.push('?lv='+i);
      }
    }}>
      {l.title}
      <img src={l.icon}/>
    </div>
    ))}
    <div className={styles.filterBoxR}>
      <img src='/filter_alt.png'/>
      Filter
    </div>
  </div>
  )
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

export function PopupInfo({onClose}){

  return (
    <div className={styles.Popupcontainer}>
      <div className={styles.left}>
        <div className={styles.Popuphead}>
        <img src={'/img/Horse1.png'}/>
        <img src={'/img/Horse2.png'}/>
        <img src={'/img/Horse3.png'}/>
        <img src={'/img/Horse5.png'}/>
        
        <img src={'/img/Horse4.png'}/>
        
      </div>
      </div>

      <div className={styles.middle}>
        <div className={styles.popupImage}>
        <img src={'/img/popuphorse.png'}/>
        </div>
        <div className={styles.popupImage}>
          <img src={'/img/stamina.png'}/>
        </div> 
        
          <div className={styles.row3}>
           
            <button className={styles.selectButton}/>

            <button className={styles.cancelButton} onClick={onClose}/>
            
          </div>
          
        </div>
        <div className={styles.right}>
            <div className ={styles.info}>
           <img src={'img/infocontent.png'}/>
          </div>
      </div>
    </div>
  )
}

 function HorsePopup({shown, setShown,onClose}) {
    
    
    return (
      <Modal
      
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={shown}
      afterClose={() => setModalShow(false)}
      dialogClassName={styles.modalContent}
      animation={true}
    >
      <div className={styles.Popupcontainer1}>
        <div className={styles.row2}>
          <button  onClick={onClose} className={styles.closeButton}/>
        {/* <div className={styles.closeWord}>Close</div> */}
        <div></div>
        <button   onClick={onClose} className={styles.homeButton}/> 
        {/* <div className={styles.closeWord}>My Stable</div> */}
         </div> 
        
      <Modal.Body>
        <PopupInfo onClose={onClose}/>
      </Modal.Body>
      </div>
      
    </Modal>
    );
  }
export default function NextBattle({races}) {

  const router = useRouter();
  const {query:{lv}} = router;
  const css = useStyle(styles);
  const [value,setValue] = useState(0);
  const [battles,setBattles] = useState(races);
  const [modalShow,setModalShow] = useState(false);
  
    const handleClose = () => setModalShow(false);
    const handleShow = () => setModalShow(true);

  // useEffect(()=>{
  //   if (typeof window !== 'undefined') {
  //     const i = setInterval(()=>{
  //       setValue(Date.now());
  //       console.log(value, Date.now())
  //     },1000);
  //     return ()=>{
  //       clearInterval(i);
  //     }
  //   }
  // },[])
  
  
  return (
    <div className={styles.container}>
      
      <FilterBox/>
      <HorsePopup
       shown={modalShow}
       setShown={setModalShow}
       onClose={()=>{setModalShow(false)}}
      />
      <div className={styles.details}>
      
        <div className={css('row','bg1','border1')}>
          <div className={css('title','white')}>Title</div>
          <div className={css('location')}>LOCATION</div>
          <div className={css('level')}>LEVEL</div>
          <div className={css('distance')}>DISTANCE</div>
          <div className={css('entryFee')}>ENTRY FEE</div>
          <div className={css('prizePool','green')}>PRIZE POOL</div>
          <div className={css('runsIn')}>REGISTERED</div>
        </div>
       
        {battles.filter(b=>!lv||b.level==lv).sort((a,b)=>a.date-b.date).map((b,i,a)=>(
        <div key={b.address} className={css('pinter','row',((i&1) == 0)?'bg2':'bg3','mt8',(i==a.length-1)?'border2':undefined)} onClick={()=>{
          setModalShow(true)
        }}> 
        
          <div className={css('title','white')}>{b.name}</div>
          <div className={css('location')}>{b.location}</div>
          <div className={css('level')}><img src={`/level${b.level}.png`}/></div>
          <div className={css('distance')}>{b.distance}m</div>
          <div className={css('entryFee','green')}>{!b.entry_fee ? ('FREE') : (<>{((b.entry_fee||0)/1000)?.toFixed(2)} SOL</>)}</div>
          <div className={css('prizePool','green')}>{((b.prize_pool||0)/1000).toFixed(2)} SOL</div>
          <div className={css('runsIn')}>{formatDiff(b.runIn)}</div>
        </div>
        ))}

      </div>
      <div className={styles.heading}>MY STABLE</div>
      <div className={styles.row2}>

        <div className={styles.details_small}>
        <div className={styles.image}>
        <img src={'/img/Frame1.png'}/>
        
        </div>
        <div className={styles.head}>
          Horse
        </div>
        <div className={styles.description}>
        <p>Earn FTR rewards by staking assets for market making</p>
        </div>
        <button className={styles.button1}/>
        
      </div>
      <div className={styles.details_small}>
      <div className={styles.image}>
        <img src={'/img/Frame2.png'}/>
        
        </div>
        <div className={styles.head}>
          Horse
        </div>
        <div className={styles.description}>
        <p>Earn FTR rewards by staking assets for market making</p>
        </div>
        <button className={styles.button2}/>
      </div>
      <div className={styles.details_small}>
      <div className={styles.image}>
        <img src={'/img/Frame3.png'}/>
        
        </div>
        <div className={styles.head}>
          Horse
        </div>
        <div className={styles.description}>
        <p>Earn FTR rewards by staking assets for market making</p>
        </div>
        <button className={styles.button1} />
      </div>
      <div className={styles.details_small}>
      <div className={styles.image}>
        <img src={'/img/Frame4.png'}/>
        
        </div>
        <div className={styles.head}>
          Horse
        </div>
        <div className={styles.description}>
        <p>Earn FTR rewards by staking assets for market making</p>
        </div>
        <button className={styles.button1}/>
      </div>
      </div>
      
    </div>
   


  )
}

