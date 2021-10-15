import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import moment from 'moment';
import styles from '../../styles/NextBattle.module.css'

function useStyle(s) {
  return (...args) => {
    return args.map(arg=>s[arg]).join(' ');
  }
}








export default function quickSelect(props) {

  
  const {route} = useRouter();
  const css = useStyle(styles);
 

  return (
    <div className={styles.container}>
      <div>TEST</div>
    </div>

  )
}

