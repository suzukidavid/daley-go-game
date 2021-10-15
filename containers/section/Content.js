import styles from '../../styles/Content.module.css'

export default function Content({children}) {
  return (
    <div className={styles.contentContainer}>
      {children}
    </div>
  )
}