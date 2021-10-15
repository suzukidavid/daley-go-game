import styles from '../styles/PageLayout.module.css'

export default function PageLayout({children}) {
  return (
    <div className={styles.page}>
      {children}
    </div>
  )
}