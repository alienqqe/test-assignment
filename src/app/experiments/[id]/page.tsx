import React from 'react'
import Chart from './components/Chart'

interface PropsType {
  params: {
    value: string
  }
}

const page = ({ params }: PropsType) => {
  return (
    <div className='d-flex align-items-center justify-content-center'>
      <Chart params={params} />
    </div>
  )
}

export default page
