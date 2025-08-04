import LoadCSV from './components/LoadCSV'
import ReadCSV from './components/ReadCSV'

export default function Home() {
  return (
    <div className='vw-100 vh-100 d-flex align-items-center justify-content-center flex-column'>
      <LoadCSV />
      <ReadCSV />
    </div>
  )
}
