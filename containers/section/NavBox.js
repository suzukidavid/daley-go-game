import Link from 'next/link'
import { useRouter } from "next/router";
import styles from '../../styles/NavBox.module.css'

const links = [
  {label: 'Home', href: '/'},
  {label: 'Battle', href: '/battle'},
  {label: 'Next Battle', href: '/next-battle'},
  {label: 'Results', href: '/results'},
  {label: 'Winnings', href: '/winnings'},
]

export default function NavBox(props) {
  const {route} = useRouter();
  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        {links.map((link,i)=>(
        <div className={route == link.href ? [styles.menuBox,styles.active].join(' ') : styles.menuBox} key={i}>
          { route == link.href ? (
            <div className={styles.menuItem}>
                {link.label}
            </div>
          ) : (
            <div className={styles.menuItem}>
              <Link href={link.href}>
                <a className={styles.link}>
                {link.label}
                </a>
              </Link>
            </div>
          )}
        </div>
        ))}
      </div>
    </div>
  )
}